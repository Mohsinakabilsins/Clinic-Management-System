import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import {
  Activity, ArrowUpRight, BarChart3, Bell, CalendarDays, Check, CheckCircle2, ChevronDown,
  Clock3, Download, LayoutDashboard, LogOut, Menu, MoreHorizontal, Pause, Play, Plus,
  RefreshCw, Search, Settings2, ShieldCheck, Stethoscope, TrendingUp, UserPlus, Users,
  X, Zap
} from "lucide-react";
import api, { API_URL, SOCKET_URL } from "./api";

const getUser = () => { try { return JSON.parse(localStorage.getItem("clinicq_user")); } catch { return null; } };
const initials = name => name?.split(" ").map(x => x[0]).join("").slice(0, 2).toUpperCase() || "CQ";
const label = value => String(value || "").replaceAll("_", " ");
const dateKey = (offset = 0) => { const d = new Date(); d.setDate(d.getDate() + offset); return d.toISOString().slice(0, 10); };
const money = n => `PKR ${Number(n || 0).toLocaleString()}`;

function Protected({ children }) { return getUser() ? children : <Navigate to="/login" replace />; }

function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@clinicq.com");
  const [password, setPassword] = useState("Admin123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("clinicq_token", data.token);
      localStorage.setItem("clinicq_user", JSON.stringify(data.user));
      nav("/dashboard");
    } catch (e) { setError(e.response?.data?.message || "Login failed"); }
    finally { setLoading(false); }
  }

  return <div className="min-h-screen bg-slate-950 p-4">
    <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
      <div className="hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <Brand light />
          <div className="mt-20 max-w-xl">
            <p className="eyebrow text-indigo-300">ClinicQ 2.0 / Operations OS</p>
            <h1 className="mt-5 text-6xl font-black leading-[1.03] tracking-tight">The calm way to run a busy clinic.</h1>
            <p className="mt-7 max-w-lg text-lg leading-8 text-indigo-100/70">Turn waiting rooms, doctors and patient flow into one beautifully simple operating system.</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {["Live queue", "Appointments", "Analytics"].map((x, i) => <div key={x} className="rounded-2xl border border-white/10 bg-white/10 p-4"><div className="text-2xl font-black">{["84", "36", "92%"][i]}</div><div className="mt-1 text-xs text-indigo-100/60">{x}</div></div>)}
        </div>
      </div>
      <div className="flex items-center justify-center p-8 sm:p-16">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden"><Brand /></div>
          <div className="mb-9"><div className="mb-5 inline-flex rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Stethoscope /></div><h2 className="text-3xl font-black tracking-tight">Welcome back</h2><p className="mt-2 text-slate-500">Sign in to your clinic workspace.</p></div>
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm font-semibold">Email<input className="input mt-2" value={email} onChange={e => setEmail(e.target.value)} /></label>
            <label className="block text-sm font-semibold">Password<input className="input mt-2" type="password" value={password} onChange={e => setPassword(e.target.value)} /></label>
            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <button className="primary w-full py-3.5" disabled={loading}>{loading ? "Signing in..." : "Sign in to ClinicQ"}<ArrowUpRight size={16} /></button>
          </form>
          <div className="mt-8 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-500"><b>Demo accounts</b><br />admin@clinicq.com / Admin123!<br />reception@clinicq.com / Reception123!<br />doctor@clinicq.com / Doctor123!</div>
        </div>
      </div>
    </div>
  </div>;
}

function Brand({ light = false }) {
  return <div className={`flex items-center gap-3 text-xl font-black ${light ? "text-white" : "text-slate-900"}`}><div className="rounded-xl bg-indigo-600 p-2 text-white"><Activity size={20} /></div>ClinicQ <span className="rounded-md bg-indigo-100 px-2 py-1 text-[9px] uppercase tracking-widest text-indigo-700">2.0</span></div>;
}

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/queue", label: "Live Queue", icon: Users },
  { to: "/appointments", label: "Appointments", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/team", label: "Team", icon: Stethoscope, admin: true },
  { to: "/settings", label: "Settings", icon: Settings2, admin: true }
];

