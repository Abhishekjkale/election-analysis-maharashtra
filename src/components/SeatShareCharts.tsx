import React, { useState } from 'react';
import { CandidateResult, ALLIANCE_COLORS, PARTY_COLORS } from '../data/maharashtraData';
import { BarChart3, PieChart, Layers, HelpCircle } from 'lucide-react';

interface SeatShareChartsProps {
  candidates: CandidateResult[];
  majorityMark: number;
}

export const SeatShareCharts: React.FC<SeatShareChartsProps> = ({
  candidates,
  majorityMark,
}) => {
  const [activeTab, setActiveTab] = useState<'alliance' | 'party' | 'seat_bonus'>('alliance');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const totalSeats = candidates.length;

  // Group by Alliance
  const allianceMap: Record<string, { seats: number; votes: number }> = {};
  candidates.forEach((c) => {
    if (!allianceMap[c.Alliance]) {
      allianceMap[c.Alliance] = { seats: 0, votes: 0 };
    }
    allianceMap[c.Alliance].seats += 1;
    allianceMap[c.Alliance].votes += c.Total_Votes;
  });

  const allianceList = Object.entries(allianceMap)
    .map(([alliance, data]) => ({
      name: alliance,
      seats: data.seats,
      pct: totalSeats > 0 ? (data.seats / totalSeats) * 100 : 0,
      votes: data.votes,
    }))
    .sort((a, b) => b.seats - a.seats);

  // Group by Party
  const partyMap: Record<string, { seats: number; alliance: string; votes: number }> = {};
  candidates.forEach((c) => {
    if (!partyMap[c.Party]) {
      partyMap[c.Party] = { seats: 0, alliance: c.Alliance, votes: 0 };
    }
    partyMap[c.Party].seats += 1;
    partyMap[c.Party].votes += c.Total_Votes;
  });

  const partyList = Object.entries(partyMap)
    .map(([party, data]) => ({
      name: party,
      seats: data.seats,
      pct: totalSeats > 0 ? (data.seats / totalSeats) * 100 : 0,
      alliance: data.alliance,
      votes: data.votes,
    }))
    .sort((a, b) => b.seats - a.seats);

  const maxAllianceSeats = Math.max(...allianceList.map((a) => a.seats), 1);
  const maxPartySeats = Math.max(...partyList.map((p) => p.seats), 1);

  // Total votes across selection
  const totalVotesPolled = candidates.reduce((sum, c) => sum + c.Total_Votes, 0);

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6">
      {/* Header and Tab Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-500" />
            Seat Share & Alliance Dynamics
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive distribution of legislative strength across Maharashtra Assembly segments
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
          <button
            onClick={() => setActiveTab('alliance')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'alliance'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-amber-500" />
            By Alliance
          </button>
          <button
            onClick={() => setActiveTab('party')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'party'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
            By Party
          </button>
          <button
            onClick={() => setActiveTab('seat_bonus')}
            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'seat_bonus'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            Vote vs Seat Share
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="pt-6">
        {totalSeats === 0 ? (
          <div className="text-center py-12 text-slate-400">
            No election data matching your filter criteria.
          </div>
        ) : activeTab === 'alliance' ? (
          /* Alliance View */
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Alliance Bars */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                  <span>Alliance Block</span>
                  <span>Seats Won (Share %)</span>
                </div>
                {allianceList.map((item) => {
                  const color = ALLIANCE_COLORS[item.name] || '#7F7F7F';
                  const widthPct = (item.seats / maxAllianceSeats) * 100;
                  const isHovered = hoveredItem === item.name;

                  return (
                    <div
                      key={item.name}
                      onMouseEnter={() => setHoveredItem(item.name)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`p-3 rounded-xl transition-all border ${
                        isHovered
                          ? 'border-slate-300 bg-slate-50/80 shadow-xs'
                          : 'border-transparent bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-sm font-semibold mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-sm shadow-xs"
                            style={{ backgroundColor: color }}
                          />
                          <span className="text-slate-900">{item.name}</span>
                          <span className="text-xs text-slate-400 font-normal">
                            {item.name === 'Mahayuti'
                              ? '(BJP, SHS, NCP)'
                              : item.name === 'MVA'
                              ? '(INC, SS-UBT, NCP-SP)'
                              : '(Independents & smaller parties)'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1.5 font-mono">
                          <span className="text-base font-extrabold text-slate-900">
                            {item.seats}
                          </span>
                          <span className="text-xs text-slate-500">
                            ({item.pct.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {/* Bar Representation */}
                      <div className="w-full bg-slate-200/70 h-5 rounded-md overflow-hidden relative">
                        <div
                          className="h-full rounded-md transition-all duration-500 relative flex items-center justify-end pr-2 text-[11px] font-bold text-white"
                          style={{
                            width: `${Math.max(widthPct, 6)}%`,
                            backgroundColor: color,
                          }}
                        >
                          {item.seats}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Alliance Proportions & Majority Mark */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Assembly Balance
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Total Contested Seats:</span>
                      <span className="font-bold text-slate-900 font-mono">{totalSeats}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Majority Threshold:</span>
                      <span className="font-bold text-emerald-600 font-mono">{majorityMark} seats</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">Mahayuti Strike Margin:</span>
                      <span className="font-bold text-amber-600 font-mono">
                        {(allianceMap['Mahayuti']?.seats || 0) >= majorityMark
                          ? `+${(allianceMap['Mahayuti']?.seats || 0) - majorityMark} over majority`
                          : 'Under majority threshold'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 leading-relaxed">
                  💡 <b className="text-slate-700">Analyst Note:</b> The 2024 Maharashtra verdict
                  delivered a clear legislative majority to Mahayuti, driven by strong seat conversion
                  in MMR, Vidarbha, and Western Maharashtra.
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === 'party' ? (
          /* Party View */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
              <span>Political Party</span>
              <span>Alliance / Seats Won</span>
            </div>
            {partyList.map((item) => {
              const partyColor = PARTY_COLORS[item.name] || ALLIANCE_COLORS[item.alliance] || '#7F7F7F';
              const widthPct = (item.seats / maxPartySeats) * 100;
              const isHovered = hoveredItem === item.name;

              return (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredItem(item.name)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={`p-2.5 rounded-lg transition-all border ${
                    isHovered
                      ? 'border-slate-300 bg-slate-50 shadow-xs'
                      : 'border-transparent bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-xs"
                        style={{ backgroundColor: partyColor }}
                      />
                      <span className="text-slate-900 font-bold">{item.name}</span>
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: `${ALLIANCE_COLORS[item.alliance]}20`,
                          color: ALLIANCE_COLORS[item.alliance],
                        }}
                      >
                        {item.alliance}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-sm font-bold text-slate-900">
                        {item.seats}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({item.pct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-200/60 h-4 rounded-sm overflow-hidden">
                    <div
                      className="h-full rounded-sm transition-all duration-500"
                      style={{
                        width: `${Math.max(widthPct, 2)}%`,
                        backgroundColor: partyColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Vote Share vs Seat Share (Seat Bonus / FPTP effect from Notebook Section 3) */
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left">Alliance</th>
                    <th className="px-4 py-3 text-right">Total Votes</th>
                    <th className="px-4 py-3 text-right">Vote Share %</th>
                    <th className="px-4 py-3 text-right">Seats Won</th>
                    <th className="px-4 py-3 text-right">Seat Share %</th>
                    <th className="px-4 py-3 text-right">Seat Bonus (pp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {allianceList.map((item) => {
                    const voteSharePct = totalVotesPolled > 0 ? (item.votes / totalVotesPolled) * 100 : 0;
                    const seatBonus = item.pct - voteSharePct;
                    const color = ALLIANCE_COLORS[item.name] || '#7F7F7F';

                    return (
                      <tr key={item.name} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          {item.name}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-slate-600">
                          {item.votes.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                          {voteSharePct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {item.seats}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-slate-800">
                          {item.pct.toFixed(2)}%
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold">
                          <span
                            className={`px-2 py-0.5 rounded-md ${
                              seatBonus >= 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {seatBonus >= 0 ? `+${seatBonus.toFixed(2)}%` : `${seatBonus.toFixed(2)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <b>First-Past-The-Post (FPTP) Seat Bonus:</b> In FPTP electoral systems, the leading alliance typically secures a higher percentage of assembly seats than its raw statewide vote share. The positive seat bonus represents the conversion efficiency of broad geographical vote distribution into plurality victories.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
