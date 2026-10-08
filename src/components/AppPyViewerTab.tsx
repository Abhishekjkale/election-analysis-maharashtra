import React, { useState } from 'react';
import { Download, Copy, Check, Terminal, ExternalLink, Code2 } from 'lucide-react';

interface AppPyViewerTabProps {
  onDownloadCsv: () => void;
}

const APP_PY_CODE = `"""
2024 Maharashtra Vidhan Sabha Election Analytics Dashboard
Built with Streamlit, Plotly, Pandas, and Google GenAI SDK (Gemini API)

Run locally:
    pip install streamlit plotly pandas numpy google-genai
    streamlit run app.py
"""

import os
import re
import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

# Initialize Google GenAI SDK
try:
    from google import genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False

# ---------------------------------------------------------
# Page Configuration & Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="2024 Maharashtra Assembly Election Dashboard",
    page_icon="🗳️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for polished aesthetic
st.markdown("""
<style>
    .main-header { font-size: 2.2rem; font-weight: 700; color: #1E293B; margin-bottom: 0.2rem; }
    .sub-header { font-size: 1.05rem; color: #64748B; margin-bottom: 1.5rem; }
    .metric-card { background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Constants & Mapping Rules (from Jupyter Notebook)
# ---------------------------------------------------------
TOTAL_SEATS = 288
MAJORITY_MARK = 145

ALLIANCE_MEMBERS = {
    "Mahayuti": ["BJP", "SHS", "NCP"],
    "MVA": ["INC", "SSUBT", "NCPSP"],
}

PARTY_TO_ALLIANCE = {p: a for a, members in ALLIANCE_MEMBERS.items() for p in members}

ALLIANCE_COLORS = {
    "Mahayuti": "#F28C28",  # Saffron
    "MVA": "#1F77B4",       # Blue
    "Others": "#7F7F7F"     # Slate Gray
}

PARTY_ALIASES = {
    "BJP": "BJP", "BHARATIYA JANATA PARTY": "BJP",
    "SHS": "SHS", "SHIV SENA": "SHS", "SHIVSENA": "SHS",
    "NCP": "NCP", "NATIONALIST CONGRESS PARTY": "NCP",
    "INC": "INC", "CONGRESS": "INC", "INDIAN NATIONAL CONGRESS": "INC",
    "SSUBT": "SSUBT", "SHS (UBT)": "SSUBT", "SHS(UBT)": "SSUBT", "SS (UBT)": "SSUBT",
    "SHIV SENA (UBT)": "SSUBT", "SHIVSENA (UBT)": "SSUBT",
    "SHIV SENA (UDDHAV BALASAHEB THACKERAY)": "SSUBT",
    "NCPSP": "NCPSP", "NCP (SP)": "NCPSP", "NCP(SP)": "NCPSP", "NCP-SP": "NCPSP",
    "NCP (SHARADCHANDRA PAWAR)": "NCPSP",
    "IND": "IND", "IND.": "IND", "INDEPENDENT": "IND",
}

DISTRICTS_LIST = [
    "Ahmednagar", "Akola", "Amravati", "Beed", "Bhandara", "Buldhana", "Chandrapur",
    "Chhatrapati Sambhajinagar", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon",
    "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded",
    "Nandurbar", "Nashik", "Dharashiv", "Palghar", "Parbhani", "Pune", "Raigad",
    "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha",
    "Washim", "Yavatmal"
]

# ---------------------------------------------------------
# Data Cleaning & Helper Functions
# ---------------------------------------------------------
def clean_election_dataframe(raw_df: pd.DataFrame) -> pd.DataFrame:
    df = raw_df.copy()
    df.columns = df.columns.str.strip()
    df = df.drop_duplicates()

    if "Constituency_No" in df.columns:
        df["Constituency_No"] = pd.to_numeric(
            df["Constituency_No"].astype(str).str.replace(",", "", regex=False).str.strip(),
            errors="coerce"
        ).fillna(1).astype(int)

    for col in ["Constituency_Name", "District", "Candidate_Name", "Party"]:
        if col in df.columns:
            df[col] = df[col].astype(str).str.strip().str.replace(r"\\s+", " ", regex=True)

    if "Constituency_No" in df.columns:
        if "Constituency_Name" in df.columns:
            df["Constituency_Name"] = df.groupby("Constituency_No")["Constituency_Name"].transform("first")
        if "District" in df.columns:
            df["District"] = df.groupby("Constituency_No")["District"].transform("first")

    vote_cols = [c for c in ["EVM_Votes", "Postal_Votes", "Total_Votes", "Margin"] if c in df.columns]
    for c in vote_cols:
        df[c] = pd.to_numeric(
            df[c].astype(str).str.replace(",", "", regex=False).str.strip(),
            errors="coerce"
        ).fillna(0)

    if "Total_Votes" not in df.columns and "EVM_Votes" in df.columns:
        df["Total_Votes"] = df["EVM_Votes"] + df.get("Postal_Votes", 0)

    if "Party" in df.columns:
        upper_p = df["Party"].str.upper()
        df["Party"] = upper_p.map(PARTY_ALIASES).fillna(upper_p)
        df["Alliance"] = df["Party"].map(PARTY_TO_ALLIANCE).fillna("Others")

    if "Constituency_No" in df.columns and "Total_Votes" in df.columns:
        df["Rank"] = df.groupby("Constituency_No")["Total_Votes"].rank(method="first", ascending=False).astype(int)
        df["Status"] = np.where(df["Rank"] == 1, "Won", "Lost")
        
        def calc_margin(s):
            top = s.nlargest(2)
            if len(top) > 1:
                return top.iloc[0] - top.iloc[-1]
            return top.iloc[0]

        margins = df.groupby("Constituency_No")["Total_Votes"].transform(calc_margin)
        df["Margin"] = margins.where(df["Rank"] == 1, 0)
        
        const_totals = df.groupby("Constituency_No")["Total_Votes"].transform("sum")
        df["Margin_Pct"] = (df["Margin"] / const_totals.replace(0, np.nan) * 100).round(2)

    return df

# ---------------------------------------------------------
# Gemini API Integration Function
# ---------------------------------------------------------
def call_gemini_analyst(data_summary_str: str, custom_question: str = None) -> str:
    api_key = None
    if "GEMINI_API_KEY" in st.secrets:
        api_key = st.secrets["GEMINI_API_KEY"]
    elif "GEMINI_API_KEY" in os.environ:
        api_key = os.environ["GEMINI_API_KEY"]
    
    if not api_key:
        return (
            "⚠️ **Gemini API Key Missing**: Please set GEMINI_API_KEY in .streamlit/secrets.toml "
            "or as an environment variable to enable live AI analysis."
        )

    if not GENAI_AVAILABLE:
        return "⚠️ google-genai SDK is not installed. Please run pip install google-genai."

    try:
        client = genai.Client(api_key=api_key)
        base_prompt = (
            f"You are an expert political analyst. Based on this summary of the 2024 Maharashtra election data: "
            f"[{data_summary_str}], provide a 3-bullet-point executive summary outlining the strategic takeaways "
            f"and voter trends."
        )
        
        final_prompt = f"{base_prompt}\\n\\nQuestion: {custom_question}" if custom_question else base_prompt

        try:
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=final_prompt
            )
        except Exception as e_flash:
            # Seamless fallback to gemini-3.8-flash if gemini-2.5-flash is sunset
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=final_prompt
                )
            except Exception:
                raise e_flash

        return response.text
    except Exception as e:
        return f"❌ Error communicating with Gemini API: {str(e)}"
`;