function Sidebar({ open, setOpen }) {
  const location = useLocation();
  const nav = useNavigate();
  const u = getUser();
  return <><div className={`fixed inset-0 z-30 bg-slate-950/40 lg:hidden ${open ? "block" : "hidden"}`} onClick={() => setOpen(false)} />
    <aside className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-slate-950 text-white transition-transform lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
      <div className="px-7 py-7"><Brand light /></div>
      <div className="px-4"><p className="eyebrow px-3 pb-3 text-slate-500">Workspace</p>{navItems.filter(x => !x.admin || u?.role === "admin").map(item => <Link key={item.to} to={item.to} onClick={() => setOpen(false)} className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${location.pathname === item.to ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-white"}`}><item.icon size={17} />{item.label}{location.pathname === item.to && <span className="ml-auto h-2 w-2 rounded-full bg-indigo-200" />}</Link>)}</div>
      <div className="mt-auto p-4"><div className="mb-3 rounded-2xl border border-white/5 bg-white/5 p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 text-sm font-black">{initials(u?.name)}</div><div className="min-w-0"><div className="truncate text-sm font-bold">{u?.name}</div><div className="truncate text-xs capitalize text-slate-500">{u?.role}</div></div></div></div><button onClick={() => { localStorage.clear(); nav("/login"); }} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 hover:bg-white/5 hover:text-white"><LogOut size={17} />Sign out</button></div>
    </aside></>;
}

function Shell({ children }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const u = getUser();
  useEffect(() => { api.get("/notifications").then(r => setNotifications(r.data)).catch(() => {}); }, []);
  const unread = notifications.filter(n => !n.read).length;
  async function markAll() { await api.patch("/notifications/read-all"); setNotifications(x => x.map(n => ({ ...n, read: true }))); }
  return <div className="flex min-h-screen bg-[#f7f8fc]"><Sidebar open={open} setOpen={setOpen} /><div className="min-w-0 flex-1">
    <header className="relative flex h-20 items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur sm:px-8"><button className="rounded-xl p-2 lg:hidden" onClick={() => setOpen(true)}><Menu /></button><div className="hidden lg:block"><p className="eyebrow text-slate-400">Clinic operations</p><p className="mt-1 text-sm font-semibold text-slate-700">Good systems make busy days feel simple.</p></div><div className="ml-auto flex items-center gap-3"><button onClick={() => setShowNotifications(!showNotifications)} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"><Bell size={18} />{unread > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white">{unread}</span>}</button><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-sm font-black text-indigo-700">{initials(u?.name)}</div></div>{showNotifications && <div className="absolute right-5 top-16 z-50 w-96 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl"><div className="flex items-center justify-between px-3 py-2"><b>Notifications</b><button className="text-xs font-semibold text-indigo-600" onClick={markAll}>Mark all read</button></div>{notifications.length ? notifications.slice(0, 5).map(n => <div key={n._id} className={`rounded-xl p-3 ${n.read ? "" : "bg-indigo-50"}`}><div className="text-sm font-bold">{n.title}</div><div className="mt-1 text-xs text-slate-500">{n.message}</div></div>) : <div className="p-5 text-center text-sm text-slate-400">You're all caught up.</div>}</div>}</header>
    <main className="mx-auto max-w-[1600px] p-5 sm:p-8">{children}</main>
  </div></div>;
}

function PageHeader({ eyebrow, title, subtitle, actions }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 xl:flex-row xl:items-end"><div><p className="eyebrow text-indigo-600">{eyebrow}</p><h1 className="mt-3 text-4xl font-black tracking-tight">{title}</h1>{subtitle && <p className="mt-2 text-slate-500">{subtitle}</p>}</div><div className="flex flex-wrap gap-3">{actions}</div></div>;
}

function Stat({ label: title, value, sub, icon: Icon, trend }) {
  return <div className="card p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{title}</p><p className="mt-3 text-3xl font-black tracking-tight">{value}</p><p className="mt-2 flex items-center gap-1 text-xs text-slate-400">{trend && <span className="font-bold text-emerald-600">↗ {trend}</span>}{sub}</p></div><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Icon size={20} /></div></div></div>;
}

function Progress({ label: title, value, total, color = "bg-indigo-500" }) {
  const pct = Math.min(100, Math.round(value / Math.max(total, 1) * 100));
  return <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-600">{title}</span><span className="text-slate-400">{value} · {pct}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} /></div></div>;
}

function Dashboard() {
  const u = getUser(), canManage = ["admin", "receptionist"].includes(u?.role);
  const [doctors, setDoctors] = useState([]), [doctorId, setDoctorId] = useState(u?.doctorId || ""), [tokens, setTokens] = useState([]), [appointments, setAppointments] = useState([]), [report, setReport] = useState(null), [analytics, setAnalytics] = useState(null), [clinic, setClinic] = useState(null), [form, setForm] = useState({ patientName: "", mobile: "" }), [toast, setToast] = useState("");
  const current = tokens.find(t => ["called", "in_consultation"].includes(t.status)), waiting = tokens.filter(t => t.status === "waiting"), completed = report?.completed ?? tokens.filter(t => t.status === "completed").length, total = report?.total ?? tokens.length;

  async function load() {
    try {
      const [d, q, a, c, r, an] = await Promise.all([
        api.get("/doctors"), api.get(`/queue${doctorId ? `?doctorId=${doctorId}` : ""}`), api.get("/appointments"), api.get("/clinic/me"), api.get("/reports/daily"), api.get("/reports/analytics")
      ]);
      setDoctors(d.data); setTokens(q.data); setAppointments(a.data); setClinic(c.data); setReport(r.data); setAnalytics(an.data);
      if (!doctorId && d.data[0]) setDoctorId(d.data[0]._id);
    } catch (e) { setToast(e.response?.data?.message || "Unable to load workspace"); }
  }
  useEffect(() => { load(); }, [doctorId]);
  useEffect(() => { const s = io(SOCKET_URL); s.emit("clinic:join", u.clinicId); s.on("queue:updated", load); s.on("appointments:updated", load); return () => s.disconnect(); }, [doctorId]);

  async function create(e) {
    e.preventDefault();
    try { const { data } = await api.post("/queue/tokens", { ...form, doctorId }); setForm({ patientName: "", mobile: "" }); setToast(`Token #${data.sequence} created successfully`); load(); }
    catch (e) { setToast(e.response?.data?.message || "Could not create token"); }
  }
  async function status(id, next) { try { await api.patch(`/queue/tokens/${id}/status`, { status: next }); load(); } catch (e) { setToast(e.response?.data?.message || "Action failed"); } }

  return <Shell><PageHeader eyebrow="Overview / Today" title={`Good morning, ${u?.name?.split(" ")[0]}.`} subtitle={`Here's what's happening at ${clinic?.name || "your clinic"} today.`} actions={<><button className="soft" onClick={load}><RefreshCw size={16} />Refresh</button>{canManage && <button className="primary" onClick={() => document.getElementById("new-patient")?.scrollIntoView({ behavior: "smooth" })}><Plus size={17} />Add patient</button>}</>} />
    {toast && <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700"><span>{toast}</span><button onClick={() => setToast("")}><X size={17} /></button></div>}
    <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Patients today" value={total} sub="across all queues" trend="+12%" icon={Users} /><Stat title="Currently waiting" value={waiting.length} sub="patients in active queue" icon={Clock3} /><Stat title="In consultation" value={current ? `#${current.sequence}` : "—"} sub={current ? "live consultation" : "no active consultation"} icon={Activity} /><Stat title="Completion rate" value={`${report?.total ? Math.round(completed / report.total * 100) : 0}%`} sub="today's patient flow" trend="+4.8%" icon={TrendingUp} /></div>
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
      <div className="space-y-6">
        <div className="card overflow-hidden"><div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-3"><h2 className="text-xl font-black">Live queue</h2><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">● Live</span></div><p className="mt-1 text-sm text-slate-400">Real-time patient flow and consultation status</p></div><select className="input max-w-xs" value={doctorId} onChange={e => setDoctorId(e.target.value)}>{doctors.map(d => <option key={d._id} value={d._id}>{d.name} · {d.specialty}</option>)}</select></div><div className="divide-y divide-slate-100">{tokens.length ? tokens.slice(0, 6).map(t => <QueueRow key={t._id} token={t} onStatus={status} doctor={u?.role === "doctor"} />) : <Empty icon={Users} title="Queue is clear" text="Add a patient to start today's queue." />}</div><div className="border-t border-slate-100 p-4 text-center"><Link className="text-sm font-bold text-indigo-600 hover:text-indigo-700" to="/queue">Open full queue →</Link></div></div>
        <div className="grid gap-6 lg:grid-cols-2"><div className="card p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-black">Patient flow</h2><p className="mt-1 text-sm text-slate-400">Last 7 days</p></div><BarChart3 className="text-indigo-500" /></div><MiniChart data={analytics?.days || []} /></div><div className="card p-6"><div className="mb-6 flex items-center justify-between"><div><h2 className="text-lg font-black">Queue performance</h2><p className="mt-1 text-sm text-slate-400">Patient distribution today</p></div><Zap className="text-indigo-500" /></div><div className="space-y-5"><Progress label="Completed" value={completed} total={total} color="bg-emerald-500" /><Progress label="Waiting" value={waiting.length} total={total} color="bg-amber-400" /><Progress label="Skipped / other" value={Math.max(total - completed - waiting.length, 0)} total={total} color="bg-slate-300" /></div></div></div>
      </div>
      <div className="space-y-6">
        <div id="new-patient" className="card p-6"><div className="mb-6 flex items-center gap-3"><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><UserPlus size={20} /></div><div><h2 className="font-black">New patient</h2><p className="text-sm text-slate-400">Generate a queue token</p></div></div><form onSubmit={create} className="space-y-4"><input className="input" placeholder="Patient full name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required /><input className="input" placeholder="Mobile number (optional)" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /><button className="primary w-full py-3">Generate token <Plus size={16} /></button></form></div>
        <div className="card overflow-hidden"><div className="border-b border-slate-100 p-6"><div className="flex items-center justify-between"><div><h2 className="font-black">Today's schedule</h2><p className="mt-1 text-sm text-slate-400">{appointments.length} appointments</p></div><CalendarDays className="text-indigo-500" /></div></div><div className="divide-y divide-slate-100">{appointments.slice(0, 5).map(a => <AppointmentRow key={a._id} appointment={a} compact />)}<Link className="block p-4 text-center text-sm font-bold text-indigo-600" to="/appointments">View schedule →</Link></div></div>
        <div className="card p-6"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-black">Clinic pulse</h2><p className="mt-1 text-sm text-slate-400">Operational health</p></div><Activity className="text-emerald-500" /></div><div className="space-y-4"><Pulse label="Queue health" value="Excellent" percent={92} /><Pulse label="Patient flow" value="On track" percent={84} /><Pulse label="Team coverage" value="Full" percent={100} /></div></div>
      </div>
    </div>
  </Shell>;
}

function QueueRow({ token, onStatus, doctor }) {
  const next = token.status === "waiting" ? "called" : token.status === "called" ? "in_consultation" : token.status === "in_consultation" ? "completed" : null;
  return <div className="flex flex-col gap-4 px-5 py-4 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-black ${token.status === "in_consultation" ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"}`}>#{token.sequence}</div><div><div className="font-bold">{token.patientName}</div><div className="mt-1 flex items-center gap-2 text-xs capitalize text-slate-400"><span className={`h-2 w-2 rounded-full ${token.status === "completed" ? "bg-emerald-400" : token.status === "in_consultation" ? "bg-indigo-500" : token.status === "waiting" ? "bg-amber-400" : "bg-slate-300"}`} />{label(token.status)}</div></div></div><div className="flex flex-wrap items-center gap-2">{next && doctor && <button className="primary" onClick={() => onStatus(token._id, next)}>{next === "called" ? "Call next" : next === "in_consultation" ? "Start visit" : "Complete"}</button>}{["waiting", "called"].includes(token.status) && <button className="soft" onClick={() => onStatus(token._id, "skipped")}>Skip</button>}<a className="soft" href={`/queue/${token.publicCode}`} target="_blank" rel="noreferrer">View patient</a><button className="rounded-xl p-2.5 text-slate-400 hover:bg-slate-100"><MoreHorizontal size={18} /></button></div></div>;
}

function QueuePage() {
  const u = getUser(), canManage = ["admin", "receptionist"].includes(u?.role);
  const [doctors, setDoctors] = useState([]), [doctorId, setDoctorId] = useState(u?.doctorId || ""), [tokens, setTokens] = useState([]), [clinic, setClinic] = useState(null), [search, setSearch] = useState(""), [toast, setToast] = useState("");
  async function load() { try { const [d, q, c] = await Promise.all([api.get("/doctors"), api.get(`/queue${doctorId ? `?doctorId=${doctorId}` : ""}`), api.get("/clinic/me")]); setDoctors(d.data); setTokens(q.data); setClinic(c.data); if (!doctorId && d.data[0]) setDoctorId(d.data[0]._id); } catch (e) { setToast(e.response?.data?.message || "Could not load queue"); } }
  useEffect(() => { load(); }, [doctorId]);
  useEffect(() => { const s = io(SOCKET_URL); s.emit("clinic:join", u.clinicId); s.on("queue:updated", load); return () => s.disconnect(); }, [doctorId]);
  async function status(id, next) { try { await api.patch(`/queue/tokens/${id}/status`, { status: next }); load(); } catch (e) { setToast(e.response?.data?.message || "Action failed"); } }
  const visible = tokens.filter(t => t.patientName.toLowerCase().includes(search.toLowerCase()) || String(t.sequence).includes(search));
  return <Shell><PageHeader eyebrow="Operations / Live Queue" title="Live queue" subtitle="Manage today's patient flow in real time." actions={<><button className="soft" onClick={load}><RefreshCw size={16} />Refresh</button>{canManage && <Link className="primary" to="/dashboard"><Plus size={17} />Add patient</Link>}</>} />{toast && <Toast text={toast} close={() => setToast("")} />}<div className="card overflow-hidden"><div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="flex items-center gap-3"><h2 className="text-xl font-black">{tokens.length} patients today</h2><span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${clinic?.queuePaused ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}>{clinic?.queuePaused ? "Paused" : "● Live"}</span></div><p className="mt-1 text-sm text-slate-400">All active queue activity is synchronized live.</p></div><div className="flex gap-3"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={17} /><input className="input pl-10" placeholder="Search patient or token" value={search} onChange={e => setSearch(e.target.value)} /></div><select className="input max-w-xs" value={doctorId} onChange={e => setDoctorId(e.target.value)}>{doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></div></div><div className="divide-y divide-slate-100">{visible.length ? visible.map(t => <QueueRow key={t._id} token={t} onStatus={status} doctor={u?.role === "doctor" || canManage} />) : <Empty icon={Users} title="No patients found" text="Try another search or add a patient." />}</div></div></Shell>;
}

function AppointmentsPage() {
  const u = getUser(), canManage = ["admin", "receptionist"].includes(u?.role);
  const [appointments, setAppointments] = useState([]), [doctors, setDoctors] = useState([]), [date, setDate] = useState(dateKey()), [modal, setModal] = useState(false), [form, setForm] = useState({ patientName: "", mobile: "", doctorId: "", dateKey: dateKey(), time: "09:00", type: "Consultation", notes: "" }), [toast, setToast] = useState("");
  async function load() { try { const [a, d] = await Promise.all([api.get(`/appointments?date=${date}`), api.get("/doctors")]); setAppointments(a.data); setDoctors(d.data); if (!form.doctorId && d.data[0]) setForm(x => ({ ...x, doctorId: d.data[0]._id })); } catch (e) { setToast(e.response?.data?.message || "Unable to load appointments"); } }
  useEffect(() => { load(); }, [date]);
  async function create(e) { e.preventDefault(); try { await api.post("/appointments", { ...form, dateKey: date }); setModal(false); setForm(x => ({ ...x, patientName: "", mobile: "", notes: "" })); load(); } catch (e) { setToast(e.response?.data?.message || "Could not create appointment"); } }
  async function status(id, value) { await api.patch(`/appointments/${id}/status`, { status: value }); load(); }
  return <Shell><PageHeader eyebrow="Operations / Schedule" title="Appointments" subtitle="Keep the clinic day visible, organized and predictable." actions={<><input type="date" className="input max-w-[170px]" value={date} onChange={e => setDate(e.target.value)} />{canManage && <button className="primary" onClick={() => setModal(true)}><Plus size={17} />New appointment</button>}</>} />{toast && <Toast text={toast} close={() => setToast("")} />}<div className="grid gap-6 xl:grid-cols-[1fr_340px]"><div className="card overflow-hidden"><div className="border-b border-slate-100 p-6"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black">{new Date(`${date}T12:00`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</h2><p className="mt-1 text-sm text-slate-400">{appointments.length} scheduled appointments</p></div><CalendarDays className="text-indigo-500" /></div></div><div className="divide-y divide-slate-100">{appointments.length ? appointments.map(a => <AppointmentRow key={a._id} appointment={a} onStatus={status} />) : <Empty icon={CalendarDays} title="No appointments" text="Your schedule is clear for this date." />}</div></div><div className="space-y-6"><div className="card p-6"><p className="eyebrow text-indigo-600">Schedule health</p><div className="mt-5 space-y-4"><Pulse label="Booked" value={`${appointments.length} slots`} percent={Math.min(100, appointments.length / 12 * 100)} /><Pulse label="Completed" value={`${appointments.filter(a => a.status === "completed").length} visits`} percent={appointments.length ? appointments.filter(a => a.status === "completed").length / appointments.length * 100 : 0} /><Pulse label="Available capacity" value={`${Math.max(12 - appointments.length, 0)} slots`} percent={Math.max(0, 100 - appointments.length / 12 * 100)} /></div></div><div className="card p-6"><div className="flex items-center gap-3"><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><ShieldCheck size={20} /></div><div><h3 className="font-black">Smart scheduling</h3><p className="text-sm text-slate-400">Appointments and queue are connected.</p></div></div></div></div></div>{modal && <Modal title="New appointment" close={() => setModal(false)}><form onSubmit={create} className="space-y-4"><input className="input" placeholder="Patient name" value={form.patientName} onChange={e => setForm({ ...form, patientName: e.target.value })} required /><input className="input" placeholder="Mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value })} /><div className="grid grid-cols-2 gap-3"><input type="time" className="input" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /><select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>Consultation</option><option>Follow-up</option><option>Procedure</option></select></div><select className="input" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>{doctors.map(d => <option key={d._id} value={d._id}>{d.name} · {d.specialty}</option>)}</select><textarea className="input min-h-24" placeholder="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /><button className="primary w-full">Create appointment</button></form></Modal>}</Shell>;
}

function AppointmentRow({ appointment: a, onStatus, compact = false }) {
  return <div className={`flex items-center gap-4 ${compact ? "p-4" : "px-6 py-5"}`}><div className="w-14 text-center"><div className="text-sm font-black text-indigo-600">{a.time}</div><div className="mt-1 text-[10px] uppercase text-slate-400">{a.status === "completed" ? "done" : "slot"}</div></div><div className="h-10 w-px bg-slate-200" /><div className="min-w-0 flex-1"><div className="truncate font-bold">{a.patientName}</div><div className="mt-1 truncate text-xs text-slate-400">{a.doctorId?.name} · {a.type}</div></div>{!compact && <div className="flex items-center gap-2">{a.status === "scheduled" && <button className="soft" onClick={() => onStatus(a._id, "checked_in")}><Check size={15} />Check in</button>}{a.status === "checked_in" && <button className="primary" onClick={() => onStatus(a._id, "completed")}>Complete</button>}<span className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${a.status === "completed" ? "bg-emerald-50 text-emerald-600" : a.status === "cancelled" ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-600"}`}>{label(a.status)}</span></div>}</div>;
}

