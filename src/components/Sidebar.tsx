import React from 'react';
import { Upload, RotateCcw, Filter, FileText, CheckCircle2 } from 'lucide-react';
import { DISTRICTS_LIST } from '../data/maharashtraData';

interface SidebarProps {
  selectedDistrict: string;
  setSelectedDistrict: (val: string) => void;
  selectedAlliance: string;
  setSelectedAlliance: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  onFileUpload: (file: File) => void;
  onResetData: () => void;
  totalFiltered: number;
  totalAvailable: number;
  fileName: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedDistrict,
  setSelectedDistrict,
  selectedAlliance,
  setSelectedAlliance,
  searchQuery,
  setSearchQuery,
  onFileUpload,
  onResetData,
  totalFiltered,
  totalAvailable,
  fileName,
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside className="w-full md:w-80 bg-slate-900 text-slate-100 p-5 flex flex-col gap-6 shrink-0 border-r border-slate-800 shadow-xl">
      {/* Brand Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-xl shadow-inner">
          🗳️
        </div>
        <div>
          <h2 className="text-base font-bold tracking-tight text-white leading-tight">
            Election Navigator
          </h2>
          <p className="text-xs text-slate-400">2024 Maharashtra Assembly</p>
        </div>
      </div>

      {/* CSV File Upload Section */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Upload Election CSV</span>
          {fileName && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Active
            </span>
          )}
        </label>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700 hover:border-amber-500/60 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-800/40 hover:bg-slate-800/70 group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv"
            className="hidden"
          />
          <Upload className="w-6 h-6 text-slate-400 group-hover:text-amber-400 mx-auto mb-2 transition-transform group-hover:-translate-y-0.5" />
          <p className="text-xs font-medium text-slate-200">
            {fileName ? fileName : 'Drag & drop .csv or browse'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports official ECI & custom schemas
          </p>
        </div>

        {fileName && (
          <button
            onClick={onResetData}
            className="w-full text-xs text-amber-400 hover:text-amber-300 py-1.5 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reload Default 288-Seat Dataset
          </button>
        )}
      </div>

      {/* Dynamic Dropdown Filters */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <span>Interactive Filters</span>
        </div>

        {/* District Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Select District
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="All Districts">All Districts (36 Regions)</option>
            {DISTRICTS_LIST.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
        </div>

        {/* Alliance Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Select Alliance
          </label>
          <select
            value={selectedAlliance}
            onChange={(e) => setSelectedAlliance(e.target.value)}
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer"
          >
            <option value="All Alliances">All Alliances</option>
            <option value="Mahayuti">Mahayuti (BJP + SHS + NCP)</option>
            <option value="MVA">MVA (INC + SS-UBT + NCP-SP)</option>
            <option value="Others">Others / Independents</option>
          </select>
        </div>

        {/* Search Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300">
            Search Candidate / Constituency
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="e.g. Fadnavis, Baramati, Thane..."
            className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 placeholder-slate-500"
          />
        </div>
      </div>

      {/* Scope Tally Badge */}
      <div className="mt-auto pt-4 border-t border-slate-800 space-y-3">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Current Scope</span>
            <span className="font-bold text-amber-400 font-mono">
              {totalFiltered} / {totalAvailable} Seats
            </span>
          </div>
          <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(totalFiltered / totalAvailable) * 100}%` }}
            />
          </div>
        </div>

        {(selectedDistrict !== 'All Districts' ||
          selectedAlliance !== 'All Alliances' ||
          searchQuery) && (
          <button
            onClick={() => {
              setSelectedDistrict('All Districts');
              setSelectedAlliance('All Alliances');
              setSearchQuery('');
            }}
            className="w-full text-xs text-slate-300 hover:text-white py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" /> Reset All Filters
          </button>
        )}

        <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
          <FileText className="w-3 h-3" /> 288 Vidhan Sabha Constituencies
        </div>
      </div>
    </aside>
  );
};
