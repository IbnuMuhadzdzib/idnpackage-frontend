import React, { useState, useRef, useEffect } from 'react';

/**
 * Opsi yang tersedia dalam CustomDropdown
 */
interface DropdownOption {
  value: string;
  label: string;
}

/**
 * Properti untuk komponen CustomDropdown
 */
interface CustomDropdownProps {
  /** Daftar opsi dropdown */
  options: DropdownOption[];
  /** Nilai yang saat ini terpilih */
  value: string;
  /** Fungsi callback ketika nilai berubah */
  onChange: (value: string) => void;
  /** Teks placeholder jika tidak ada nilai yang terpilih */
  placeholder?: string;
  /** Menentukan apakah dropdown dinonaktifkan */
  disabled?: boolean;
}

/**
 * Komponen Dropdown Kustom dengan gaya UI yang disesuaikan.
 * Mendukung dark mode dan pemilihan item tunggal.
 *
 * @param {CustomDropdownProps} props - Properti komponen
 * @returns {JSX.Element} Komponen CustomDropdown
 */
export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder = "Pilih...", disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm text-left text-gray-800 dark:text-white focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500 focus:ring-2 focus:ring-[#143C9C]/10 transition-all flex items-center justify-between ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-500'}`}
      >
        <span className={selectedOption ? '' : 'text-gray-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg shadow-xl overflow-hidden py-1 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          {options.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500 italic text-center">
              Tidak ada data
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                  value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-[#143C9C] dark:text-blue-400 font-medium' 
                    : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50'
                }`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
                {value === option.value && (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