function AnalyticsPage() {
  const [data, setData] = useState(null), [report, setReport] = useState(null);
  useEffect(() => { Promise.all([api.get("/reports/analytics"), api.get("/reports/daily")]).then(([a, r]) => { setData(a.data); setReport(r.data); }); }, []);
  return <Shell><PageHeader eyebrow="Insights / Performance" title="Analytics" subtitle="A clear view of how your clinic is moving." actions={<button className="soft" onClick={() => window.open(`${API_URL}/reports/csv`, "_blank")}><Download size={16} />Export report</button>} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Stat title="Patients today" value={data?.totals?.patients ?? "—"} sub="current day" icon={Users} /><Stat title="Completed visits" value={data?.totals?.completed ?? "—"} sub="current day" icon={CheckCircle2} /><Stat title="Completion rate" value={`${data?.totals?.completionRate ?? 0}%`} sub="conversion of queue" icon={TrendingUp} /><Stat title="Average wait" value={`${data?.totals?.averageWait ?? 0}m`} sub="before consultation" icon={Clock3} /></div><div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]"><div className="card p-6"><div className="mb-7 flex items-center justify-between"><div><h2 className="text-xl font-black">Patient volume</h2><p className="mt-1 text-sm text-slate-400">Rolling seven-day view</p></div><BarChart3 className="text-indigo-500" /></div><MiniChart data={data?.days || []} large /></div><div className="card p-6"><div className="mb-7 flex items-center justify-between"><div><h2 className="text-xl font-black">Today's mix</h2><p className="mt-1 text-sm text-slate-400">Queue outcome breakdown</p></div><Activity className="text-indigo-500" /></div><div className="space-y-6"><Progress label="Completed" value={report?.completed || 0} total={report?.total || 1} color="bg-emerald-500" /><Progress label="Waiting" value={report?.waiting || 0} total={report?.total || 1} color="bg-amber-400" /><Progress label="Skipped" value={report?.skipped || 0} total={report?.total || 1} color="bg-slate-400" /></div><div className="mt-8 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-indigo-50 p-4"><div className="text-xs text-indigo-600">Appointments</div><div className="mt-1 text-2xl font-black">{report?.appointments || 0}</div></div><div className="rounded-2xl bg-emerald-50 p-4"><div className="text-xs text-emerald-600">No shows</div><div className="mt-1 text-2xl font-black">{report?.noShow || 0}</div></div></div></div></div></Shell>;
}

