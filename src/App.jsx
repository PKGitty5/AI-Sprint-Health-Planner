import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

/* ─────────────────────────── CONSTANTS ─────────────────────────── */
const OLLAMA_BASE = 'http://localhost:11434';
const RAG_COLORS = { GREEN: '#16a34a', AMBER: '#d97706', RED: '#dc2626' };
const ACCENT = '#3b82f6';

const SAMPLE_DATA = {
  sprintName: 'Sprint 24 — PayNow Migration',
  sprintGoal: 'Complete API integration layer for NZP to AWS migration',
  storiesPlanned: 18,
  storiesCompleted: 15,
  pointsPlanned: 42,
  pointsCompleted: 36,
  blockersRaised: 5,
  blockersResolved: 4,
  teamSize: 6,
  sprintDays: 14,
  challenges: 'AWS sandbox environment delays, two engineers on leave mid-sprint, dependent API team missed handoff deadline',
  wins: 'Payment gateway module deployed successfully, zero production incidents, critical blocker resolved in under 2 hours by team self-organisation',
};

const EMPTY_FORM = {
  sprintName: '',
  sprintGoal: '',
  storiesPlanned: '',
  storiesCompleted: '',
  pointsPlanned: '',
  pointsCompleted: '',
  blockersRaised: '',
  blockersResolved: '',
  teamSize: '',
  sprintDays: 14,
  challenges: '',
  wins: '',
};

/* ─────────────────────────── ICONS (inline SVG) ─────────────────── */
const Icons = {
  Zap: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Copy: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  AlertCircle: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
};

/* ─────────────────────────── HELPERS ─────────────────────────── */
function calcScores(form) {
  const sp = Number(form.storiesPlanned) || 0;
  const sc = Number(form.storiesCompleted) || 0;
  const pp = Number(form.pointsPlanned) || 0;
  const pc = Number(form.pointsCompleted) || 0;
  const br = Number(form.blockersRaised) || 0;
  const bres = Number(form.blockersResolved) || 0;
  const ts = Number(form.teamSize) || 1;

  const velocityIndex = sp > 0 ? Math.round((sc / sp) * 100) : 0;
  const predictabilityScore = pp > 0 ? Math.round((pc / pp) * 100) : 0;
  const blockerRate = br > 0 ? Math.round((bres / br) * 100) : 100;
  const teamLoad = ts > 0 ? Math.round((pc / ts) * 10) / 10 : 0;

  return { velocityIndex, predictabilityScore, blockerRate, teamLoad };
}

function teamLoadLabel(load) {
  if (load < 6) return { label: 'Low', color: '#d97706' };
  if (load <= 12) return { label: 'Healthy', color: '#16a34a' };
  return { label: 'High', color: '#dc2626' };
}

function scoreColor(val) {
  if (val >= 80) return '#16a34a';
  if (val >= 50) return '#d97706';
  return '#dc2626';
}

