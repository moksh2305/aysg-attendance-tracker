import { useState, useEffect, useRef } from "react";

const ADMIN_PASSWORD = "ParamAYSG1008";

const MEMBER_NAMES = [
  "Dhairya Nandu",
  "Dheer Sheth",
  "Dhruv Ghatalia",
  "Moksh Shah",
  "Priyal Chabhadia",
  "Dharmi Sanghvi",
  "Krish Talsania",
  "Jainam Jobalia",
  "Kinjal Gangar",
  "Anmol Shah",
  "Chintan Gada",
  "Siddhi Doshi",
  "Krisha Shah",
  "Dev Patel",
  "Vaibhavee Turakhia",
  "Chintan Barvalia",
  "Apurva bhai",
  "Bhavik Shah",
  "Kavya Bhayani",
  "Mansi Sanghvi",
  "Hetvi Sanghvi",
  "Shubh Sanghrajka",
  "Henal Parekh",
  "Yasha Chheda",
  "Dev Savla",
  "Vama Shah",
  "Khushi Bhayani",
  "Jheel Mehta",
  "Jinen Doshi",
  "Vishwa Shah",
  "Priti Sharma",
  "Ravi Shah",
  "Meeta Mehta",
  "Preesha Kothari",
  "Riya Ajmera",
  "Tirth Desai",
  "Vanshi Kamdar",
  "Disha Mehta",
  "Frreya Shah",
  "Jinesh Shah",
  "Neeti Gosalia",
  "Darshit Shah",
  "Heet Bhai",
  "Khushi Bedmutha",
  "Maitri Sawla",
  "Umang Bhai",
  "Vaiibbhav Kothari",
  "Neeti D",
  "Vineet Parekh",
  "Megh Doshi",
  "Miheet Bhai",
  "Sidhharth Shah",
  "Vidhi Shah",
  "Yashvir Chheda",
  "Akshat Jain",
  "Ashish Charla",
  "Dhruvi Didi",
  "Diya Didi",
  "Hardik Shah",
  "Hetvi Bhayani",
  "Naitik Bhai",
  "Prachi Shah",
  "Shruti Doshi",
  "Viha Modi",
  "Vishva Sheth",
  "Yash Mehta",
];

const INITIAL_MEMBERS = MEMBER_NAMES.map((name, index) => ({
  id: `M${String(index + 1).padStart(3, "0")}`,
  name,
  mobile: "",
  area: "",
  gender: "",
  notes: "",
  joinDate: "",
  active: true,
}));

const NEW_JOINEE_NAMES = [
  "Riya Shah",
  "Kripa",
  "Yashvi Chheda",
  "Bhavya Kothari",
  "Devanishi",
  "Rupali",
  "Kunjal",
  "Suraj Sharma",
  "Saakshi Desai",
  "Viraj",
  "Vedant",
  "Tanish",
  "Krish Mehta",
  "Priyal Gosalia",
  "Sneha",
  "Vrushti Gala",
  "Jainam Bhayani",
  "Mayuri",
  "Priyal",
  "Parva",
  "Sakshi",
  "Moksh",
  "Vanisha",
];

const INITIAL_NEW_JOINEES = NEW_JOINEE_NAMES.map((name, index) => ({
  id: `N${String(index + 1).padStart(3, "0")}`,
  name,
  joinDate: "",
  notes: "",
  active: true,
}));

const DEMO_MEMBER_NAMES = [
  "Arjun Mehta",
  "Priya Shah",
  "Ravi Patel",
  "Sneha Joshi",
  "Karan Desai",
  "Meera Nair",
  "Vikram Sharma",
  "Anita Gupta",
  "Rohit Verma",
  "Pooja Thakur",
];

const INITIAL_EVENTS = [
  { id: "E001", name: "Monthly Sabha", date: "2024-03-15", time: "09:00", venue: "Community Hall, Borivali", category: "Religious", notes: "Monthly gathering", color: "#6366f1" },
  { id: "E002", name: "Blood Donation Camp", date: "2024-03-22", time: "10:00", venue: "Lions Club, Andheri", category: "Social", notes: "Seva activity", color: "#ec4899" },
  { id: "E003", name: "Youth Meet", date: "2024-04-05", time: "17:00", venue: "Park, Kandivali", category: "Social", notes: "Networking", color: "#14b8a6" },
];

const DEMO_ATTENDANCE = {
  "E001": { "M001": true, "M002": true, "M003": false, "M004": true, "M005": true, "M006": false, "M007": true, "M008": true, "M009": false, "M010": true },
  "E002": { "M001": false, "M002": true, "M003": true, "M004": true, "M005": false, "M006": true, "M007": false, "M008": true, "M009": true, "M010": false },
  "E003": { "M001": true, "M002": true, "M003": true, "M004": false, "M005": true, "M006": true, "M007": true, "M008": false, "M009": true, "M010": true },
};

const INITIAL_ATTENDANCE = {};

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function isDemoMemberList(members) {
  if (!Array.isArray(members) || members.length !== DEMO_MEMBER_NAMES.length) return false;
  const demoNames = new Set(DEMO_MEMBER_NAMES.map(normalizeName));
  return members.every(member => demoNames.has(normalizeName(member.name)));
}

function nextMemberId(usedIds) {
  let next = usedIds.size + 1;
  let id = `M${String(next).padStart(3, "0")}`;
  while (usedIds.has(id)) {
    next += 1;
    id = `M${String(next).padStart(3, "0")}`;
  }
  return id;
}

function migrateMembers(value) {
  if (!Array.isArray(value)) return INITIAL_MEMBERS;
  const base = isDemoMemberList(value) ? [] : value;
  const names = new Set(base.map(member => normalizeName(member.name)));
  const usedIds = new Set(base.map(member => member.id));
  const additions = INITIAL_MEMBERS
    .filter(member => !names.has(normalizeName(member.name)))
    .map(member => {
      const id = usedIds.has(member.id) ? nextMemberId(usedIds) : member.id;
      usedIds.add(id);
      return { ...member, id };
    });

  if (base.length !== value.length || additions.length > 0) return [...base, ...additions];
  return value;
}

function migrateAttendance(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return INITIAL_ATTENDANCE;
  return JSON.stringify(value) === JSON.stringify(DEMO_ATTENDANCE) ? INITIAL_ATTENDANCE : value;
}

function useLocalStorage(key, initial, migrate = value => value) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return migrate(s ? JSON.parse(s) : initial);
    } catch {
      return migrate(initial);
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // localStorage can be unavailable in private or restricted browser contexts.
    }
  }, [key, val]);
  return [val, setVal];
}

function genId(prefix) { return prefix + Date.now().toString(36).toUpperCase(); }