function MiniChart({ data, large = false }) {
  const max = Math.max(...data.map(x => x.total || 0), 1);
  return <div className={`flex items-end gap-3 ${large ? "h-80" : "h-48"}`}>{data.map(x => <div key={x.date} className="flex flex-1 flex-col items-center gap-3"><div className="flex h-full w-full items-end justify-center gap-1">{<div className="w-1/2 rounded-t-xl bg-indigo-500 transition-all" style={{ height: `${Math.max(6, (x.total / max) * 100)}%` }} />}{<div className="w-1/2 rounded-t-xl bg-indigo-100 transition-all" style={{ height: `${Math.max(6, (x.completed / max) * 100)}%` }} />}</div><span className="text-[10px] text-slate-400">{x.label}</span></div>)}</div>;
}

function TeamPage() {
  const [doctors, setDoctors] = useState([]), [users, setUsers] = useState([]), [modal, setModal] = useState(false), [form, setForm] = useState({ name: "", email: "", password: "Staff123!", role: "receptionist", doctorId: "" }), [toast, setToast] = useState("");
  async function load() { const [d, u] = await Promise.all([api.get("/doctors"), api.get("/users")]); setDoctors(d.data); setUsers(u.data); }
  useEffect(() => { load(); }, []);
  async function addUser(e) { e.preventDefault(); try { await api.post("/users", form); setModal(false); setForm({ name: "", email: "", password: "Staff123!", role: "receptionist", doctorId: "" }); load(); } catch (e) { setToast(e.response?.data?.message || "Could not add team member"); } }
  return <Shell><PageHeader eyebrow="People / Team" title="Team" subtitle="Your clinic's people, roles and specialist coverage." actions={<button className="primary" onClick={() => setModal(true)}><Plus size={17} />Add team member</button>} />{toast && <Toast text={toast} close={() => setToast("")} />}<div className="grid gap-6 xl:grid-cols-2"><div className="card overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="text-xl font-black">Doctors</h2><p className="mt-1 text-sm text-slate-400">{doctors.length} specialists on your clinic team</p></div><div className="divide-y divide-slate-100">{doctors.map(d => <div key={d._id} className="flex items-center gap-4 p-5"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 font-black text-indigo-700">{initials(d.name)}</div><div className="min-w-0 flex-1"><div className="font-bold">{d.name}</div><div className="mt-1 text-sm text-slate-400">{d.specialty}</div></div><div className="text-right"><div className="text-sm font-bold">{money(d.consultationFee)}</div><div className="mt-1 text-xs text-slate-400">{d.averageDuration} min avg.</div></div></div>)}</div></div><div className="card overflow-hidden"><div className="border-b border-slate-100 p-6"><h2 className="text-xl font-black">Workspace access</h2><p className="mt-1 text-sm text-slate-400">{users.length} users with access</p></div><div className="divide-y divide-slate-100">{users.map(u => <div key={u._id} className="flex items-center gap-4 p-5"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-600">{initials(u.name)}</div><div className="min-w-0 flex-1"><div className="font-bold">{u.name}</div><div className="mt-1 truncate text-xs text-slate-400">{u.email}</div></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">{u.role}</span></div>)}</div></div></div>{modal && <Modal title="Add team member" close={() => setModal(false)}><form onSubmit={addUser} className="space-y-4"><input className="input" placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /><input className="input" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /><select className="input" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}><option value="receptionist">Receptionist</option><option value="doctor">Doctor</option></select>{form.role === "doctor" && <select className="input" value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })}>{doctors.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select>}<input className="input" type="password" placeholder="Temporary password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required /><button className="primary w-full">Create access</button></form></Modal>}</Shell>;
}

