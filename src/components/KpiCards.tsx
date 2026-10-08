import React from 'react';
import { CandidateResult, ALLIANCE_COLORS } from '../data/maharashtraData';
import { Award, Trophy, Users, TrendingUp } from 'lucide-react';

interface KpiCardsProps {
  candidates: CandidateResult[];
  totalSeats: number;
  majorityMark: number;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  candidates,
  totalSeats,
  majorityMark,
}) => {
  const totalDecided = candidates.length;

  // Leading Alliance
  const allianceCounts: Record<string, number> = {};
  candidates.forEach((c) => {
    allianceCounts[c.Alliance] = (allianceCounts[c.Alliance] || 0) + 1;
  });

  const sortedAlliances = Object.entries(allianceCounts).sort((a, b) => b[1] - a[1]);
  const leadingAlliance = sortedAlliances[0] ? sortedAlliances[0][0] : 'None';
  const leadingSeats = sortedAlliances[0] ? sortedAlliances[0][1] : 0;
  const leadingPct = totalDecided > 0 ? ((leadingSeats / totalDecided) * 100).toFixed(1) : '0';

  // Highest Margin
  const highestMarginCandidate = candidates.length > 0
    ? candidates.reduce((prev, current) => (prev.Margin > current.Margin ? prev : current))
    : null;

  // Average Margin
  const avgMargin = totalDecided > 0
    ? Math.round(candidates.reduce((sum, c) => sum + c.Margin, 0) / totalDecided)
    : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Seats Decided */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total Seats Decided
          </span>
          <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {totalDecided}
          </span>
          <span className="text-xs text-slate-400">/ {totalSeats}</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Majority threshold: <b className="text-slate-800">{majorityMark} seats</b></span>
        </div>
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600" />
      </div>

      {/* 2. Leading Alliance */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Leading Alliance
          </span>
          <div
            className="p-2 rounded-lg text-white group-hover:scale-105 transition-transform"
            style={{ backgroundColor: ALLIANCE_COLORS[leadingAlliance] || '#F28C28' }}
          >
            <Trophy className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {leadingAlliance}
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: ALLIANCE_COLORS[leadingAlliance] || '#F28C28' }}
          >
            {leadingSeats} seats
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span className="text-emerald-600 font-semibold">{leadingPct}%</span>
          <span>of currently filtered selection</span>
        </div>
        <div
          className="absolute top-0 right-0 h-1 w-full"
          style={{ backgroundColor: ALLIANCE_COLORS[leadingAlliance] || '#F28C28' }}
        />
      </div>

      {/* 3. Highest Margin */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Highest Victory Margin
          </span>
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {highestMarginCandidate ? highestMarginCandidate.Margin.toLocaleString() : '0'}
          </span>
          <span className="text-xs text-slate-400">votes</span>
        </div>
        <div className="mt-3 text-xs text-slate-600 truncate font-medium">
          {highestMarginCandidate ? (
            <span title={`${highestMarginCandidate.Candidate_Name} (${highestMarginCandidate.Party})`}>
              {highestMarginCandidate.Candidate_Name} <b className="text-slate-800">({highestMarginCandidate.Party})</b> &bull; {highestMarginCandidate.Constituency_Name}
            </span>
          ) : (
            'N/A'
          )}
        </div>
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-600" />
      </div>

      {/* 4. Average Victory Margin */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Average Victory Margin
          </span>
          <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
            {avgMargin.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">votes</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 font-medium">
          <span>Spread across {totalDecided} contested seats</span>
        </div>
        <div className="absolute top-0 right-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-teal-600" />
      </div>
    </div>
  );
};