function fmtDate(d) { return d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""; }

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:#09090f;color:#e2e2f0;min-height:100vh;overflow-x:hidden}
:root{
  --bg:#09090f;--bg2:#0f0f1a;--bg3:#151525;--bg4:#1c1c30;
  --border:#ffffff12;--border2:#ffffff20;
  --accent:#7c6af8;--accent2:#a78bfa;--accent3:#5b46f5;
  --gold:#f0b429;--emerald:#10d47e;--rose:#f43f5e;--cyan:#06b6d4;
  --text:#e2e2f0;--text2:#9292b0;--text3:#5a5a7a;
  --card:rgba(255,255,255,0.03);--cardh:rgba(255,255,255,0.06);
  --glass:rgba(124,106,248,0.08);--glow:rgba(124,106,248,0.15);
}
.app{display:flex;height:100vh;overflow:hidden}
.sidebar{width:260px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;position:relative;z-index:10}
.sidebar::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(124,106,248,0.08) 0%,transparent 60%);pointer-events:none}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:60px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;gap:16px;flex-shrink:0}
.content{flex:1;overflow-y:auto;padding:24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.brand{padding:20px 20px 12px;border-bottom:1px solid var(--border)}
.brand-icon{width:40px;height:40px;border-radius:10px;background:linear-gradient(135deg,var(--accent3),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:18px;margin-bottom:10px;box-shadow:0 4px 20px var(--glow)}
.brand-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);line-height:1.3}
.brand-sub{font-size:11px;color:var(--accent2);font-weight:500;letter-spacing:0.5px;margin-top:2px}
.nav{padding:12px 8px;flex:1;overflow-y:auto}
.nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;cursor:pointer;font-size:13.5px;font-weight:500;color:var(--text2);transition:all 0.2s;margin-bottom:2px;position:relative;border:1px solid transparent}
.nav-item:hover{background:var(--cardh);color:var(--text);border-color:var(--border)}
.nav-item.active{background:var(--glass);color:var(--accent2);border-color:rgba(124,106,248,0.2)}
.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:var(--accent);border-radius:0 3px 3px 0}
.nav-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--bg3);transition:all 0.2s}
.nav-item.active .nav-icon{background:rgba(124,106,248,0.2)}
.nav-section{font-size:11px;font-weight:600;color:var(--text3);letter-spacing:1px;text-transform:uppercase;padding:16px 12px 8px}
.badge{background:rgba(124,106,248,0.2);color:var(--accent2);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-left:auto}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px}
.card-hover{transition:all 0.2s}
.card-hover:hover{background:var(--cardh);border-color:var(--border2);transform:translateY(-1px)}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:20px;position:relative;overflow:hidden;transition:all 0.2s}
.stat-card::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.02) 0%,transparent 100%);pointer-events:none}
.stat-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.stat-label{font-size:12px;color:var(--text2);font-weight:500;letter-spacing:0.3px;margin-bottom:8px}
.stat-value{font-family:'Syne',sans-serif;font-size:28px;font-weight:700;color:var(--text)}
.stat-sub{font-size:12px;color:var(--text2);margin-top:6px}
.stat-icon{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px}
h1.page-title{font-family:'Syne',sans-serif;font-size:22px;font-weight:700;color:var(--text)}
h2.section-title{font-family:'Syne',sans-serif;font-size:16px;font-weight:700;color:var(--text);margin-bottom:16px}
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;font-size:13.5px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--bg3);color:var(--text);transition:all 0.2s;font-family:'DM Sans',sans-serif}
.btn:hover{background:var(--bg4);border-color:var(--border2)}
.btn-primary{background:linear-gradient(135deg,var(--accent3),var(--accent));border:none;color:#fff;box-shadow:0 4px 15px rgba(124,106,248,0.3)}
.btn-primary:hover{opacity:0.9;transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,106,248,0.4)}
.btn-sm{padding:6px 14px;font-size:12.5px;border-radius:8px}
.btn-danger{background:rgba(244,63,94,0.15);border-color:rgba(244,63,94,0.3);color:var(--rose)}
.btn-success{background:rgba(16,212,126,0.12);border-color:rgba(16,212,126,0.25);color:var(--emerald)}
.input{width:100%;padding:9px 14px;border-radius:10px;background:var(--bg3);border:1px solid var(--border);color:var(--text);font-size:13.5px;outline:none;transition:all 0.2s;font-family:'DM Sans',sans-serif}
.input:focus{border-color:var(--accent);box-shadow:0 0 0 3px var(--glow)}
.input::placeholder{color:var(--text3)}
select.input{cursor:pointer}
.table{width:100%;border-collapse:collapse;font-size:13.5px}
.table th{text-align:left;padding:10px 14px;color:var(--text2);font-weight:600;font-size:12px;letter-spacing:0.3px;border-bottom:1px solid var(--border);background:var(--bg3)}
.table td{padding:12px 14px;border-bottom:1px solid var(--border);color:var(--text);vertical-align:middle}
.table tr:hover td{background:var(--cardh)}
.table tr:last-child td{border-bottom:none}
.tag{display:inline-flex;align-items:center;padding:3px 10px;border-radius:20px;font-size:11.5px;font-weight:500}
.tag-present{background:rgba(16,212,126,0.12);color:var(--emerald);border:1px solid rgba(16,212,126,0.2)}
.tag-absent{background:rgba(244,63,94,0.12);color:var(--rose);border:1px solid rgba(244,63,94,0.2)}
.tag-purple{background:rgba(124,106,248,0.15);color:var(--accent2);border:1px solid rgba(124,106,248,0.2)}
.avatar{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;background:linear-gradient(135deg,var(--accent3),var(--accent2));color:#fff;flex-shrink:0}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px}
.modal{background:var(--bg2);border:1px solid var(--border2);border-radius:18px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;padding:28px;position:relative;scrollbar-width:thin}
.modal h2{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:20px}
.field{margin-bottom:16px}
.field label{display:block;font-size:12.5px;color:var(--text2);font-weight:500;margin-bottom:6px;letter-spacing:0.2px}
.divider{height:1px;background:var(--border);margin:20px 0}
.progress-bar{height:6px;border-radius:3px;background:var(--bg4);overflow:hidden}
.progress-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--accent3),var(--accent2));transition:width 0.5s ease}
.search-box{position:relative}
.search-box .input{padding-left:36px}
.search-box::before{content:'🔍';position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none;opacity:0.4}
.toast{position:fixed;bottom:24px;right:24px;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:12px 18px;font-size:13.5px;z-index:200;animation:slideIn 0.3s ease;box-shadow:0 8px 32px rgba(0,0,0,0.4)}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
.chip{display:inline-flex;align-items:center;gap:6px;padding:4px 10px;border-radius:8px;font-size:12px;font-weight:500;background:rgba(124,106,248,0.1);border:1px solid rgba(124,106,248,0.2);color:var(--accent2);cursor:pointer;transition:all 0.15s}
.chip:hover,.chip.sel{background:rgba(124,106,248,0.25);border-color:rgba(124,106,248,0.5)}
.chip.sel::after{content:'✓';margin-left:2px}
.event-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;overflow:hidden;cursor:pointer;transition:all 0.2s}
.event-card:hover{border-color:var(--border2);transform:translateY(-2px)}
.event-stripe{height:4px}
.event-body{padding:16px}
.scroll-area{scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.sb-footer{padding:12px 20px;border-top:1px solid var(--border)}
.login-wrap{min-height:100vh;background:var(--bg);display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden}
.login-bg{position:absolute;inset:0;background:radial-gradient(ellipse 80% 80% at 50% -20%,rgba(124,106,248,0.2) 0%,transparent 60%)}
.login-card{background:var(--bg2);border:1px solid var(--border2);border-radius:24px;padding:40px;width:100%;max-width:420px;position:relative;z-index:1}
.login-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:200px;height:200px;background:radial-gradient(circle,rgba(124,106,248,0.3),transparent 70%);pointer-events:none}
.pulse-ring{position:absolute;inset:-20px;border-radius:50%;border:1px solid rgba(124,106,248,0.2);animation:pulse 2s infinite}
@keyframes pulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.1);opacity:0.2}}
.locked-screen{text-align:center;padding:40px 0}
.lock-icon{font-size:64px;margin-bottom:20px;animation:shake 0.5s ease}
@keyframes shake{0%,100%{transform:rotate(0)}25%{transform:rotate(-10deg)}75%{transform:rotate(10deg)}}
.flex{display:flex}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-2{gap:8px}.gap-3{gap:12px}.gap-4{gap:16px}.mb-2{margin-bottom:8px}.mb-3{margin-bottom:12px}.mb-4{margin-bottom:16px}.mb-6{margin-bottom:24px}.mt-2{margin-top:8px}.mt-4{margin-top:16px}.flex-1{flex:1}.text-sm{font-size:12.5px}.text-xs{font-size:11.5px}.font-bold{font-weight:700}.font-semi{font-weight:600}.color-muted{color:var(--text2)}.color-accent{color:var(--accent2)}.color-green{color:var(--emerald)}.color-red{color:var(--rose)}.color-gold{color:var(--gold)}.wrap{flex-wrap:wrap}
.ring-chart{position:relative;display:inline-flex;align-items:center;justify-content:center}
.bar-item{height:32px;border-radius:6px;display:flex;align-items:center;padding:0 12px;font-size:12.5px;font-weight:500;color:var(--text2);margin-bottom:6px;background:var(--bg4);overflow:hidden;position:relative}
.bar-fill{position:absolute;left:0;top:0;bottom:0;border-radius:6px;opacity:0.25;transition:width 0.5s ease}
.empty-state{text-align:center;padding:60px 20px;color:var(--text2)}
.empty-icon{font-size:48px;margin-bottom:16px;opacity:0.4}
`;

const VIEWS = ["Dashboard", "Members", "New Joinees", "Events", "Attendance", "Analytics", "Reports"];
const VIEW_ICONS = { Dashboard: "🏠", Members: "👥", "New Joinees": "🆕", Events: "📅", Attendance: "✅", Analytics: "📊", Reports: "📄" };

export default function App() {
  const [view, setView] = useState("Dashboard");
  const [members, setMembers] = useLocalStorage("aysg_members", INITIAL_MEMBERS, migrateMembers);
  const [newJoinees, setNewJoinees] = useLocalStorage("aysg_new_joinees", INITIAL_NEW_JOINEES);
  const [events, setEvents] = useLocalStorage("aysg_events", INITIAL_EVENTS);
  const [attendance, setAttendance] = useLocalStorage("aysg_attendance", INITIAL_ATTENDANCE, migrateAttendance);
  const [newJoineeAttendance, setNewJoineeAttendance] = useLocalStorage("aysg_new_joinee_attendance", INITIAL_ATTENDANCE);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPw, setAdminPw] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef();

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const openAdminLogin = () => {
    setAdminPw("");
    setAdminErr("");
    setShowAdminLogin(true);
  };

  const handleAdminLogin = () => {
    if (adminPw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setAdminPw("");
      setAdminErr("");
      showToast("Admin mode enabled", "success");
    } else {
      setAdminErr("Wrong admin password.");
      setAdminPw("");
    }
  };
  const getMemberStats = (memberId) => {
    let total = 0, present = 0;
    Object.values(attendance).forEach(rec => { total++; if (rec[memberId]) present++; });
    return { total, present, pct: total ? Math.round(present / total * 100) : 0 };
  };

  const getEventStats = (eventId) => {
    const rec = attendance[eventId] || {};
    const newRec = newJoineeAttendance[eventId] || {};
    const present = members.filter(m => m.active && rec[m.id]).length + newJoinees.filter(j => j.active && newRec[j.id]).length;
    const total = members.filter(m => m.active).length + newJoinees.filter(j => j.active).length;
    return { present, absent: total - present, total, pct: total ? Math.round(present / total * 100) : 0 };
  };

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <Sidebar
          view={view}
          setView={setView}
          members={members}
          newJoinees={newJoinees}
          events={events}
          isAdmin={isAdmin}
          onAdminClick={isAdmin ? () => { setIsAdmin(false); showToast("Admin mode disabled"); } : openAdminLogin}
        />
        <div className="main">
          <Topbar view={view} isAdmin={isAdmin} onAdminClick={openAdminLogin} />
          <div className="content scroll-area">
            {view === "Dashboard" && <Dashboard members={members} events={events} getEventStats={getEventStats} getMemberStats={getMemberStats} setView={setView} />}
            {view === "Members" && <Members members={members} setMembers={setMembers} getMemberStats={getMemberStats} showToast={showToast} isAdmin={isAdmin} />}
            {view === "New Joinees" && <NewJoinees newJoinees={newJoinees} setNewJoinees={setNewJoinees} showToast={showToast} isAdmin={isAdmin} />}
            {view === "Events" && <Events events={events} setEvents={setEvents} getEventStats={getEventStats} showToast={showToast} isAdmin={isAdmin} />}
            {view === "Attendance" && <Attendance events={events} members={members} newJoinees={newJoinees} attendance={attendance} setAttendance={setAttendance} newJoineeAttendance={newJoineeAttendance} setNewJoineeAttendance={setNewJoineeAttendance} showToast={showToast} isAdmin={isAdmin} />}
            {view === "Analytics" && <Analytics members={members} events={events} getMemberStats={getMemberStats} />}
            {view === "Reports" && <Reports members={members} newJoinees={newJoinees} events={events} attendance={attendance} newJoineeAttendance={newJoineeAttendance} getEventStats={getEventStats} showToast={showToast} />}
          </div>
        </div>
      </div>
      {showAdminLogin && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowAdminLogin(false)}>
          <div className="modal" style={{ maxWidth: 420 }}>
            <h2>Admin Login</h2>
            <div className="field">
              <label>Admin Password</label>
              <input
                type="password"
                className="input"
                value={adminPw}
                onChange={e => setAdminPw(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
                placeholder="Enter admin password"
                autoFocus
              />
            </div>
            {adminErr && <p style={{ color: "var(--rose)", fontSize: 12.5, marginBottom: 12 }}>{adminErr}</p>}
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1" style={{ justifyContent: "center" }} onClick={handleAdminLogin}>Unlock Admin</button>
              <button className="btn" onClick={() => setShowAdminLogin(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === "success" ? "rgba(16,212,126,0.3)" : toast.type === "error" ? "rgba(244,63,94,0.3)" : "var(--border2)" }}>
          {toast.type === "success" ? "✅ " : toast.type === "error" ? "❌ " : "ℹ️ "}{toast.msg}
        </div>
      )}
    </>
  );
}

function Sidebar({ view, setView, members, newJoinees, events, isAdmin, onAdminClick }) {
  const activeCount = members.filter(m => m.active).length;
  return (
    <div className="sidebar">
      <div className="brand">
        <div className="brand-icon">🕉️</div>
        <div className="brand-title">Arham Yuva Seva Group</div>
        <div className="brand-sub">Attendance Tracker</div>
      </div>
      <div className="nav scroll-area">
        <div className="nav-section">Navigation</div>
        {VIEWS.map(v => (
          <div key={v} className={`nav-item${view === v ? " active" : ""}`} onClick={() => setView(v)}>
            <div className="nav-icon">{VIEW_ICONS[v]}</div>
            <span>{v}</span>
            {v === "Members" && <span className="badge">{activeCount}</span>}
            {v === "New Joinees" && <span className="badge">{newJoinees.length}</span>}
            {v === "Events" && <span className="badge">{events.length}</span>}
          </div>
        ))}
      </div>
      <div className="sb-footer">
        <div className="nav-item" onClick={onAdminClick} style={{ color: isAdmin ? "var(--emerald)" : "var(--accent2)" }}>
          <div className="nav-icon">{isAdmin ? "A" : "L"}</div>
          <span>{isAdmin ? "Exit Admin" : "Admin"}</span>
        </div>
      </div>
    </div>
  );
}

function Topbar({ view, isAdmin, onAdminClick }) {
  return (
    <div className="topbar">
      <h1 className="page-title" style={{ fontSize: 17 }}>{view}</h1>
      <div className="flex-1" />
      <span className={`tag ${isAdmin ? "tag-present" : "tag-purple"}`}>{isAdmin ? "Admin mode" : "View only"}</span>
      {!isAdmin && <button className="btn btn-sm" onClick={onAdminClick}>Admin</button>}
      <div style={{ fontSize: 12.5, color: "var(--text2)" }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</div>
    </div>
  );
}

function Dashboard({ members, events, getEventStats, getMemberStats, setView }) {
  const active = members.filter(m => m.active);
  const totalEvents = events.length;
  const overallPct = active.length
    ? Math.round(active.reduce((s, m) => s + getMemberStats(m.id).pct, 0) / active.length)
    : 0;
  const recentEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
  const topMembers = [...active].sort((a, b) => getMemberStats(b.id).pct - getMemberStats(a.id).pct).slice(0, 5);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Good {getGreeting()} 🙏</h1>
          <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>Here's your AYSG overview</p>
        </div>
      </div>
      <div className="grid-4 mb-6">
        {[
          { label: "Total Members", value: active.length, icon: "👥", color: "#7c6af8", sub: "Active volunteers" },
          { label: "Total Events", value: totalEvents, icon: "📅", color: "#06b6d4", sub: "Activities tracked" },
          { label: "Avg Attendance", value: overallPct + "%", icon: "✅", color: "#10d47e", sub: "Across all events" },
          { label: "Last Event", value: recentEvents[0] ? getEventStats(recentEvents[0].id).present : 0, icon: "🎯", color: "#f0b429", sub: recentEvents[0] ? recentEvents[0].name : "No events yet" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + "22" }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Recent Events</h2>
            <button className="btn btn-sm" onClick={() => setView("Events")}>View All →</button>
          </div>
          {recentEvents.length === 0 ? <EmptyState icon="📅" msg="No events yet" /> : recentEvents.map(e => {
            const s = getEventStats(e.id);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: e.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📅</div>
                <div className="flex-1">
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text)" }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>{fmtDate(e.date)} · {e.venue}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.pct >= 75 ? "var(--emerald)" : s.pct >= 50 ? "var(--gold)" : "var(--rose)" }}>{s.pct}%</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>{s.present}/{s.total}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>🏆 Top Members</h2>
            <button className="btn btn-sm" onClick={() => setView("Members")}>View All →</button>
          </div>
          {topMembers.map((m, i) => {
            const s = getMemberStats(m.id);
            return (
              <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0" }}>
                <div style={{ fontSize: 16, width: 24, textAlign: "center" }}>{["🥇", "🥈", "🥉", "4️⃣", "5️⃣"][i]}</div>
                <Avatar name={m.name} size={32} />
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div className="progress-bar" style={{ marginTop: 4 }}>
                    <div className="progress-fill" style={{ width: s.pct + "%" }} />
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--emerald)", minWidth: 36, textAlign: "right" }}>{s.pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Members({ members, setMembers, getMemberStats, showToast, isAdmin }) {
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterGender, setFilterGender] = useState("");
  const [editMember, setEditMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", area: "", gender: "Male", notes: "", joinDate: "", active: true });

  const areas = [...new Set(members.map(m => m.area))];
  const filtered = members.filter(m =>
    (!search || m.name.toLowerCase().includes(search.toLowerCase()) || m.mobile.includes(search) || m.id.toLowerCase().includes(search.toLowerCase())) &&
    (!filterArea || m.area === filterArea) &&
    (!filterGender || m.gender === filterGender)
  );

  const openAdd = () => { setForm({ name: "", mobile: "", area: "", gender: "Male", notes: "", joinDate: new Date().toISOString().split("T")[0], active: true }); setEditMember(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ ...m }); setEditMember(m.id); setShowForm(true); };
  const saveMember = () => {
    if (!form.name.trim()) return showToast("Name is required", "error");
    if (editMember) {
      setMembers(members.map(m => m.id === editMember ? { ...form, id: editMember } : m));
      showToast("Member updated", "success");
    } else {
      setMembers([...members, { ...form, id: genId("M") }]);
      showToast("Member added", "success");
    }
    setShowForm(false);
  };
  const deleteMember = (id) => { setMembers(members.filter(m => m.id !== id)); showToast("Member removed", "success"); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{members.filter(m => m.active).length} active · {members.filter(m => !m.active).length} inactive</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>}
      </div>
      <div className="flex gap-3 mb-4 wrap">
        <div className="search-box flex-1" style={{ minWidth: 200 }}>
          <input className="input" placeholder="Search by name, mobile, ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 140 }} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
          <option value="">All Areas</option>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="input" style={{ width: 130 }} value={filterGender} onChange={e => setFilterGender(e.target.value)}>
          <option value="">All Gender</option>
          <option>Male</option><option>Female</option>
        </select>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <EmptyState icon="👥" msg="No members found" /> : (
          <table className="table">
            <thead><tr><th>Member</th><th>ID</th><th>Area</th><th>Mobile</th><th>Joined</th><th>Attendance</th><th>Status</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {filtered.map(m => {
                const s = getMemberStats(m.id);
                return (
                  <tr key={m.id}>
                    <td><div className="flex items-center gap-3"><Avatar name={m.name} /><div><div style={{ fontWeight: 600, fontSize: 13.5 }}>{m.name}</div><div className="text-xs color-muted">{m.gender}</div></div></div></td>
                    <td><span className="tag tag-purple">{m.id}</span></td>
                    <td style={{ color: "var(--text2)", fontSize: 13 }}>{m.area}</td>
                    <td style={{ fontSize: 13, color: "var(--text2)" }}>{m.mobile}</td>
                    <td style={{ fontSize: 12.5, color: "var(--text2)" }}>{fmtDate(m.joinDate)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="progress-bar" style={{ width: 60 }}><div className="progress-fill" style={{ width: s.pct + "%" }} /></div>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: s.pct >= 75 ? "var(--emerald)" : s.pct >= 50 ? "var(--gold)" : "var(--rose)" }}>{s.pct}%</span>
                      </div>
                    </td>
                    <td><span className={`tag ${m.active ? "tag-present" : "tag-absent"}`}>{m.active ? "Active" : "Inactive"}</span></td>                    {isAdmin && (
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm" onClick={() => openEdit(m)}>Edit</button>
                          <button className="btn btn-sm btn-danger" onClick={() => deleteMember(m.id)}>Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2>{editMember ? "Edit Member" : "Add New Member"}</h2>
            <div className="grid-2">
              {[["Full Name", "name", "text"], ["Mobile Number", "mobile", "text"]].map(([label, key, type]) => (
                <div key={key} className="field">
                  <label>{label}</label>
                  <input className="input" type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={label} />
                </div>
              ))}
            </div>
            <div className="grid-2">
              <div className="field"><label>Area</label><input className="input" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="Area / Location" /></div>
              <div className="field"><label>Gender</label>
                <select className="input" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="field"><label>Join Date</label><input className="input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select className="input" value={form.active ? "active" : "inactive"} onChange={e => setForm({ ...form, active: e.target.value === "active" })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." /></div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1" style={{ justifyContent: "center" }} onClick={saveMember}>{editMember ? "Update Member" : "Add Member"}</button>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewJoinees({ newJoinees, setNewJoinees, showToast, isAdmin }) {
  const [search, setSearch] = useState("");
  const [editJoinee, setEditJoinee] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", joinDate: "", notes: "", active: true });

  const filtered = newJoinees.filter(j =>
    !search ||
    j.name.toLowerCase().includes(search.toLowerCase()) ||
    j.id.toLowerCase().includes(search.toLowerCase()) ||
    j.notes.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ name: "", joinDate: new Date().toISOString().split("T")[0], notes: "", active: true });
    setEditJoinee(null);
    setShowForm(true);
  };

  const openEdit = (joinee) => {
    setForm({ ...joinee });
    setEditJoinee(joinee.id);
    setShowForm(true);
  };

  const saveJoinee = () => {
    const name = form.name.trim();
    if (!name) return showToast("Name is required", "error");
    const isDuplicate = newJoinees.some(j => j.id !== editJoinee && normalizeName(j.name) === normalizeName(name));
    if (isDuplicate) return showToast("This new joinee already exists", "error");

    if (editJoinee) {
      setNewJoinees(newJoinees.map(j => j.id === editJoinee ? { ...form, name, id: editJoinee } : j));
      showToast("New joinee updated", "success");
    } else {
      setNewJoinees([...newJoinees, { ...form, name, id: genId("N") }]);
      showToast("New joinee added", "success");
    }
    setShowForm(false);
  };

  const deleteJoinee = (id) => {
    setNewJoinees(newJoinees.filter(j => j.id !== id));
    showToast("New joinee removed", "success");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">New Joinees</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{newJoinees.length} names in the onboarding list</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add New Joinee</button>}
      </div>
      <div className="flex gap-3 mb-4 wrap">
        <div className="search-box flex-1" style={{ minWidth: 220 }}>
          <input className="input" placeholder="Search new joinees..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <EmptyState icon="🆕" msg="No new joinees found" /> : (
          <table className="table">
            <thead><tr><th>Name</th><th>ID</th><th>Joined</th><th>Notes</th><th>Status</th>{isAdmin && <th></th>}</tr></thead>
            <tbody>
              {filtered.map(j => (
                <tr key={j.id}>
                  <td><div className="flex items-center gap-3"><Avatar name={j.name} /><div style={{ fontWeight: 600, fontSize: 13.5 }}>{j.name}</div></div></td>
                  <td><span className="tag tag-purple">{j.id}</span></td>
                  <td style={{ fontSize: 12.5, color: "var(--text2)" }}>{fmtDate(j.joinDate)}</td>
                  <td style={{ fontSize: 13, color: "var(--text2)" }}>{j.notes}</td>
                  <td><span className={`tag ${j.active ? "tag-present" : "tag-absent"}`}>{j.active ? "Active" : "Inactive"}</span></td>                  {isAdmin && (
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-sm" onClick={() => openEdit(j)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => deleteJoinee(j.id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2>{editJoinee ? "Edit New Joinee" : "Add New Joinee"}</h2>
            <div className="field">
              <label>Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full Name" autoFocus />
            </div>
            <div className="grid-2">
              <div className="field"><label>Join Date</label><input className="input" type="date" value={form.joinDate} onChange={e => setForm({ ...form, joinDate: e.target.value })} /></div>
              <div className="field"><label>Status</label>
                <select className="input" value={form.active ? "active" : "inactive"} onChange={e => setForm({ ...form, active: e.target.value === "active" })}>
                  <option value="active">Active</option><option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." /></div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1" style={{ justifyContent: "center" }} onClick={saveJoinee}>{editJoinee ? "Update New Joinee" : "Add New Joinee"}</button>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Events({ events, setEvents, getEventStats, showToast, isAdmin }) {
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState({ name: "", date: "", time: "", venue: "", category: "Religious", notes: "", color: "#7c6af8" });
  const categories = ["Religious", "Social", "Educational", "Cultural", "Other"];
  const colors = ["#7c6af8", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#06b6d4", "#10b981"];

  const openAdd = () => { setForm({ name: "", date: new Date().toISOString().split("T")[0], time: "09:00", venue: "", category: "Religious", notes: "", color: "#7c6af8" }); setEditEvent(null); setShowForm(true); };
  const openEdit = (e) => { setForm({ ...e }); setEditEvent(e.id); setShowForm(true); };
  const saveEvent = () => {
    if (!form.name.trim()) return showToast("Event name required", "error");
    if (editEvent) { setEvents(events.map(e => e.id === editEvent ? { ...form, id: editEvent } : e)); showToast("Event updated", "success"); }
    else { setEvents([...events, { ...form, id: genId("E") }]); showToast("Event created", "success"); }
    setShowForm(false);
  };
  const deleteEvent = (id) => { setEvents(events.filter(e => e.id !== id)); showToast("Event deleted", "success"); };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Events</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{events.length} activities tracked</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ New Event</button>}
      </div>
      {events.length === 0 ? <EmptyState icon="📅" msg="No events yet. Create your first event!" /> : (
        <div className="grid-3">
          {[...events].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => {
            const s = getEventStats(e.id);
            return (
              <div key={e.id} className="event-card">
                <div className="event-stripe" style={{ background: e.color }} />
                <div className="event-body">
                  <div className="flex items-center justify-between mb-3">
                    <span className="tag tag-purple" style={{ fontSize: 11 }}>{e.category}</span>                    {isAdmin && (
                      <div className="flex gap-2">
                        <button className="btn btn-sm" style={{ padding: "4px 8px" }} onClick={() => openEdit(e)}>Edit</button>
                        <button className="btn btn-sm btn-danger" style={{ padding: "4px 8px" }} onClick={() => deleteEvent(e.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Syne',sans-serif", marginBottom: 6 }}>{e.name}</h3>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 4 }}>📅 {fmtDate(e.date)} · ⏰ {e.time}</div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginBottom: 12 }}>📍 {e.venue}</div>
                  <div className="divider" style={{ margin: "10px 0" }} />
                  <div className="flex items-center justify-between">
                    <div className="flex gap-3">
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--emerald)" }}>{s.present}</div>
                        <div style={{ fontSize: 10, color: "var(--text2)" }}>Present</div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: "var(--rose)" }}>{s.absent}</div>
                        <div style={{ fontSize: 10, color: "var(--text2)" }}>Absent</div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 20, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: s.pct >= 75 ? "var(--emerald)" : s.pct >= 50 ? "var(--gold)" : "var(--rose)" }}>{s.pct}%</div>
                      <div className="progress-bar" style={{ width: 60, marginTop: 4, marginLeft: "auto" }}><div className="progress-fill" style={{ width: s.pct + "%" }} /></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal">
            <h2>{editEvent ? "Edit Event" : "Create New Event"}</h2>
            <div className="field"><label>Event Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Sabha" /></div>
            <div className="grid-2">
              <div className="field"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
              <div className="field"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
            </div>
            <div className="field"><label>Venue</label><input className="input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Location / Venue" /></div>
            <div className="grid-2">
              <div className="field"><label>Category</label>
                <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {categories.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="field"><label>Event Color</label>
                <div className="flex gap-2 mt-1">
                  {colors.map(c => <div key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: "pointer", border: form.color === c ? "3px solid white" : "2px solid transparent", transition: "all 0.15s" }} />)}
                </div>
              </div>
            </div>
            <div className="field"><label>Notes</label><input className="input" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any notes..." /></div>
            <div className="flex gap-3 mt-4">
              <button className="btn btn-primary flex-1" style={{ justifyContent: "center" }} onClick={saveEvent}>{editEvent ? "Update Event" : "Create Event"}</button>
              <button className="btn" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Attendance({ events, members, newJoinees, attendance, setAttendance, newJoineeAttendance, setNewJoineeAttendance, showToast, isAdmin }) {
  const [selEvent, setSelEvent] = useState(events[0]?.id || "");
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("members");
  const isNewJoineeGroup = group === "newJoinees";
  const activePeople = (isNewJoineeGroup ? newJoinees : members).filter(p => p.active);
  const store = isNewJoineeGroup ? newJoineeAttendance : attendance;
  const setStore = isNewJoineeGroup ? setNewJoineeAttendance : setAttendance;
  const rec = store[selEvent] || {};
  const filtered = activePeople.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));
  const groupLabel = isNewJoineeGroup ? "New Joinees" : "Members";

  const toggle = (personId) => {
    if (!isAdmin) return;
    setStore({ ...store, [selEvent]: { ...rec, [personId]: !rec[personId] } });
  };

  const markAll = (val) => {
    if (!isAdmin) return;
    const updated = {};
    activePeople.forEach(p => updated[p.id] = val);
    setStore({ ...store, [selEvent]: updated });
    showToast(`${groupLabel} marked as ${val ? "Present" : "Absent"}`, "success");
  };

  const present = activePeople.filter(p => rec[p.id]).length;
  const pct = activePeople.length ? Math.round(present / activePeople.length * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{isAdmin ? "Mark attendance for members and new joinees" : "View attendance records"}</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="grid-2">
          <div className="field" style={{ marginBottom: 0 }}>
            <label style={{ display: "block", fontSize: 12.5, color: "var(--text2)", marginBottom: 6 }}>Select Event</label>
            <select className="input" value={selEvent} onChange={e => setSelEvent(e.target.value)}>
              <option value="">-- Choose Event --</option>
              {[...events].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({fmtDate(e.date)})</option>
              ))}
            </select>
          </div>
          {selEvent && (
            <div className="flex items-center gap-4">
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: pct >= 75 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "var(--rose)" }}>{pct}%</div>
                <div className="text-xs color-muted">{groupLabel}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div className="flex justify-between text-xs color-muted mb-2">
                  <span>Present: {present}</span>
                  <span>Absent: {activePeople.length - present}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: pct + "%" }} /></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {selEvent && (
        <>
          <div className="flex gap-3 mb-4 wrap">
            <button className={`btn btn-sm${!isNewJoineeGroup ? " btn-primary" : ""}`} onClick={() => setGroup("members")}>Members</button>
            <button className={`btn btn-sm${isNewJoineeGroup ? " btn-primary" : ""}`} onClick={() => setGroup("newJoinees")}>New Joinees</button>
            <div className="search-box flex-1" style={{ minWidth: 220 }}>
              <input className="input" placeholder={`Search ${groupLabel.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {isAdmin && <button className="btn btn-success btn-sm" onClick={() => markAll(true)}>Mark All Present</button>}
            {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => markAll(false)}>Mark All Absent</button>}
          </div>
          {!isAdmin && <div className="card mb-4" style={{ padding: 12, color: "var(--text2)", fontSize: 13 }}>View-only mode. Admin login is required to change attendance.</div>}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 10 }}>
            {filtered.map(p => {
              const isPresent = !!rec[p.id];
              const detail = isNewJoineeGroup ? (p.notes || "New joinee") : (p.area || "Member");
              return (
                <div key={p.id} onClick={isAdmin ? () => toggle(p.id) : undefined} style={{ background: isPresent ? "rgba(16,212,126,0.08)" : "var(--bg3)", border: `1px solid ${isPresent ? "rgba(16,212,126,0.25)" : "var(--border)"}`, borderRadius: 12, padding: "12px 14px", cursor: isAdmin ? "pointer" : "default", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 10 }}>
                  <Avatar name={p.name} size={36} color={isPresent ? "#10d47e" : undefined} />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{detail}</div>
                  </div>
                  <span className={`tag ${isPresent ? "tag-present" : "tag-absent"}`}>{isPresent ? "Present" : "Absent"}</span>
                </div>
              );
            })}
          </div>
          {isAdmin && (
            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button className="btn btn-primary" onClick={() => showToast("Attendance saved!", "success")}>Save Attendance</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
function Analytics({ members, events, getMemberStats }) {
  const active = members.filter(m => m.active);
  const sortedTop = [...active].sort((a, b) => getMemberStats(b.id).pct - getMemberStats(a.id).pct);
  const sortedLow = [...active].sort((a, b) => getMemberStats(a.id).pct - getMemberStats(b.id).pct).filter(m => getMemberStats(m.id).total > 0);

  const catCounts = events.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + 1; return acc; }, {});
  const areaCounts = active.reduce((acc, m) => { acc[m.area] = (acc[m.area] || 0) + 1; return acc; }, {});

  return (
    <div>
      <h1 className="page-title mb-6">Analytics</h1>
      <div className="grid-4 mb-6">
        {[
          { label: "Active Members", value: active.length, color: "#7c6af8" },
          { label: "Total Events", value: events.length, color: "#06b6d4" },
          { label: "Avg Attendance", value: active.length ? Math.round(active.reduce((s, m) => s + getMemberStats(m.id).pct, 0) / active.length) + "%" : "—", color: "#10d47e" },
          { label: "High Performers", value: active.filter(m => getMemberStats(m.id).pct >= 75).length, color: "#f0b429" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div className="grid-2 mb-4">
        <div className="card">
          <h2 className="section-title">🏆 Top Performers</h2>
          {sortedTop.slice(0, 8).map((m, i) => {
            const s = getMemberStats(m.id);
            return (
              <div key={m.id} className="bar-item" style={{ marginBottom: 6 }}>
                <div className="bar-fill" style={{ width: s.pct + "%", background: "var(--accent)" }} />
                <span style={{ zIndex: 1, fontSize: 12 }}>{i + 1}. {m.name}</span>
                <span style={{ marginLeft: "auto", zIndex: 1, fontWeight: 700, color: "var(--emerald)" }}>{s.pct}%</span>
              </div>
            );
          })}
        </div>
        <div className="card">
          <h2 className="section-title">⚠️ Needs Attention</h2>
          {sortedLow.slice(0, 8).map((m) => {
            const s = getMemberStats(m.id);
            return (
              <div key={m.id} className="bar-item" style={{ marginBottom: 6 }}>
                <div className="bar-fill" style={{ width: s.pct + "%", background: "var(--rose)" }} />
                <span style={{ zIndex: 1, fontSize: 12 }}>{m.name}</span>
                <span style={{ marginLeft: "auto", zIndex: 1, fontWeight: 700, color: "var(--rose)" }}>{s.pct}%</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h2 className="section-title">📊 Events by Category</h2>
          {Object.entries(catCounts).map(([cat, count]) => (
            <div key={cat} className="bar-item" style={{ marginBottom: 6 }}>
              <div className="bar-fill" style={{ width: (count / events.length * 100) + "%", background: "var(--cyan)" }} />
              <span style={{ zIndex: 1, fontSize: 12 }}>{cat}</span>
              <span style={{ marginLeft: "auto", zIndex: 1, fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <h2 className="section-title">📍 Members by Area</h2>
          {Object.entries(areaCounts).map(([area, count]) => (
            <div key={area} className="bar-item" style={{ marginBottom: 6 }}>
              <div className="bar-fill" style={{ width: (count / active.length * 100) + "%", background: "var(--gold)" }} />
              <span style={{ zIndex: 1, fontSize: 12 }}>{area}</span>
              <span style={{ marginLeft: "auto", zIndex: 1, fontWeight: 700 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Reports({ members, newJoinees, events, attendance, newJoineeAttendance, getEventStats, showToast }) {
  const [selEvent, setSelEvent] = useState(events[0]?.id || "");
  const event = events.find(e => e.id === selEvent);
  const active = members.filter(m => m.active).map(m => ({ ...m, group: "Member", detail: m.area || "Member" }));
  const activeNewJoinees = newJoinees.filter(j => j.active).map(j => ({ ...j, group: "New Joinee", detail: j.notes || "New joinee" }));
  const allPeople = [...active, ...activeNewJoinees];
  const rec = attendance[selEvent] || {};
  const newRec = newJoineeAttendance[selEvent] || {};
  const isPresent = (person) => person.group === "New Joinee" ? newRec[person.id] : rec[person.id];
  const presentMembers = allPeople.filter(isPresent);
  const absentMembers = allPeople.filter(person => !isPresent(person));
  const stats = selEvent ? getEventStats(selEvent) : null;

  const printReport = () => {
    if (!event) return showToast("Select an event first", "error");
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Attendance Report - ${event.name}</title>
      <style>
        body{font-family:Arial,sans-serif;max-width:800px;margin:0 auto;padding:30px;color:#1a1a2e}
        h1{font-size:22px;margin:0 0 4px;color:#1a1a2e}
        h2{font-size:14px;color:#6c6c90;font-weight:400;margin:0 0 20px}
        .header{text-align:center;border-bottom:2px solid #7c6af8;padding-bottom:16px;margin-bottom:24px}
        .org{font-size:11px;color:#7c6af8;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px}
        .stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
        .stat{background:#f5f5ff;border-radius:10px;padding:12px;text-align:center}
        .stat-v{font-size:24px;font-weight:700;color:#5b46f5}
        .stat-l{font-size:11px;color:#6c6c90;margin-top:4px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{background:#5b46f5;color:#fff;padding:10px 14px;text-align:left}
        td{padding:9px 14px;border-bottom:1px solid #eee}
        .present-row td{background:#f0fff8}
        .absent-row td{background:#fff5f7}
        .tick{color:#10d47e;font-weight:700}
        .cross{color:#f43f5e;font-weight:700}
        .footer{margin-top:40px;border-top:1px solid #eee;padding-top:20px;font-size:12px;color:#999;text-align:center}
        .sig-area{display:grid;grid-template-columns:repeat(2,1fr);gap:40px;margin-top:40px}
        .sig-line{border-top:1px solid #ccc;margin-top:40px;padding-top:8px;font-size:12px;color:#999;text-align:center}
        @media print{body{padding:20px}}
      </style></head><body>
      <div class="header">
        <div class="org">Arham Yuva Seva Group</div>
        <h1>${event.name}</h1>
        <h2>${fmtDate(event.date)} · ${event.time} · ${event.venue}</h2>
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-v">${stats.total}</div><div class="stat-l">Total</div></div>
        <div class="stat"><div class="stat-v" style="color:#10d47e">${stats.present}</div><div class="stat-l">Present</div></div>
        <div class="stat"><div class="stat-v" style="color:#f43f5e">${stats.absent}</div><div class="stat-l">Absent</div></div>
        <div class="stat"><div class="stat-v">${stats.pct}%</div><div class="stat-l">Attendance</div></div>
      </div>
      <table>
        <thead><tr><th>#</th><th>Name</th><th>Group</th><th>Details</th><th>Status</th></tr></thead>
        <tbody>
          ${presentMembers.map((m, i) => `<tr class="present-row"><td>${i + 1}</td><td>${m.name}</td><td>${m.group}</td><td>${m.detail}</td><td class="tick">Present</td></tr>`).join("")}
          ${absentMembers.map((m, i) => `<tr class="absent-row"><td>${presentMembers.length + i + 1}</td><td>${m.name}</td><td>${m.group}</td><td>${m.detail}</td><td class="cross">Absent</td></tr>`).join("")}
        </tbody>
      </table>
      <div class="sig-area">
        <div class="sig-line">Event Organizer Signature</div>
        <div class="sig-line">Group Leader Signature</div>
      </div>
      <div class="footer">Generated by AYSG Attendance Tracker · ${new Date().toLocaleString("en-IN")}</div>
      </body></html>
    `);
    win.document.close();
    win.print();
    showToast("Report opened for print/save", "success");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>Generate and export attendance reports</p>
        </div>
      </div>
      <div className="card mb-4">
        <div className="flex gap-4 items-end wrap">
          <div className="flex-1">
            <label style={{ display: "block", fontSize: 12.5, color: "var(--text2)", marginBottom: 6 }}>Select Event</label>
            <select className="input" value={selEvent} onChange={e => setSelEvent(e.target.value)}>
              <option value="">-- Choose Event --</option>
              {[...events].sort((a, b) => new Date(b.date) - new Date(a.date)).map(e => (
                <option key={e.id} value={e.id}>{e.name} ({fmtDate(e.date)})</option>
              ))}
            </select>
          </div>
          <button className="btn btn-primary" onClick={printReport} disabled={!selEvent}>🖨️ Print / Save PDF</button>
        </div>
      </div>
      {event && stats && (
        <div>
          <div className="card mb-4" style={{ background: "linear-gradient(135deg,rgba(91,70,245,0.08),rgba(124,106,248,0.04))", borderColor: "rgba(124,106,248,0.2)" }}>
            <div className="flex items-center gap-4 mb-4">
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 18, fontWeight: 700 }}>{event.name}</div>
                <div className="text-sm color-muted" style={{ marginTop: 4 }}>📅 {fmtDate(event.date)} · ⏰ {event.time} · 📍 {event.venue}</div>
              </div>
              <span className="tag tag-purple">{event.category}</span>
            </div>
            <div className="grid-4">
              {[
                { label: "Total People", value: stats.total, color: "var(--text)" },
                { label: "Present", value: stats.present, color: "var(--emerald)" },
                { label: "Absent", value: stats.absent, color: "var(--rose)" },
                { label: "Attendance %", value: stats.pct + "%", color: stats.pct >= 75 ? "var(--emerald)" : stats.pct >= 50 ? "var(--gold)" : "var(--rose)" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "12px", background: "var(--bg3)", borderRadius: 10 }}>
                  <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'Syne',sans-serif", color: s.color }}>{s.value}</div>
                  <div className="text-xs color-muted" style={{ marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid-2">
            <div className="card" style={{ borderColor: "rgba(16,212,126,0.2)" }}>
              <h2 className="section-title" style={{ color: "var(--emerald)" }}>✅ Present ({presentMembers.length})</h2>
              {presentMembers.length === 0 ? <EmptyState icon="😢" msg="No one present" /> : presentMembers.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3" style={{ padding: "8px 0", borderBottom: i < presentMembers.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 11, color: "var(--text2)", minWidth: 20 }}>{i + 1}</span>
                  <Avatar name={m.name} size={30} color="#10d47e" />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{m.group} · {m.detail}</div>
                  </div>
                  <span className="tag tag-present">✓</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ borderColor: "rgba(244,63,94,0.2)" }}>
              <h2 className="section-title" style={{ color: "var(--rose)" }}>❌ Absent ({absentMembers.length})</h2>
              {absentMembers.length === 0 ? <EmptyState icon="🎉" msg="Full attendance!" /> : absentMembers.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3" style={{ padding: "8px 0", borderBottom: i < absentMembers.length - 1 ? "1px solid var(--border)" : "none" }}>
                  <span style={{ fontSize: 11, color: "var(--text2)", minWidth: 20 }}>{i + 1}</span>
                  <Avatar name={m.name} size={30} color="#f43f5e" />
                  <div className="flex-1">
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text2)" }}>{m.group} · {m.detail}</div>
                  </div>
                  <span className="tag tag-absent">✗</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, size = 34, color }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const colors = ["#7c6af8", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#06b6d4"];
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: bg + "33", border: `1px solid ${bg}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: bg, flexShrink: 0 }}>{initials}</div>
  );
}

function EmptyState({ icon, msg }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div><div>{msg}</div></div>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