function SettingsPage() {
  const [clinic, setClinic] = useState(null), [saved, setSaved] = useState(false);
  useEffect(() => { api.get("/clinic/me").then(r => setClinic(r.data)); }, []);
  async function save(e) { e.preventDefault(); await api.patch("/clinic/settings", clinic); setSaved(true); setTimeout(() => setSaved(false), 2500); }
  if (!clinic) return <Shell><div className="card p-10">Loading settings...</div></Shell>;
  return <Shell><PageHeader eyebrow="Workspace / Settings" title="Clinic settings" subtitle="Configure the way your clinic operates." />{saved && <div className="mb-6 rounded-2xl bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">Settings saved successfully.</div>}<div className="grid gap-6 xl:grid-cols-[1fr_360px]"><form onSubmit={save} className="card p-6 sm:p-8"><div className="mb-8"><h2 className="text-xl font-black">Clinic profile</h2><p className="mt-1 text-sm text-slate-400">The information your team sees across ClinicQ.</p></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Clinic name<input className="input mt-2" value={clinic.name || ""} onChange={e => setClinic({ ...clinic, name: e.target.value })} /></label><label className="text-sm font-semibold">Location<input className="input mt-2" value={clinic.location || ""} onChange={e => setClinic({ ...clinic, location: e.target.value })} /></label><label className="text-sm font-semibold">Phone<input className="input mt-2" value={clinic.phone || ""} onChange={e => setClinic({ ...clinic, phone: e.target.value })} /></label><label className="text-sm font-semibold">Email<input className="input mt-2" value={clinic.email || ""} onChange={e => setClinic({ ...clinic, email: e.target.value })} /></label><label className="text-sm font-semibold">Opening time<input type="time" className="input mt-2" value={clinic.openingTime || "09:00"} onChange={e => setClinic({ ...clinic, openingTime: e.target.value })} /></label><label className="text-sm font-semibold">Closing time<input type="time" className="input mt-2" value={clinic.closingTime || "18:00"} onChange={e => setClinic({ ...clinic, closingTime: e.target.value })} /></label></div><button className="primary mt-8">Save changes</button></form><div className="space-y-6"><div className="card p-6"><div className="flex items-center gap-3"><div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><Settings2 size={20} /></div><div><h3 className="font-black">Operating model</h3><p className="text-sm text-slate-400">Current clinic configuration</p></div></div><div className="mt-6 space-y-4"><div className="flex justify-between text-sm"><span className="text-slate-500">Average consultation</span><b>{clinic.averageConsultationTime} min</b></div><div className="flex justify-between text-sm"><span className="text-slate-500">Timezone</span><b>{clinic.timezone}</b></div><div className="flex justify-between text-sm"><span className="text-slate-500">Queue system</span><b className="text-emerald-600">Real-time</b></div></div></div><div className="rounded-2xl bg-slate-950 p-6 text-white"><ShieldCheck className="text-indigo-400" /><h3 className="mt-5 font-black">Built for your team</h3><p className="mt-2 text-sm leading-6 text-slate-400">ClinicQ keeps your clinic data isolated, role-aware and easy to operate.</p></div></div></div></Shell>;
}

