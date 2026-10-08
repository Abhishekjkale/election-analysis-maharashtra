import React, { useMemo } from 'react';
import { CandidateResult, ALLIANCE_COLORS, PARTY_COLORS } from '../data/maharashtraData';
import { AlertTriangle, TrendingDown, Target, Info } from 'lucide-react';

interface SpoilerAnalysisTabProps {
  candidates: CandidateResult[];
}

export const SpoilerAnalysisTab: React.FC<SpoilerAnalysisTabProps> = ({ candidates }) => {
  // Compute spoiler constituencies based on Notebook Section 5
  const spoilerData = useMemo(() => {
    return candidates
      .filter((c) => {
        const thirdVotes = c.Third_Votes || 0;
        return thirdVotes > c.Margin && c.Margin > 0;
      })
      .map((c) => {
        const thirdVotes = c.Third_Votes || 0;
        const ratio = c.Margin > 0 ? (thirdVotes / c.Margin).toFixed(2) : '0';
        return {
          ...c,
          Spoiler_Votes: thirdVotes,
          Spoiler_Candidate: c.Third_Name || 'Third Contestant',
          Spoiler_Party: c.Third_Party || 'IND',
          Spoiler_Ratio: parseFloat(ratio),
        };
      })
      .sort((a, b) => a.Margin - b.Margin);
  }, [candidates]);

  // Alliance exposure breakdown
  const exposureSummary = useMemo(() => {
    const wonWithSpoiler: Record<string, number> = { Mahayuti: 0, MVA: 0, Others: 0 };
    const lostByRunnerWithSpoiler: Record<string, number> = { Mahayuti: 0, MVA: 0, Others: 0 };

    spoilerData.forEach((s) => {
      wonWithSpoiler[s.Alliance] = (wonWithSpoiler[s.Alliance] || 0) + 1;
      const runnerAlliance = s.RunnerUp_Alliance || 'Others';
      lostByRunnerWithSpoiler[runnerAlliance] = (lostByRunnerWithSpoiler[runnerAlliance] || 0) + 1;
    });

    return { wonWithSpoiler, lostByRunnerWithSpoiler };
  }, [spoilerData]);

  const totalSeats = candidates.length;
  const spoilerPct = totalSeats > 0 ? ((spoilerData.length / totalSeats) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4">
        <div className="p-2 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 mt-0.5">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Spoiler Effect & Vote-Splitting Analysis (Jupyter Notebook Section 5)
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            A constituency exhibits a <b>potential spoiler effect</b> when the victory margin is smaller than
            the votes polled by a non-top-two contestant (3rd-place candidate or prominent Independent).
            This reveals tight contests where vote division directly impacted the electoral outcome.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Spoiler-Affected Seats
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {spoilerData.length}
            </span>
            <span className="text-xs text-slate-400">/ {totalSeats}</span>
          </div>
          <p className="text-xs text-amber-600 font-semibold mt-2">
            {spoilerPct}% of selected constituencies
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Mahayuti Net Exposure
          </span>
          <div className="flex items-baseline gap-2 mt-2 font-mono">
            <span className="text-3xl font-extrabold text-emerald-700">
              +{exposureSummary.wonWithSpoiler['Mahayuti'] - exposureSummary.lostByRunnerWithSpoiler['Mahayuti']}
            </span>
            <span className="text-xs text-slate-500">net seats</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Won {exposureSummary.wonWithSpoiler['Mahayuti']} with spoiler vs lost {exposureSummary.lostByRunnerWithSpoiler['Mahayuti']}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            MVA Net Exposure
          </span>
          <div className="flex items-baseline gap-2 mt-2 font-mono">
            <span className="text-3xl font-extrabold text-rose-700">
              {exposureSummary.wonWithSpoiler['MVA'] - exposureSummary.lostByRunnerWithSpoiler['MVA']}
            </span>
            <span className="text-xs text-slate-500">net seats</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Won {exposureSummary.wonWithSpoiler['MVA']} with spoiler vs lost {exposureSummary.lostByRunnerWithSpoiler['MVA']}
          </p>
        </div>
      </div>

      {/* Top Tightest Spoiler-Affected Seats Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-5">
        <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Target className="w-4 h-4 text-amber-500" />
          Tightest Spoiler-Affected Assembly Segments
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Ranked by smallest victory margin where 3rd candidate's votes far exceeded the winning gap
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-3 py-3 text-left">AC #</th>
                <th className="px-3 py-3 text-left">Constituency</th>
                <th className="px-3 py-3 text-left">Winner</th>
                <th className="px-3 py-3 text-left">Runner-Up</th>
                <th className="px-3 py-3 text-right">Margin</th>
                <th className="px-3 py-3 text-left">Spoiler Candidate</th>
                <th className="px-3 py-3 text-right">Spoiler Votes</th>
                <th className="px-3 py-3 text-right">Spoiler/Margin Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {spoilerData.slice(0, 15).map((s) => {
                const winnerPartyColor = PARTY_COLORS[s.Party] || '#7F7F7F';
                const runnerPartyColor = PARTY_COLORS[s.RunnerUp_Party || ''] || '#7F7F7F';

                return (
                  <tr key={s.Constituency_No} className="hover:bg-amber-50/20 transition-colors">
                    <td className="px-3 py-2.5 font-mono text-slate-500">
                      {s.Constituency_No}
                    </td>
                    <td className="px-3 py-2.5 font-semibold text-slate-900">
                      {s.Constituency_Name}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-slate-900">{s.Candidate_Name}</span>{' '}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white ml-1 inline-block"
                        style={{ backgroundColor: winnerPartyColor }}
                      >
                        {s.Party}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="text-slate-700">{s.RunnerUp_Name}</span>{' '}
                      <span
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white ml-1 inline-block"
                        style={{ backgroundColor: runnerPartyColor }}
                      >
                        {s.RunnerUp_Party}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-rose-700">
                      +{s.Margin.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-slate-800">{s.Spoiler_Candidate}</span>{' '}
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({s.Spoiler_Party})
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-slate-700">
                      {s.Spoiler_Votes.toLocaleString()}
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono font-bold text-amber-700">
                      {s.Spoiler_Ratio}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <span>
            <b>Methodology Note:</b> A ratio above 1.0x indicates the 3rd contestant polled more votes than the gap separating 1st and 2nd place. While not conclusive proof of counter-factual victory, it serves as a critical screening heuristic for split-vote vulnerability.
          </span>
        </div>
      </div>
    </div>
  );
};
