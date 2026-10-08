import { useState, useMemo } from 'react';
import {
  CandidateResult,
  generateFull2024ElectionDataset,
  PARTY_ALIASES,
  PARTY_TO_ALLIANCE,
} from './data/maharashtraData';
import { Sidebar } from './components/Sidebar';
import { KpiCards } from './components/KpiCards';
import { SeatShareCharts } from './components/SeatShareCharts';
import { CandidatesTable } from './components/CandidatesTable';
import { GeminiAnalystCard } from './components/GeminiAnalystCard';
import { SpoilerAnalysisTab } from './components/SpoilerAnalysisTab';
import { AppPyViewerTab } from './components/AppPyViewerTab';
import {
  LayoutDashboard,
  BarChart3,
  Target,
  Code2,
  BookOpen,
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';

const TOTAL_SEATS = 288;
const MAJORITY_MARK = 145;

export default function App() {
  const [candidates, setCandidates] = useState<CandidateResult[]>(() =>
    generateFull2024ElectionDataset()
  );
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [selectedAlliance, setSelectedAlliance] = useState<string>('All Alliances');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'charts' | 'spoilers' | 'app_py' | 'methodology'
  >('dashboard');

  // CSV Upload Parser
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      try {
        const parsed = parseCsvElectionData(text);
        if (parsed.length > 0) {
          setCandidates(parsed);
          setFileName(file.name);
          setSelectedDistrict('All Districts');
          setSelectedAlliance('All Alliances');
        } else {
          alert('Could not find valid candidate rows in the uploaded CSV.');
        }
      } catch (err: any) {
        console.error('Error parsing CSV:', err);
        alert(`Failed to parse CSV: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    setCandidates(generateFull2024ElectionDataset());
    setFileName(null);
    setSelectedDistrict('All Districts');
    setSelectedAlliance('All Alliances');
    setSearchQuery('');
  };

  // Filter candidates based on selections
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      if (selectedDistrict !== 'All Districts' && c.District !== selectedDistrict) {
        return false;
      }
      if (selectedAlliance !== 'All Alliances' && c.Alliance !== selectedAlliance) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.Candidate_Name.toLowerCase().includes(q);
        const matchesConstituency = c.Constituency_Name.toLowerCase().includes(q);
        const matchesDistrict = c.District.toLowerCase().includes(q);
        const matchesParty = c.Party.toLowerCase().includes(q);
        if (!matchesName && !matchesConstituency && !matchesDistrict && !matchesParty) {
          return false;
        }
      }
      return true;
    });
  }, [candidates, selectedDistrict, selectedAlliance, searchQuery]);

  const downloadFullCsv = () => {
    const headers = [
      'Constituency_No',
      'Constituency_Name',
      'District',
      'Candidate_Name',
      'Party',
      'Alliance',
      'EVM_Votes',
      'Postal_Votes',
      'Total_Votes',
      'Margin',
      'Margin_Pct',
      'Status',
    ];
    const rows = candidates.map((c) => [
      c.Constituency_No,
      `"${c.Constituency_Name}"`,
      `"${c.District}"`,
      `"${c.Candidate_Name}"`,
      c.Party,
      c.Alliance,
      c.EVM_Votes,
      c.Postal_Votes,
      c.Total_Votes,
      c.Margin,
      c.Margin_Pct,
      c.Status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'maharashtra_elections_2024.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col md:flex-row antialiased">
      {/* 1. Sidebar & Navigation */}
      <Sidebar
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedAlliance={selectedAlliance}
        setSelectedAlliance={setSelectedAlliance}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onFileUpload={handleFileUpload}
        onResetData={handleResetData}
        totalFiltered={filteredCandidates.length}
        totalAvailable={candidates.length}
        fileName={fileName}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full overflow-y-auto">
        {/* Top Navbar & Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-bold font-mono">
                Maharashtra Assembly 2024
              </span>
              <span className="text-xs text-slate-400 font-medium">
                288 Constituencies &bull; Majority: 145
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
              Election Analytics & AI Intelligence Dashboard
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Powered by Google AI Studio (Gemini 2.5 Flash), Plotly visualizations & Streamlit Python export
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/80 p-1.5 rounded-xl border border-slate-300/60 text-xs font-medium self-start lg:self-center">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-500" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('charts')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'charts'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
              <span>Seat Share Charts</span>
            </button>

            <button
              onClick={() => setActiveTab('spoilers')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'spoilers'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Target className="w-3.5 h-3.5 text-rose-500" />
              <span>Spoiler Analysis</span>
            </button>

            <button
              onClick={() => setActiveTab('app_py')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'app_py'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>app.py Script</span>
            </button>

            <button
              onClick={() => setActiveTab('methodology')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'methodology'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
              <span>Methodology</span>
            </button>
          </div>
        </header>

        {/* Tab 1: Full Interactive Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 2. DASHBOARD KPI CARDS */}
            <KpiCards
              candidates={filteredCandidates}
              totalSeats={TOTAL_SEATS}
              majorityMark={MAJORITY_MARK}
            />

            {/* 3. GOOGLE AI STUDIO (GEMINI API) INTEGRATION */}
            <GeminiAnalystCard
              candidates={filteredCandidates}
              selectedDistrict={selectedDistrict}
              selectedAlliance={selectedAlliance}
            />

            {/* Plotly Bar Charts for Seat Share */}
            <SeatShareCharts
              candidates={filteredCandidates}
              majorityMark={MAJORITY_MARK}
            />

            {/* Searchable Dataframe of Winning Candidates */}
            <CandidatesTable candidates={filteredCandidates} />
          </div>
        )}

        {/* Tab 2: Visualizations Deep-Dive */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <SeatShareCharts
              candidates={filteredCandidates}
              majorityMark={MAJORITY_MARK}
            />
            <CandidatesTable candidates={filteredCandidates} />
          </div>
        )}

        {/* Tab 3: Spoiler Effects (Jupyter Notebook Section 5) */}
        {activeTab === 'spoilers' && (
          <SpoilerAnalysisTab candidates={filteredCandidates} />
        )}

        {/* Tab 4: Python app.py Viewer & Export */}
        {activeTab === 'app_py' && (
          <AppPyViewerTab onDownloadCsv={downloadFullCsv} />
        )}

        {/* Tab 5: Methodology & Notebook Specs */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Data Cleaning & Analytical Pipeline Architecture
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                This dashboard strictly follows the preprocessing pipeline designed in the 2024 Maharashtra
                Vidhan Sabha Election data analysis Jupyter notebook (`maharashtra_elections_2024.ipynb`):
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">
                    1. Single Source of Truth
                  </h4>
                  <p className="text-slate-600">
                    Constituency rankings, winning status, and victory margins are dynamically derived from votes
                    (`Total_Votes = EVM_Votes + Postal_Votes`). This prevents flawed status flags from propagating.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">
                    2. Canonical Party Mapping
                  </h4>
                  <p className="text-slate-600">
                    Messy spelling variants (e.g. <i>"SHIV SENA (UBT)"</i>, <i>"NCP (SP)"</i>) are canonicalized into
                    standard symbols (SSUBT, NCPSP, BJP, SHS, NCP, INC) before alliance mapping.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">
                    3. Derivation of Alliance Blocks
                  </h4>
                  <p className="text-slate-600">
                    <b>Mahayuti:</b> BJP, SHS (Shinde), NCP (Ajit Pawar)<br />
                    <b>MVA:</b> INC (Congress), SSUBT (Uddhav Thackeray), NCPSP (Sharadchandra Pawar)<br />
                    <b>Others:</b> Independents, MNS, VBA, AIMIM, SP, CPI(M)
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900">
                    4. Gemini 2.5 Flash Model Integration
                  </h4>
                  <p className="text-slate-600">
                    The prompt uses the exact executive structure:
                    <i>"You are an expert political analyst. Based on this summary of the 2024 Maharashtra election data: [Summary], provide a 3-bullet-point executive summary..."</i>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={downloadFullCsv}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Download Clean 288-Seat Dataset (CSV)</span>
                </button>

                <button
                  onClick={() => setActiveTab('app_py')}
                  className="text-xs text-indigo-600 font-semibold hover:underline"
                >
                  View complete Python app.py script &rarr;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="pt-6 pb-4 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            &copy; 2024 Maharashtra Vidhan Sabha Election Intelligence &bull; Google AI Studio Build
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Model: gemini-2.5-flash</span>
            <span>&bull;</span>
            <span>Platform: Streamlit & React</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

// Lightweight CSV parser for election results
function parseCsvElectionData(csvText: string): CandidateResult[] {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  // Parse header
  const header = lines[0].split(',').map((h) => h.replace(/^["']|["']$/g, '').trim());

  const getIdx = (colNames: string[]) => {
    return header.findIndex((h) =>
      colNames.some((c) => h.toLowerCase() === c.toLowerCase())
    );
  };

  const constNoIdx = getIdx(['Constituency_No', 'AC_NO', 'AC_Number', 'Constituency No']);
  const constNameIdx = getIdx(['Constituency_Name', 'AC_NAME', 'Constituency']);
  const distIdx = getIdx(['District', 'DIST_NAME']);
  const candIdx = getIdx(['Candidate_Name', 'Candidate', 'NAME']);
  const partyIdx = getIdx(['Party', 'PARTY_NAME']);
  const allianceIdx = getIdx(['Alliance']);
  const evmIdx = getIdx(['EVM_Votes', 'EVM Votes']);
  const postalIdx = getIdx(['Postal_Votes', 'Postal Votes']);
  const totalVotesIdx = getIdx(['Total_Votes', 'Total Votes', 'Votes']);
  const marginIdx = getIdx(['Margin']);
  const statusIdx = getIdx(['Status']);

  const candidates: CandidateResult[] = [];

  for (let i = 1; i < lines.length; i++) {
    // Basic comma splitter respecting quotes
    const row = splitCsvLine(lines[i]);
    if (row.length < 3) continue;

    const constNo = constNoIdx >= 0 ? parseInt(row[constNoIdx].replace(/,/g, ''), 10) || i : i;
    const constName = constNameIdx >= 0 ? row[constNameIdx] : `Constituency ${constNo}`;
    const district = distIdx >= 0 ? row[distIdx] : 'Maharashtra';
    const candidateName = candIdx >= 0 ? row[candIdx] : `Candidate ${i}`;
    let rawParty = partyIdx >= 0 ? row[partyIdx] : 'IND';
    rawParty = PARTY_ALIASES[rawParty.toUpperCase()] || rawParty;

    let alliance: 'Mahayuti' | 'MVA' | 'Others' =
      allianceIdx >= 0 && (row[allianceIdx] === 'Mahayuti' || row[allianceIdx] === 'MVA')
        ? row[allianceIdx]
        : PARTY_TO_ALLIANCE[rawParty] || 'Others';

    const evmVotes = evmIdx >= 0 ? parseInt(row[evmIdx].replace(/,/g, ''), 10) || 0 : 0;
    const postalVotes = postalIdx >= 0 ? parseInt(row[postalIdx].replace(/,/g, ''), 10) || 0 : 0;
    let totalVotes = totalVotesIdx >= 0 ? parseInt(row[totalVotesIdx].replace(/,/g, ''), 10) || 0 : 0;
    if (totalVotes === 0 && (evmVotes > 0 || postalVotes > 0)) {
      totalVotes = evmVotes + postalVotes;
    }

    const margin = marginIdx >= 0 ? parseInt(row[marginIdx].replace(/,/g, ''), 10) || 0 : 0;
    const status = statusIdx >= 0 && row[statusIdx].toLowerCase().includes('won') ? 'Won' : 'Won';
    const marginPct = totalVotes > 0 ? Number(((margin / totalVotes) * 100).toFixed(2)) : 0;

    candidates.push({
      Constituency_No: constNo,
      Constituency_Name: constName,
      District: district,
      Candidate_Name: candidateName,
      Party: rawParty,
      Alliance: alliance,
      EVM_Votes: evmVotes,
      Postal_Votes: postalVotes,
      Total_Votes: totalVotes,
      Margin: margin,
      Margin_Pct: marginPct,
      Status: status,
      Rank: 1,
    });
  }

  return candidates;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}