function PublicQueue() {
  const { code } = useParams(), [data, setData] = useState(null), [error, setError] = useState("");
  async function load() { try { setData((await api.get(`/queue/public/${code}`)).data); } catch (e) { setError(e.response?.data?.message || "Queue not found"); } }
  useEffect(() => { load(); }, [code]);
  useEffect(() => { const s = io(SOCKET_URL); s.emit("public:join", code); s.on("queue:updated", load); return () => s.disconnect(); }, [code]);
  if (error) return <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6"><div className="card p-10 text-center"><h1 className="text-2xl font-black">Queue unavailable</h1><p className="mt-2 text-slate-500">{error}</p></div></div>;
  if (!data) return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">Loading your queue...</div>;
  return <div className="min-h-screen bg-slate-950 px-4 py-10"><div className="mx-auto max-w-xl"><div className="mb-8 flex items-center justify-between text-white"><Brand light /><span className="text-xs text-emerald-300">● Live</span></div><div className="rounded-[2rem] bg-white p-7 shadow-2xl sm:p-10"><div className="text-center"><p className="eyebrow text-slate-400">Your queue token</p><div className="my-5 text-8xl font-black tracking-tight text-indigo-600">#{data.token}</div><p className="font-semibold text-slate-700">{data.doctorName}</p><p className="mt-1 text-sm text-slate-400">{data.clinicName}</p></div><div className="mt-9 grid grid-cols-2 gap-4"><div className="rounded-3xl bg-indigo-50 p-6 text-center"><p className="text-4xl font-black text-indigo-600">{data.patientsBefore}</p><p className="mt-2 text-sm text-slate-500">Patients before you</p></div><div className="rounded-3xl bg-slate-100 p-6 text-center"><p className="text-4xl font-black">{data.estimatedMinutes}<span className="text-xl">m</span></p><p className="mt-2 text-sm text-slate-500">Estimated wait</p></div></div><div className="mt-5 rounded-3xl border border-slate-200 p-6 text-center"><p className="eyebrow text-slate-400">Current status</p><p className="mt-3 text-2xl font-black capitalize text-indigo-600">{label(data.status)}</p>{data.queuePaused && <p className="mt-2 text-sm text-amber-600">The clinic queue is temporarily paused.</p>}</div><p className="mt-7 text-center text-xs text-slate-400">This page updates automatically. You can keep it open.</p></div></div></div>;
}

function Pulse({ label: title, value, percent }) { return <div><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-600">{title}</span><span className="font-bold text-slate-700">{value}</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} /></div></div>; }
function Empty({ icon: Icon, title, text }) { return <div className="p-16 text-center"><div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400"><Icon /></div><p className="font-bold">{title}</p><p className="mt-1 text-sm text-slate-400">{text}</p></div>; }
function Toast({ text, close }) { return <div className="mb-6 flex items-center justify-between rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-semibold text-indigo-700">{text}<button onClick={close}><X size={17} /></button></div>; }
function Modal({ title, close, children }) { return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4"><div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8"><div className="mb-6 flex items-center justify-between"><h2 className="text-2xl font-black">{title}</h2><button className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" onClick={close}><X /></button></div>{children}</div></div>; }

function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/queue/:code" element={<PublicQueue />} />
    <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
    <Route path="/queue" element={<Protected><QueuePage /></Protected>} />
    <Route path="/appointments" element={<Protected><AppointmentsPage /></Protected>} />
    <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
    <Route path="/team" element={<Protected><TeamPage /></Protected>} />
    <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
    <Route path="*" element={<Navigate to={getUser() ? "/dashboard" : "/login"} replace />} />
  </Routes>;
}

export default App;
