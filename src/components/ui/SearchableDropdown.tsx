import React, { useState, useEffect, useRef } from 'react';

export interface Option {
  value: string;
  label: string;
  type?: 'student' | 'employee';
  roomId?: number;
}

interface SearchableDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string, option?: Option) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Pilih atau cari...',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className={`w-full px-3 py-2.5 bg-white dark:bg-slate-800 border rounded-lg text-sm flex items-center justify-between cursor-pointer transition-all ${
          disabled
            ? 'opacity-60 cursor-not-allowed border-gray-200 dark:border-slate-700'
            : isOpen
            ? 'border-[#143C9C] dark:border-blue-500 ring-2 ring-[#143C9C]/10'
            : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span
          className={`truncate ${
            selectedOption ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100 dark:border-slate-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama..."
              className="w-full px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-sm focus:outline-none focus:border-[#143C9C] dark:focus:border-blue-500"
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                    opt.value === value
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-[#143C9C] dark:text-blue-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    onChange(opt.value, opt);
                    setIsOpen(false);
                    setSearch('');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span>{opt.label}</span>
                    {opt.type && (
                      <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {opt.type === 'student' ? 'Santri' : 'Staff'}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-sm text-gray-500">
                <p>Nama tidak ada di list.</p>
                <p className="mt-1 text-xs">Pastikan nama terdaftar, atau tambah nama di menu admin?</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
