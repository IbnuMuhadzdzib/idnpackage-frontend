import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Template_Siswa');

    // Setup columns with wide widths
    worksheet.columns = [
      { header: 'Nama', key: 'name', width: 35 },
      { header: 'Kamar', key: 'room', width: 25 },
      { header: 'NIS', key: 'nis', width: 20 },
      { header: '', key: 'empty', width: 5 }, // Spacer
      { header: 'Instruksi Pengisian', key: 'instructions', width: 60 }
    ];

    // Style the header row (Row 1)
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      
      // Color header depending on the column
      if (colNumber <= 3) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF143C9C' } }; // Blue header
      } else if (colNumber === 5) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF63DF8A' } }; // Green header
      }
    });
    headerRow.height = 30;

    // Add example rows and instructions
    worksheet.addRow({ name: 'Fadlan', room: 'Saung 1', nis: '12345', instructions: '1. "Nama" adalah nama lengkap siswa (Wajib isi).' });
    worksheet.addRow({ name: 'Afsar', room: 'Saung 2', nis: '12346', instructions: '2. "Kamar" adalah nama saung/asrama (Wajib isi, misal: Saung 1).' });
    worksheet.addRow({ name: 'Zahir', room: 'Kamar 1.1', nis: '12347', instructions: '3. "NIS" adalah nomor induk siswa (Opsional).' });
    worksheet.addRow({ instructions: '4. Jangan ubah nama kolom di baris paling atas (baris 1).' });
    worksheet.addRow({ instructions: '5. Anda bisa menghapus baris 2-4 ini dan menggantinya dengan data Anda.' });

    // Format instruction cells to wrap text
    for (let i = 2; i <= 6; i++) {
      const instCell = worksheet.getCell(`E${i}`);
      instCell.alignment = { vertical: 'top', wrapText: true };
      if (i > 4) worksheet.getRow(i).height = 25;
    }

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, 'Template_Data_Siswa.xlsx');
  };

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Asumsi format excel: Nama, Kamar, NIS
        const formattedData = data.map((row: any) => ({
          name: row['Nama'] || row['name'] || row['Nama Siswa'] || '',
          roomName: row['Kamar'] || row['room'] || row['Saung'] || row['Asrama'] || '',
          nis: row['NIS'] || row['nis'] || '',
        })).filter(item => item.name && item.roomName);

        if (formattedData.length === 0) {
          setError("Data kosong atau format kolom tidak sesuai. Pastikan ada kolom 'Nama' dan 'Kamar'.");
        } else {
          setError(null);
          setDataPreview(formattedData);
        }
      } catch (err) {
        setError("Gagal membaca file Excel. Pastikan format valid.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleImport = async () => {
    if (dataPreview.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/students/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ students: dataPreview }),
      });

      if (!res.ok) {
        throw new Error('Gagal melakukan import data.');
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan server");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <h2 className="font-bold text-gray-800 dark:text-white">Import Data Siswa (Excel/CSV)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <div className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden group">
            {/* Dekorasi latar belakang untuk kesan premium */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none transition-all group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30"></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
              <div>
                <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Belum punya formatnya?</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Unduh template Excel resmi untuk mempermudah pengisian data.</p>
              </div>
              <button 
                onClick={handleDownloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 dark:from-slate-700 dark:to-slate-600 dark:hover:from-slate-600 dark:hover:to-slate-500 text-[#143C9C] dark:text-blue-300 font-semibold text-xs rounded-lg transition-all shadow-sm hover:shadow active:scale-95 border border-blue-200/50 dark:border-slate-600 w-full md:w-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Template
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3 text-gray-800 dark:text-white">Upload File Data Siswa</label>
            <div className="relative border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-center group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="mx-auto w-12 h-12 mb-3 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center text-[#143C9C] dark:text-blue-400 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Klik untuk memilih file Excel (.xlsx, .csv)
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Atau seret & letakkan file di sini</p>
              
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
            </div>
          </div>

          {dataPreview.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-sm mb-2 dark:text-white">Preview Data ({dataPreview.length} Siswa)</h3>
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">No</th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Nama</th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Kamar/Asrama</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-slate-700">
                        <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2 dark:text-gray-200">{row.name}</td>
                        <td className="px-4 py-2 dark:text-gray-200">{row.roomName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
          >
            Batal
          </button>
          <button 
            onClick={handleImport}
            disabled={dataPreview.length === 0 || isSubmitting}
            className="px-6 py-2 bg-[#143C9C] hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-md flex items-center gap-2"
          >
            {isSubmitting ? 'Menyimpan...' : 'Import Data'}
          </button>
        </div>
      </div>
    </div>
  );
};
