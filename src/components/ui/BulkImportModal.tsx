import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { API_URL } from '../../api/config';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const ResetAllButton: React.FC<{
  onSuccess?: () => void;
  onError: (msg: string) => void;
  onSuccessMessage: (msg: string) => void;
}> = ({ onSuccess, onError, onSuccessMessage }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/students/reset-all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Gagal mereset data');

      const deleted = data?.data?.deleted ?? data?.deleted ?? 0;
      onSuccessMessage(`Reset berhasil! ${deleted} santri aktif telah dihapus.`);
      onSuccess?.();
      setShowConfirm(false);
    } catch (err: any) {
      onError(err.message || 'Gagal melakukan reset. Pastikan Anda login sebagai Admin.');
    } finally {
      setIsResetting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 animate-in fade-in slide-in-from-left-2">
        <p className="text-xs text-red-700 dark:text-red-400 font-medium">Hapus permanen semua santri aktif?</p>
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
        >
          {isResetting ? 'Menghapus...' : 'Ya, Reset!'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="px-3 py-1 text-gray-600 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
        >
          Batal
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 group"
    >
      <svg className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Reset Tahun Ajaran
    </button>
  );
};

export const BulkImportModal: React.FC<BulkImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [importType, setImportType] = useState<'student' | 'employee'>('student');
  const [dataPreview, setDataPreview] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ added: number; updated: number; skipped: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTypeChange = (type: 'student' | 'employee') => {
    setImportType(type);
    setDataPreview([]);
    setError(null);
    setSuccessMsg(null);
    setImportResult(null);
  };

  const handleDownloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const workbook = new ExcelJS.Workbook();
      const worksheetName = `Template_${importType === 'student' ? 'Siswa' : 'Staff'}`;
      const worksheet = workbook.addWorksheet(worksheetName);

      // Definisikan border style yang profesional
      const borderStyle = {
        top: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        left: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        bottom: { style: 'thin', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFBFBFBF' } }
      } as Partial<ExcelJS.Borders>;

      let emptyRowsCount = 10; // Jumlah baris kosong diformat untuk user mengetik

      if (importType === 'student') {
        const res = await fetch(`${API_URL}/rooms`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await res.json();
        const rooms = Array.isArray(resData) ? resData : (Array.isArray(resData?.data) ? resData.data : []);
        const roomNames = rooms.map((r: any) => r.name);

        worksheet.columns = [
          { header: 'Nama', key: 'name', width: 35 },
          { header: 'Kamar', key: 'room', width: 28 },
          { header: 'NIS', key: 'nis', width: 25 },
          { header: '', key: 'empty', width: 3 },
          { header: 'Instruksi Pengisian Data Santri', key: 'instructions', width: 55 }
        ];

        if (roomNames.length > 0) {
          const roomListStr = `"${roomNames.join(',')}"`;
          (worksheet as any).dataValidations.add('B2:B1000', {
            type: 'list',
            allowBlank: true,
            showErrorMessage: true,
            errorTitle: 'Kamar Tidak Valid',
            error: 'Silakan pilih kamar dari dropdown yang tersedia.',
            formulae: [roomListStr]
          });
        }

        worksheet.addRow({ name: 'Fadlan (Contoh)', room: roomNames[0] || 'Saung 8', nis: '12345', instructions: '1. "Nama" wajib diisi dengan nama lengkap.' });
        worksheet.addRow({ name: 'Afsar (Contoh)', room: roomNames[1] || 'Saung 6', nis: '12346', instructions: '2. "Kamar" wajib dipilih dari dropdown.' });
        worksheet.addRow({ name: 'Zahir (Contoh)', room: roomNames[2] || 'Saung 8', nis: '12347', instructions: '3. "NIS" (opsional) untuk nomor induk.' });
      } else {
        worksheet.columns = [
          { header: 'Nama', key: 'name', width: 35 },
          { header: 'Divisi', key: 'division', width: 28 },
          { header: 'Jabatan', key: 'position', width: 25 },
          { header: '', key: 'empty', width: 3 },
          { header: 'Instruksi Pengisian Data Staff', key: 'instructions', width: 55 }
        ];

        worksheet.addRow({ name: 'Beni Fitriyanto (Contoh)', division: 'Sekolah', position: 'Kepala Sekolah', instructions: '1. "Nama" wajib diisi dengan nama lengkap.' });
        worksheet.addRow({ name: 'Suhaimy Rizwan (Contoh)', division: 'Asrama', position: 'Musyrif', instructions: '2. "Divisi" wajib diisi sesuai penempatan.' });
        worksheet.addRow({ name: 'Andi Kobra (Contoh)', division: 'Dapur', position: 'Koki', instructions: '3. "Jabatan" (opsional) dapat dikosongkan.' });
      }

      // Tambahkan instruksi sisa di baris ke 5 dan 6
      worksheet.getCell('E5').value = '4. Baris (Contoh) di atas boleh dihapus/ditimpa.';
      worksheet.getCell('E6').value = '5. Jangan merubah judul kolom pada baris 1.';

      // Styling Header (Baris 1)
      const headerRow = worksheet.getRow(1);
      headerRow.height = 35;
      headerRow.eachCell((cell, colNumber) => {
        cell.font = { name: 'Calibri', bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };

        // Kolom Data (A, B, C)
        if (colNumber <= 3) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF143C9C' } }; // Biru IDN
          cell.border = borderStyle;
        }
        // Kolom Instruksi (E)
        else if (colNumber === 5) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0F766E' } }; // Teal
          cell.border = borderStyle;
        }
      });

      // Tambahkan baris kosong diformat agar template rapi
      for (let i = 0; i < emptyRowsCount; i++) {
        worksheet.addRow({});
      }

      const totalRows = 4 + emptyRowsCount;

      // Styling Baris Data dan Instruksi
      for (let i = 2; i <= totalRows; i++) {
        const row = worksheet.getRow(i);
        row.height = 25; // Tinggi baris yang nyaman

        // Styling Kolom Data (A, B, C)
        for (let col = 1; col <= 3; col++) {
          const cell = row.getCell(col);
          cell.border = borderStyle;
          cell.font = { name: 'Calibri', size: 11, color: { argb: 'FF333333' } };
          cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1 };

          // Beri warna latar abu-abu sangat muda untuk baris contoh
          if (i <= 4) {
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        }

        // Styling Kolom Instruksi (E)
        const instCell = row.getCell(5);
        if (i <= 6) {
          instCell.border = borderStyle;
          instCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0FDF4' } }; // Latar hijau sgt muda
          instCell.font = { name: 'Calibri', size: 11, italic: true, color: { argb: 'FF065F46' } };
          instCell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, `Template_Data_${importType === 'student' ? 'Siswa' : 'Staff'}.xlsx`);
    } catch (err) {
      console.error("Gagal mendownload template:", err);
      setError("Gagal mendownload template. Pastikan koneksi internet stabil.");
    }
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

        let formattedData = [];

        if (importType === 'student') {
          formattedData = data.map((row: any) => ({
            name: String(row['Nama'] || row['name'] || row['Nama Siswa'] || '').trim(),
            roomName: String(row['Kamar'] || row['room'] || row['Saung'] || row['Asrama'] || '').trim(),
            nis: row['NIS'] || row['nis'] ? String(row['NIS'] || row['nis']).trim() : '',
          })).filter((item: any) => item.name && item.roomName);

          if (formattedData.length === 0) {
            setError("Data kosong atau format kolom tidak sesuai. Pastikan ada kolom 'Nama' dan 'Kamar'.");
            return;
          }
        } else {
          formattedData = data.map((row: any) => ({
            name: String(row['Nama'] || row['name'] || row['Nama Staff'] || '').trim(),
            division: String(row['Divisi'] || row['division'] || '').trim(),
            position: row['Jabatan'] || row['position'] ? String(row['Jabatan'] || row['position']).trim() : '',
          })).filter((item: any) => item.name && item.division);

          if (formattedData.length === 0) {
            setError("Data kosong atau format kolom tidak sesuai. Pastikan ada kolom 'Nama' dan 'Divisi'.");
            return;
          }
        }

        setError(null);
        setDataPreview(formattedData);
      } catch (err) {
        setError("Gagal membaca file Excel. Pastikan format valid.");
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleImport = async () => {
    if (dataPreview.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    setImportResult(null);

    try {
      const token = localStorage.getItem('token');
      const endpoint = importType === 'student' ? '/students/bulk' : '/employees/bulk';
      const payloadKey = importType === 'student' ? 'students' : 'employees';

      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [payloadKey]: dataPreview }),
      });

      const resData = await res.json();

      if (!res.ok) {
        let errorMsg = 'Gagal melakukan import data.';
        if (resData?.message) {
          errorMsg = Array.isArray(resData.message) ? resData.message.join(', ') : resData.message;
        }
        throw new Error(errorMsg);
      }

      const result = resData?.data || resData;
      setImportResult({
        added: result.added ?? 0,
        updated: result.updated ?? 0,
        skipped: result.skipped ?? 0,
      });
      setDataPreview([]);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan server');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800">
          <h2 className="font-bold text-gray-800 dark:text-white">Import Data (Excel/CSV)</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => handleTypeChange('student')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${importType === 'student'
                  ? 'bg-white dark:bg-slate-700 text-[#143C9C] dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
            >
              Data Santri
            </button>
            <button
              onClick={() => handleTypeChange('employee')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${importType === 'employee'
                  ? 'bg-white dark:bg-slate-700 text-[#143C9C] dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
            >
              Data Staff & Guru
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800 animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg text-sm border border-green-200 dark:border-green-800 animate-in fade-in slide-in-from-top-2">
              {successMsg}
            </div>
          )}

          <div className="mb-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 shadow-sm relative overflow-hidden group">
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
            <label className="block text-sm font-semibold mb-3 text-gray-800 dark:text-white">
              Upload File Data {importType === 'student' ? 'Santri' : 'Staff/Guru'}
            </label>
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
              <h3 className="font-semibold text-sm mb-2 dark:text-white">Preview Data ({dataPreview.length} Baris)</h3>
              <div className="border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">No</th>
                      <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Nama</th>
                      {importType === 'student' ? (
                        <>
                          <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Kamar/Asrama</th>
                          <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">NIS</th>
                        </>
                      ) : (
                        <>
                          <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Divisi</th>
                          <th className="px-4 py-2 font-medium text-gray-600 dark:text-gray-300">Jabatan</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {dataPreview.map((row, idx) => (
                      <tr key={idx} className="border-t border-gray-100 dark:border-slate-700">
                        <td className="px-4 py-2 text-gray-500">{idx + 1}</td>
                        <td className="px-4 py-2 dark:text-gray-200">{row.name}</td>
                        {importType === 'student' ? (
                          <>
                            <td className="px-4 py-2 dark:text-gray-200">{row.roomName}</td>
                            <td className="px-4 py-2 text-gray-400 dark:text-gray-400 text-xs">{row.nis || '-'}</td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-2 dark:text-gray-200">{row.division}</td>
                            <td className="px-4 py-2 text-gray-400 dark:text-gray-400 text-xs">{row.position || '-'}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {importResult && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                Import selesai!
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-green-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{importResult.added}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Ditambahkan</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-blue-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{importResult.updated}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Diperbarui</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-3 text-center border border-gray-100 dark:border-slate-700">
                  <p className="text-2xl font-bold text-gray-400">{importResult.skipped}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Dilewati</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800 flex items-center justify-between gap-3">
          <ResetAllButton
            onSuccess={onSuccess}
            onError={setError}
            onSuccessMessage={setSuccessMsg}
          />

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              {importResult ? 'Tutup' : 'Batal'}
            </button>
            {!importResult && (
              <button
                onClick={handleImport}
                disabled={dataPreview.length === 0 || isSubmitting}
                className="px-6 py-2 bg-[#143C9C] hover:bg-blue-800 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors shadow-md flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Menyimpan...
                  </>
                ) : 'Sinkronisasi Data'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
