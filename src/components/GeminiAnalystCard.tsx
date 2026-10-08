import React, { useState } from 'react';
import { CandidateResult } from '../data/maharashtraData';
import { Sparkles, Send, Copy, Check, RefreshCw, Cpu, MessageSquareText } from 'lucide-react';

interface GeminiAnalystCardProps {
  candidates: CandidateResult[];
  selectedDistrict: string;
  selectedAlliance: string;
}

export const GeminiAnalystCard: React.FC<GeminiAnalystCardProps> = ({
  candidates,
  selectedDistrict,
  selectedAlliance,
}) => {
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [modelUsed, setModelUsed] = useState<string>('gemini-2.5-flash');
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate data summary context string following prompt specs
  const generateDataSummary = (): string => {
    if (candidates.length === 0) return 'No constituencies match current filter criteria.';

    const allianceCounts: Record<string, number> = {};
    const partyCounts: Record<string, number> = {};
    let totalMargin = 0;
    let highestMargin = 0;
    let highestCandidate = '';

    candidates.forEach((c) => {
      allianceCounts[c.Alliance] = (allianceCounts[c.Alliance] || 0) + 1;
      partyCounts[c.Party] = (partyCounts[c.Party] || 0) + 1;
      totalMargin += c.Margin;
      if (c.Margin > highestMargin) {
        highestMargin = c.Margin;
        highestCandidate = `${c.Candidate_Name} (${c.Party}, ${c.Constituency_Name})`;
      }
    });

    const avgMargin = Math.round(totalMargin / candidates.length);

    return (
      `District Filter: ${selectedDistrict}; Alliance Filter: ${selectedAlliance}; ` +
      `Total Seats Analyzed: ${candidates.length}; ` +
      `Alliance Breakdown: ${JSON.stringify(allianceCounts)}; ` +
      `Top Parties: ${JSON.stringify(partyCounts)}; ` +
      `Average Victory Margin: ${avgMargin.toLocaleString()} votes; ` +
      `Highest Margin: ${highestMargin.toLocaleString()} votes won by ${highestCandidate}.`
    );
  };

  const handleAskGemini = async () => {
    setLoading(true);
    setErrorMsg(null);

    const summaryText = generateDataSummary();

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summaryText,
          userQuery: customQuestion.trim() || undefined,
          model: 'gemini-2.5-flash',
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAnalysisText(data.analysis || 'No analysis available.');
      if (data.modelUsed) setModelUsed(data.modelUsed);
    } catch (err: any) {
      console.error('Analysis request error:', err);
      setErrorMsg(err.message || 'Failed to communicate with AI analyst endpoint');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (analysisText) {
      navigator.clipboard.writeText(analysisText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 rounded-2xl border border-indigo-900/50 shadow-xl p-6 text-white overflow-hidden relative">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Google AI Studio &bull; Gemini Electoral Analyst
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono flex items-center gap-1 font-semibold">
                <Cpu className="w-3 h-3" />
                gemini-2.5-flash
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated high-level strategic intelligence computed dynamically from your data selections
            </p>
          </div>
        </div>

        {/* Action Trigger Button */}
        <button
          onClick={handleAskGemini}
          disabled={loading || candidates.length === 0}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Ask Gemini to Analyze Current Selection</span>
            </>
          )}
        </button>
      </div>

      {/* Question / Custom Prompt Bar */}
      <div className="relative z-10 pt-5 space-y-3">
        <div className="flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-amber-400" />
          <label className="text-xs font-semibold text-slate-300">
            Optional: Tailor Gemini's Focus or Inquire Further
          </label>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={customQuestion}
            onChange={(e) => setCustomQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskGemini()}
            placeholder="e.g. Compare Mahayuti vs MVA strike rates in this district, or explain the spoiler dynamics..."
            className="flex-1 bg-slate-800/80 border border-slate-700/80 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            onClick={handleAskGemini}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-amber-400" />
            <span>Submit</span>
          </button>
        </div>
      </div>

      {/* Analysis Response Container (matching st.info / markdown) */}
      <div className="relative z-10 pt-5">
        {loading ? (
          <div className="bg-slate-800/60 border border-indigo-500/30 rounded-xl p-8 text-center space-y-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5 animate-spin" />
            </div>
            <p className="text-xs font-semibold text-slate-200">
              Generating executive electoral analysis with Gemini 2.5 Flash...
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Synthesizing seat share, margin dispersion, and alliance strike efficiency for{' '}
              <b>{selectedDistrict}</b> ({selectedAlliance}).
            </p>
          </div>
        ) : analysisText ? (
          <div className="bg-slate-800/80 border border-indigo-500/40 rounded-xl p-5 relative group shadow-inner">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700/60 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Sparkles className="w-4 h-4" />
                <span>Executive Summary & Strategic Takeaways</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono">
                  Model: {modelUsed}
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-md hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Markdown rendered text */}
            <div className="text-xs text-slate-200 leading-relaxed space-y-3 font-normal prose prose-invert max-w-none">
              {analysisText.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('* ') || paragraph.startsWith('- ')) {
                  return (
                    <div key={idx} className="pl-3 border-l-2 border-amber-500/60 py-0.5">
                      <p className="text-slate-200" dangerouslySetInnerHTML={{
                        __html: formatMarkdownBold(paragraph.replace(/^[*-]\s*/, ''))
                      }} />
                    </div>
                  );
                }
                return (
                  <p key={idx} className="text-slate-300" dangerouslySetInnerHTML={{
                    __html: formatMarkdownBold(paragraph)
                  }} />
                );
              })}
            </div>
          </div>
        ) : errorMsg ? (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-4 text-xs text-rose-300">
            ⚠️ {errorMsg}
          </div>
        ) : (
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-5 text-center text-xs text-slate-400">
            Click <b>"Ask Gemini to Analyze Current Selection"</b> above to run real-time electoral analysis on the filtered data using the Google GenAI SDK.
          </div>
        )}
      </div>
    </div>
  );
};

function formatMarkdownBold(text: string): string {
  return text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-bold">$1</strong>');
}