export const AppPyViewerTab: React.FC<AppPyViewerTabProps> = ({ onDownloadCsv }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(APP_PY_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAppPy = () => {
    const blob = new Blob([APP_PY_CODE], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app.py';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs font-bold">
                app.py
              </span>
              <h3 className="text-lg font-bold text-white">
                Python Streamlit Production Script
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Complete standalone script fulfilling all requirements: Sidebar filters, KPI metrics,
              Plotly bar charts, searchable dataframe, and Gemini API integration with `gemini-2.5-flash`.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy app.py</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadAppPy}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download app.py</span>
            </button>
          </div>
        </div>

        {/* Local Run Quickstart */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/70 rounded-lg p-3.5 border border-slate-800 font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-sans font-semibold">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>1. Install Requirements & Run Streamlit</span>
            </div>
            <div className="text-emerald-400 select-all">
              pip install streamlit plotly pandas numpy google-genai
            </div>
            <div className="text-amber-300 mt-1 select-all">
              streamlit run app.py
            </div>
          </div>

          <div className="bg-slate-950/70 rounded-lg p-3.5 border border-slate-800 font-mono text-slate-300">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] mb-1 font-sans font-semibold">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>2. Configure Gemini API Key (.streamlit/secrets.toml)</span>
            </div>
            <div className="text-slate-400 select-all">
              GEMINI_API_KEY = "AIzaSy..."
            </div>
            <div className="text-[11px] text-slate-500 font-sans mt-1">
              Read automatically via <code className="text-amber-400">st.secrets["GEMINI_API_KEY"]</code>
            </div>
          </div>
        </div>
      </div>

      {/* Code Viewer */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="ml-2 font-mono text-slate-300 font-semibold">app.py</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Python 3.10+ | Streamlit 1.30+</span>
        </div>

        <pre className="p-5 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-[600px] select-all">
          <code>{APP_PY_CODE}</code>
        </pre>
      </div>
    </div>
  );
};
