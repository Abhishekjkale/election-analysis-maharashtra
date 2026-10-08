import React, { useState, useMemo } from 'react';
import { CandidateResult, ALLIANCE_COLORS, PARTY_COLORS } from '../data/maharashtraData';
import { Search, Download, ArrowUpDown, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react';

interface CandidatesTableProps {
  candidates: CandidateResult[];
}

export const CandidatesTable: React.FC<CandidatesTableProps> = ({ candidates }) => {
  const [tableSearch, setTableSearch] = useState('');
  const [sortField, setSortField] = useState<keyof CandidateResult>('Constituency_No');
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredData = useMemo(() => {
    if (!tableSearch.trim()) return candidates;
    const q = tableSearch.toLowerCase();
    return candidates.filter(
      (c) =>
        c.Candidate_Name.toLowerCase().includes(q) ||
        c.Constituency_Name.toLowerCase().includes(q) ||
        c.District.toLowerCase().includes(q) ||
        c.Party.toLowerCase().includes(q) ||
        c.Alliance.toLowerCase().includes(q)
    );
  }, [candidates, tableSearch]);

  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortAsc ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [filteredData, sortField, sortAsc]);

  const totalPages = Math.ceil(sortedData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page, pageSize]);

  const handleSort = (field: keyof CandidateResult) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
    setPage(1);
  };

  const downloadCSV = () => {
    const headers = [
      'Constituency_No',
      'Constituency_Name',
      'District',
      'Candidate_Name',
      'Party',
      'Alliance',
      'Total_Votes',
      'Margin',
      'Margin_Pct',
      'RunnerUp_Name',
      'RunnerUp_Party',
    ];
    const rows = sortedData.map((c) => [
      c.Constituency_No,
      `"${c.Constituency_Name}"`,
      `"${c.District}"`,
      `"${c.Candidate_Name}"`,
      c.Party,
      c.Alliance,
      c.Total_Votes,
      c.Margin,
      c.Margin_Pct,
      `"${c.RunnerUp_Name || ''}"`,
      `"${c.RunnerUp_Party || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'maharashtra_winners_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Top 5 Highest Margins
  const top5Highest = useMemo(() => {
    return [...candidates].sort((a, b) => b.Margin - a.Margin).slice(0, 5);
  }, [candidates]);

  // Top 5 Narrowest Margins
  const top5Narrowest = useMemo(() => {
    return [...candidates].sort((a, b) => a.Margin - b.Margin).slice(0, 5);
  }, [candidates]);

  return (
    <div className="space-y-6">
      {/* Search & Actions Bar */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              📋 Winning Candidates Directory
            </h3>
            <p className="text-xs text-slate-500">
              Searchable assembly roster with victory margins and runner-up details
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Box */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => {
                  setTableSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search candidates, seats..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            {/* Export CSV Button */}
            <button
              onClick={downloadCSV}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => handleSort('Constituency_No')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>AC #</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Constituency_Name')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Constituency</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('District')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>District</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Candidate_Name')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Winner Candidate</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Party')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Party</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Alliance')}
                  className="px-3 py-3 text-left cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center gap-1">
                    <span>Alliance</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Total_Votes')}
                  className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Votes</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Margin')}
                  className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Margin_Pct')}
                  className="px-3 py-3 text-right cursor-pointer hover:bg-slate-100/70 select-none"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Margin %</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                    No candidates found matching the query.
                  </td>
                </tr>
              ) : (
                paginatedData.map((c) => {
                  const allianceColor = ALLIANCE_COLORS[c.Alliance] || '#7F7F7F';
                  const partyColor = PARTY_COLORS[c.Party] || allianceColor;

                  return (
                    <tr
                      key={`${c.Constituency_No}-${c.Candidate_Name}`}
                      className="hover:bg-amber-50/30 transition-colors"
                    >
                      <td className="px-3 py-2.5 font-mono text-slate-500 font-semibold">
                        {c.Constituency_No}
                      </td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        {c.Constituency_Name}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">
                        {c.District}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-900">
                        {c.Candidate_Name}
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded text-[11px] font-bold text-white shadow-xs inline-block"
                          style={{ backgroundColor: partyColor }}
                        >
                          {c.Party}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold inline-block border"
                          style={{
                            borderColor: `${allianceColor}50`,
                            backgroundColor: `${allianceColor}15`,
                            color: allianceColor,
                          }}
                        >
                          {c.Alliance}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                        {c.Total_Votes.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-slate-900">
                        {c.Margin.toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-semibold">
                        <span
                          className={
                            c.Margin_Pct > 20
                              ? 'text-emerald-700'
                              : c.Margin_Pct < 5
                              ? 'text-amber-700 font-bold'
                              : 'text-slate-700'
                          }
                        >
                          {c.Margin_Pct.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between pt-4 text-xs text-slate-500">
          <div>
            Showing{' '}
            <b className="text-slate-800">
              {sortedData.length > 0 ? (page - 1) * pageSize + 1 : 0}
            </b>{' '}
            to{' '}
            <b className="text-slate-800">
              {Math.min(page * pageSize, sortedData.length)}
            </b>{' '}
            of <b className="text-slate-800">{sortedData.length}</b> constituencies
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-slate-700" />
            </button>
            <span className="px-2 font-mono font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="p-1.5 rounded-md border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-slate-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Margin Extremes Panels (Notebook Section 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top 5 Landslide Margins */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Top 5 Highest Victory Margins
              </h4>
              <p className="text-[11px] text-slate-500">
                Landslide mandates with largest vote leads
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {top5Highest.map((c, idx) => (
              <div
                key={c.Constituency_No}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      {c.Candidate_Name}{' '}
                      <span className="text-slate-500 font-normal">
                        ({c.Party})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.Constituency_Name} &bull; {c.District}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-900">
                    +{c.Margin.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-semibold">
                    {c.Margin_Pct.toFixed(1)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Narrowest Victories */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Top 5 Narrowest Victories (Photo-Finishes)
              </h4>
              <p className="text-[11px] text-slate-500">
                Razor-thin wins vulnerable to recount or vote split
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {top5Narrowest.map((c, idx) => (
              <div
                key={c.Constituency_No}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="font-bold text-slate-900">
                      {c.Candidate_Name}{' '}
                      <span className="text-slate-500 font-normal">
                        ({c.Party})
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {c.Constituency_Name} &bull; {c.District}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-rose-700">
                    +{c.Margin.toLocaleString()} votes
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {c.Margin_Pct.toFixed(2)}% margin
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