function ragBadge(status) {
  const colors = {
    GREEN: 'bg-green-100 text-green-800 border-green-300',
    AMBER: 'bg-amber-100 text-amber-800 border-amber-300',
    RED: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[status] || colors.AMBER;
}

function buildPrompt(form, scores) {
  return `You are an expert Agile Coach and Scrum Master with 15 years of experience. Analyse the sprint data below and respond ONLY with a valid JSON object. No explanation, no markdown, no text outside the JSON.

SPRINT DATA:
Sprint Name: ${form.sprintName}
Sprint Goal: ${form.sprintGoal}
Stories Planned: ${form.storiesPlanned}
Stories Completed: ${form.storiesCompleted}
Story Points Planned: ${form.pointsPlanned}
Story Points Completed: ${form.pointsCompleted}
Blockers Raised: ${form.blockersRaised}
Blockers Resolved: ${form.blockersResolved}
Team Size: ${form.teamSize}
Sprint Duration: ${form.sprintDays} days
Top Challenges: ${form.challenges}
Notable Wins: ${form.wins}

PRE-CALCULATED SCORES (use these in your analysis):
Velocity Index: ${scores.velocityIndex}%
Predictability Score: ${scores.predictabilityScore}%
Blocker Resolution Rate: ${scores.blockerRate}%
Team Load: ${scores.teamLoad} story points per person

IMPORTANT: Return ONLY this JSON structure, nothing else:
{
  "overallScore": <integer 0 to 100>,
  "ragStatus": "<RED or AMBER or GREEN>",
  "narrative": "<3 to 4 sentence plain English sprint assessment referencing the actual data>",
  "retroAgenda": {
    "wentWell": ["<specific point 1>", "<specific point 2>", "<specific point 3>"],
    "needsImprovement": ["<specific point 1>", "<specific point 2>", "<specific point 3>"],
    "actionItems": [
      {"action": "<concrete action>", "owner": "<Scrum Master or Dev Lead or PM or Team>", "by": "Next sprint"},
      {"action": "<concrete action>", "owner": "<role>", "by": "Next sprint"},
      {"action": "<concrete action>", "owner": "<role>", "by": "Next sprint"}
    ],
    "nextSprintFocus": ["<recommendation 1>", "<recommendation 2>"]
  }
}`;
}

/* ─────────────────────────── COMPONENTS ─────────────────────────── */

/* Score Ring SVG */
function ScoreRing({ score, size = 160, strokeWidth = 12 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke="#e2e8f0" strokeWidth={strokeWidth} />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" className="score-ring" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-extrabold" style={{ color }}>{score}</span>
        <span className="text-xs text-slate-400 font-medium tracking-wide uppercase">Health</span>
      </div>
    </div>
  );
}

/* Dimension Card */
function DimensionCard({ icon, title, value, suffix, maxVal, color, delay }) {
  const pct = maxVal ? Math.min((value / maxVal) * 100, 100) : 0;
  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all duration-300 animate-fade-in-up animate-fade-in-up-delay-${delay}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}15` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-sm font-semibold text-slate-700">{title}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-bold" style={{ color }}>
          {typeof value === 'number' ? (Number.isInteger(value) ? value : value.toFixed(1)) : value}
        </span>
        {suffix && <span className="text-sm text-slate-400 font-medium">{suffix}</span>}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

/* Retro Section */
function RetroSection({ title, icon, color, items, isAction }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-base font-semibold mb-3" style={{ color }}>
        {icon}
        {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
            {isAction ? (
              <div>
                <span className="font-medium text-slate-700">{item.action}</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  {item.owner} · {item.by}
                </span>
              </div>
            ) : (
              <span>{item}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* Spinner */
function Spinner() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-indigo-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">Analysing sprint with local AI...</p>
        <p className="text-xs text-slate-400 mt-1">This usually takes 10–30 seconds</p>
      </div>
    </div>
  );
}

/* Empty State Card */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center">
        <Icons.Sparkles />
      </div>
      <div className="text-center">
        <p className="text-base font-semibold text-slate-500">No sprint analysed yet</p>
        <p className="text-sm text-slate-400 mt-1">Fill in the sprint data and click <span className="font-medium text-blue-500">Analyse Sprint</span> to get started</p>
      </div>
    </div>
  );
}

/* ─────────────────────────── MAIN APP ─────────────────────────── */
export default function App() {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [ollamaStatus, setOllamaStatus] = useState('checking'); // checking | connected | disconnected
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [scores, setScores] = useState(null);
  const [sprintHistory, setSprintHistory] = useState([]);
  const [copyFeedback, setCopyFeedback] = useState(false);

  /* Check Ollama on mount */
  useEffect(() => {
    fetch(`${OLLAMA_BASE}/api/tags`)
      .then(r => { if (r.ok) setOllamaStatus('connected'); else setOllamaStatus('disconnected'); })
      .catch(() => setOllamaStatus('disconnected'));
  }, []);

  /* Recalculate scores on form change */
  useEffect(() => {
    setScores(calcScores(form));
  }, [form]);

  const updateField = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const loadSample = () => {
    setForm({ ...SAMPLE_DATA });
    setError('');
  };

  /* Analyse sprint */
  const analyseSprint = useCallback(async () => {
    const currentScores = calcScores(form);
    setScores(currentScores);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const prompt = buildPrompt(form, currentScores);
      const res = await fetch(`${OLLAMA_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt,
          stream: false,
          format: 'json',
          options: { temperature: 0.3, num_predict: 1000 },
        }),
      });

      if (!res.ok) throw new Error(`Ollama returned status ${res.status}`);

      const raw = await res.json();
      let parsed;

      try {
        parsed = JSON.parse(raw.response);
      } catch {
        const cleaned = raw.response
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        parsed = JSON.parse(cleaned);
      }

      /* validate essential fields */
      if (typeof parsed.overallScore !== 'number' || !parsed.ragStatus || !parsed.retroAgenda) {
        throw new Error('LLM response missing required fields');
      }

      setResult(parsed);

      /* Add to history (max 5) */
      setSprintHistory(prev => {
        const entry = {
          name: form.sprintName || `Sprint ${prev.length + 1}`,
          healthScore: parsed.overallScore,
          velocityIndex: currentScores.velocityIndex,
        };
        const next = [...prev, entry];
        return next.slice(-5);
      });

    } catch (err) {
      console.error('Analysis error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setError('Cannot connect to Ollama. Ensure it is running with: OLLAMA_ORIGINS=* ollama serve');
      } else if (err.message.includes('JSON')) {
        setError('Analysis failed — the AI response was not valid JSON. Try again or check that llama3 model is installed.');
      } else {
        setError(`Analysis failed — ${err.message}. Check Ollama is running and llama3 model is installed.`);
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  /* Copy retro agenda */
  const copyAgenda = () => {
    if (!result?.retroAgenda) return;
    const r = result.retroAgenda;
    const text = [
      '═══ RETROSPECTIVE AGENDA ═══',
      '',
      '✅ WHAT WENT WELL',
      ...(r.wentWell || []).map((w, i) => `  ${i + 1}. ${w}`),
      '',
      '⚠️  WHAT NEEDS IMPROVEMENT',
      ...(r.needsImprovement || []).map((n, i) => `  ${i + 1}. ${n}`),
      '',
      '🎯 ACTION ITEMS',
      ...(r.actionItems || []).map((a, i) => `  ${i + 1}. ${a.action} — Owner: ${a.owner} — By: ${a.by}`),
      '',
      '🔮 NEXT SPRINT FOCUS',
      ...(r.nextSprintFocus || []).map((f, i) => `  ${i + 1}. ${f}`),
    ].join('\n');
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  /* Export full report as .txt */
  const exportReport = () => {
    if (!result || !scores) return;
    const lines = [
      '══════════════════════════════════════════',
      '   AI SPRINT HEALTH DASHBOARD — REPORT   ',
      '══════════════════════════════════════════',
      '',
      `Sprint: ${form.sprintName}`,
      `Goal: ${form.sprintGoal}`,
      `Date: ${new Date().toLocaleDateString()}`,
      '',
      '─── METRICS ───',
      `Stories: ${form.storiesCompleted} / ${form.storiesPlanned} completed`,
      `Points: ${form.pointsCompleted} / ${form.pointsPlanned} completed`,
      `Blockers: ${form.blockersResolved} / ${form.blockersRaised} resolved`,
      `Team Size: ${form.teamSize}  |  Duration: ${form.sprintDays} days`,
      '',
      '─── SCORES ───',
      `Overall Health: ${result.overallScore}/100 (${result.ragStatus})`,
      `Velocity Index: ${scores.velocityIndex}%`,
      `Predictability: ${scores.predictabilityScore}%`,
      `Blocker Resolution: ${scores.blockerRate}%`,
      `Team Load: ${scores.teamLoad} pts/person (${teamLoadLabel(scores.teamLoad).label})`,
      '',
      '─── AI NARRATIVE ───',
      result.narrative,
      '',
      '─── CHALLENGES ───',
      form.challenges,
      '',
      '─── WINS ───',
      form.wins,
      '',
      '─── RETROSPECTIVE AGENDA ───',
      '',
      'What Went Well:',
      ...(result.retroAgenda.wentWell || []).map((w, i) => `  ${i + 1}. ${w}`),
      '',
      'What Needs Improvement:',
      ...(result.retroAgenda.needsImprovement || []).map((n, i) => `  ${i + 1}. ${n}`),
      '',
      'Action Items:',
      ...(result.retroAgenda.actionItems || []).map((a, i) => `  ${i + 1}. ${a.action} (Owner: ${a.owner}, By: ${a.by})`),
      '',
      'Next Sprint Focus:',
      ...(result.retroAgenda.nextSprintFocus || []).map((f, i) => `  ${i + 1}. ${f}`),
      '',
      '──────────────────────────────────────',
      'Generated by AI Sprint Health Dashboard',
      'Powered by Ollama (LLaMA 3) — Local AI',
      `Built by Purva Kale`,
    ].join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprint-report-${(form.sprintName || 'sprint').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ─────────── RENDER ─────────── */
  const tl = scores ? teamLoadLabel(scores.teamLoad) : { label: '-', color: '#94a3b8' };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b]">
      {/* ── HEADER ── */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-[1440px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">AI Sprint Health Dashboard</h1>
              <p className="text-[11px] text-slate-400 font-medium">Powered by Ollama · Local AI Analysis</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              ollamaStatus === 'connected'
                ? 'bg-green-50 text-green-700 border-green-200'
                : ollamaStatus === 'disconnected'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                ollamaStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                ollamaStatus === 'disconnected' ? 'bg-red-500' : 'bg-slate-400 animate-pulse'
              }`} />
              {ollamaStatus === 'connected' ? 'Ollama: Connected' :
               ollamaStatus === 'disconnected' ? 'Ollama: Not detected' : 'Checking...'}
            </div>
          </div>
        </div>
      </header>

      {/* ── CORS NOTE ── */}
      {ollamaStatus === 'disconnected' && (
        <div className="max-w-[1440px] mx-auto px-6 mt-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3">
            <span className="text-amber-500 mt-0.5"><Icons.AlertCircle /></span>
            <div>
              <p className="text-sm font-semibold text-amber-800">Ollama not detected</p>
              <p className="text-xs text-amber-600 mt-0.5">
                Ensure Ollama is running with: <code className="bg-amber-100 px-1.5 py-0.5 rounded font-mono text-[11px]">OLLAMA_ORIGINS=* ollama serve</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-[1440px] mx-auto px-6 py-6">
        <div className="grid grid-cols-12 gap-6">

          {/* ── LEFT: INPUT FORM ── */}
          <aside className="col-span-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sprint Input</h2>
                <p className="text-xs text-slate-400 mt-0.5">Enter your sprint metrics below</p>
              </div>
              <div className="p-5 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Sprint Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="sprintName">Sprint Name / Number</label>
                  <input id="sprintName" type="text" placeholder="e.g. Sprint 24"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                    value={form.sprintName} onChange={e => updateField('sprintName', e.target.value)} />
                </div>
                {/* Sprint Goal */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="sprintGoal">Sprint Goal</label>
                  <textarea id="sprintGoal" rows={2} placeholder="What is this sprint trying to achieve?"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    value={form.sprintGoal} onChange={e => updateField('sprintGoal', e.target.value)} />
                </div>
                {/* Stories Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="storiesPlanned">Stories Planned</label>
                    <input id="storiesPlanned" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.storiesPlanned} onChange={e => updateField('storiesPlanned', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="storiesCompleted">Stories Completed</label>
                    <input id="storiesCompleted" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.storiesCompleted} onChange={e => updateField('storiesCompleted', e.target.value)} />
                  </div>
                </div>
                {/* Points Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="pointsPlanned">Points Planned</label>
                    <input id="pointsPlanned" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.pointsPlanned} onChange={e => updateField('pointsPlanned', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="pointsCompleted">Points Completed</label>
                    <input id="pointsCompleted" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.pointsCompleted} onChange={e => updateField('pointsCompleted', e.target.value)} />
                  </div>
                </div>
                {/* Blockers Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="blockersRaised">Blockers Raised</label>
                    <input id="blockersRaised" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.blockersRaised} onChange={e => updateField('blockersRaised', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="blockersResolved">Blockers Resolved</label>
                    <input id="blockersResolved" type="number" min="0" placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.blockersResolved} onChange={e => updateField('blockersResolved', e.target.value)} />
                  </div>
                </div>
                {/* Team / Duration Row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="teamSize">Team Size</label>
                    <input id="teamSize" type="number" min="1" placeholder="e.g. 6"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.teamSize} onChange={e => updateField('teamSize', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="sprintDays">Duration (days)</label>
                    <input id="sprintDays" type="number" min="1" placeholder="14"
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-300"
                      value={form.sprintDays} onChange={e => updateField('sprintDays', e.target.value)} />
                  </div>
                </div>
                {/* Challenges */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="challenges">Top Challenges This Sprint</label>
                  <textarea id="challenges" rows={3} placeholder="What blockers or issues did the team face?"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    value={form.challenges} onChange={e => updateField('challenges', e.target.value)} />
                </div>
                {/* Wins */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5" htmlFor="wins">Notable Wins This Sprint</label>
                  <textarea id="wins" rows={3} placeholder="What went well? Celebrate the wins!"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-slate-300"
                    value={form.wins} onChange={e => updateField('wins', e.target.value)} />
                </div>
                {/* Buttons */}
                <div className="flex gap-3 pt-2">
                  <button id="loadSampleBtn" onClick={loadSample}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200">
                    Load Sample Data
                  </button>
                  <button id="analyseBtn" onClick={analyseSprint} disabled={loading || !form.sprintName}
                    className="flex-1 py-2.5 px-4 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-300">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analysing…
                      </span>
                    ) : 'Analyse Sprint'}
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: RESULTS ── */}
          <section className="col-span-8 space-y-6">

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3 animate-fade-in-up">
                <span className="text-red-500 mt-0.5"><Icons.AlertCircle /></span>
                <div>
                  <p className="text-sm font-semibold text-red-800">Analysis Error</p>
                  <p className="text-xs text-red-600 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Spinner />
              </div>
            )}

            {/* Empty State */}
            {!loading && !result && !error && <EmptyState />}

            {/* ── SECTION 2: Health Score Panel ── */}
            {!loading && result && scores && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sprint Health Score</h2>
                  <span className={`px-3 py-1 text-xs font-bold rounded-full border ${ragBadge(result.ragStatus)}`}>
                    {result.ragStatus}
                  </span>
                </div>
                <div className="p-6">
                  {/* Score ring + narrative */}
                  <div className="flex items-center gap-8 mb-6">
                    <ScoreRing score={result.overallScore} />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">AI Assessment</h3>
                      <p className="text-sm text-slate-600 leading-relaxed">{result.narrative}</p>
                    </div>
                  </div>

                  {/* 4 Dimension Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    <DimensionCard
                      icon={<Icons.Zap />} title="Velocity Index"
                      value={scores.velocityIndex} suffix="%" maxVal={100}
                      color={scoreColor(scores.velocityIndex)} delay={1}
                    />
                    <DimensionCard
                      icon={<Icons.Target />} title="Predictability"
                      value={scores.predictabilityScore} suffix="%" maxVal={100}
                      color={scoreColor(scores.predictabilityScore)} delay={2}
                    />
                    <DimensionCard
                      icon={<Icons.Shield />} title="Blocker Resolution"
                      value={scores.blockerRate} suffix="%" maxVal={100}
                      color={scoreColor(scores.blockerRate)} delay={3}
                    />
                    <DimensionCard
                      icon={<Icons.Users />} title="Team Load"
                      value={scores.teamLoad} suffix={`pts/person · ${tl.label}`} maxVal={18}
                      color={tl.color} delay={4}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ── SECTION 3: Retro Agenda ── */}
            {!loading && result?.retroAgenda && (
              <div className="animate-fade-in-up animate-fade-in-up-delay-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Retrospective Agenda</h2>
                  <div className="flex gap-2">
                    <button id="copyAgendaBtn" onClick={copyAgenda}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                      {copyFeedback ? <><Icons.Check /> Copied!</> : <><Icons.Copy /> Copy Agenda</>}
                    </button>
                    <button id="exportReportBtn" onClick={exportReport}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-all">
                      <Icons.Download /> Export Report
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <RetroSection
                    title="What Went Well" color="#16a34a"
                    icon={<span className="text-lg">✅</span>}
                    items={result.retroAgenda.wentWell || []}
                  />
                  <RetroSection
                    title="What Needs Improvement" color="#d97706"
                    icon={<span className="text-lg">⚠️</span>}
                    items={result.retroAgenda.needsImprovement || []}
                  />
                  <RetroSection
                    title="Action Items" color="#3b82f6"
                    icon={<span className="text-lg">🎯</span>}
                    items={result.retroAgenda.actionItems || []} isAction
                  />
                  <RetroSection
                    title="Next Sprint Focus" color="#7c3aed"
                    icon={<span className="text-lg">🔮</span>}
                    items={result.retroAgenda.nextSprintFocus || []}
                  />
                </div>
              </div>
            )}

            {/* ── SECTION 4: Sprint Trend ── */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in-up animate-fade-in-up-delay-3">
              <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
                <Icons.TrendingUp />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Sprint Trend</h2>
              </div>
              <div className="p-6">
                {sprintHistory.length < 2 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center">
                      <Icons.TrendingUp />
                    </div>
                    <p className="text-sm text-slate-400 font-medium">Run 2+ sprints to see trend</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={sprintHistory} margin={{ top: 10, right: 30, bottom: 10, left: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                          fontSize: '12px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                      <Line type="monotone" dataKey="healthScore" name="Health Score"
                        stroke="#3b82f6" strokeWidth={3} dot={{ r: 5, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 7 }} />
                      <Line type="monotone" dataKey="velocityIndex" name="Velocity Index"
                        stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        activeDot={{ r: 7 }} strokeDasharray="6 3" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Built by <span className="font-semibold text-slate-500">Purva Kale</span> · AI Sprint Health Dashboard
          </p>
          <p className="text-xs text-slate-400">
            Powered by <span className="font-semibold text-slate-500">Ollama (LLaMA 3)</span> — Local AI
          </p>
        </div>
      </footer>
    </div>
  );
}
