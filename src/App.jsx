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

function normalizeAttendanceStatus(value) {
  if (value === true) return "present";
  if (value === false) return "absent";
  return value || "absent";
}

function isAttendedStatus(value) {
  const status = normalizeAttendanceStatus(value);
  return status === "present" || status === "late";
}

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
.app.admin-mode .topbar,.app.admin-mode .sidebar{box-shadow:inset 0 0 0 1px rgba(16,212,126,0.12),0 0 28px rgba(16,212,126,0.05)}
.app.view-mode .topbar,.app.view-mode .sidebar{box-shadow:inset 0 0 0 1px rgba(124,106,248,0.08)}
.sidebar{width:246px;flex-shrink:0;background:var(--bg2);border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:visible;position:relative;z-index:10;transition:width 0.22s ease,border-color 0.2s}
.sidebar.collapsed{width:76px}
.sidebar.admin{border-right-color:rgba(16,212,126,0.35)}
.sidebar.view{border-right-color:rgba(124,106,248,0.18)}
.sidebar::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 50% 0%,rgba(124,106,248,0.08) 0%,transparent 60%);pointer-events:none}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.topbar{height:62px;background:var(--bg2);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;flex-shrink:0;position:relative;z-index:8}
.topbar.admin{border-bottom-color:rgba(16,212,126,0.32)}
.content{flex:1;overflow-y:auto;padding:24px;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
.brand{padding:14px 14px 10px;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:10px;min-height:68px}
.brand-icon{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--accent3),var(--accent2));display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 4px 20px var(--glow);flex-shrink:0;font-weight:900}
.brand-title{font-family:'Syne',sans-serif;font-size:13px;font-weight:700;color:var(--text);line-height:1.3}
.brand-sub{font-size:11px;color:var(--accent2);font-weight:500;letter-spacing:0.5px;margin-top:2px}
.sidebar.collapsed .brand-copy,.sidebar.collapsed .nav-section,.sidebar.collapsed .nav-label,.sidebar.collapsed .sb-mode-copy{display:none}
.sidebar.collapsed .brand{justify-content:center;padding-left:8px;padding-right:8px}
.nav{padding:8px 8px;flex:1;overflow-y:auto;overflow-x:visible}
.nav-item{display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:9px;cursor:pointer;font-size:13px;font-weight:500;color:var(--text2);transition:all 0.2s;margin-bottom:2px;position:relative;border:1px solid transparent;min-height:38px}
.nav-item:hover{background:var(--cardh);color:var(--text);border-color:var(--border)}
.nav-item.active{background:var(--glass);color:var(--accent2);border-color:rgba(124,106,248,0.2)}
.nav-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:60%;background:var(--accent);border-radius:0 3px 3px 0}
.nav-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--bg3);transition:all 0.2s;font-weight:800;font-family:'Syne',sans-serif;flex-shrink:0}
.nav-item.active .nav-icon{background:rgba(124,106,248,0.2)}
.nav-section{font-size:10px;font-weight:600;color:var(--text3);letter-spacing:1px;text-transform:uppercase;padding:12px 10px 6px}
.badge{background:rgba(124,106,248,0.2);color:var(--accent2);font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-left:auto}
.sidebar.collapsed .nav-item{justify-content:center;padding:8px}
.sidebar.collapsed .badge{position:absolute;right:7px;top:5px;font-size:9px;padding:1px 5px}
.sidebar.collapsed .nav-item[data-tip]:hover::after{content:attr(data-tip);position:absolute;left:64px;top:50%;transform:translateY(-50%);white-space:nowrap;background:var(--bg2);border:1px solid var(--border2);color:var(--text);padding:7px 9px;border-radius:8px;font-size:12px;box-shadow:0 8px 28px rgba(0,0,0,0.35);z-index:50}
.collapse-btn{position:absolute;right:-13px;top:76px;width:26px;height:26px;border-radius:50%;border:1px solid var(--border2);background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:30}
.top-search{position:relative;min-width:260px;max-width:420px;flex:1}
.top-search input{height:38px}
.search-results{position:absolute;top:44px;left:0;right:0;background:var(--bg2);border:1px solid var(--border2);border-radius:12px;padding:8px;box-shadow:0 12px 38px rgba(0,0,0,0.42);z-index:40}
.search-result{display:flex;align-items:center;gap:10px;padding:8px;border-radius:8px;cursor:pointer;color:var(--text2);font-size:12.5px}
.search-result:hover{background:var(--cardh);color:var(--text)}
.top-icon-btn{width:38px;height:38px;border-radius:10px;border:1px solid var(--border);background:var(--bg3);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.18s;font-weight:800}
.top-icon-btn:hover{border-color:var(--border2);color:var(--text);background:var(--bg4)}
.top-menu{position:relative}
.top-popover{position:absolute;right:0;top:46px;width:240px;background:var(--bg2);border:1px solid var(--border2);border-radius:14px;padding:12px;box-shadow:0 12px 38px rgba(0,0,0,0.42);z-index:45}
.mode-chip{display:inline-flex;align-items:center;gap:7px;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:800;border:1px solid}
.mode-chip.admin{color:var(--emerald);border-color:rgba(16,212,126,0.35);background:rgba(16,212,126,0.1);box-shadow:0 0 18px rgba(16,212,126,0.12)}
.mode-chip.view{color:var(--accent2);border-color:rgba(124,106,248,0.3);background:rgba(124,106,248,0.1)}
.sync-dot{width:8px;height:8px;border-radius:50%;background:var(--emerald);box-shadow:0 0 12px var(--emerald)}
.card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:20px}
.card-hover{transition:all 0.2s}
.card-hover:hover{background:var(--cardh);border-color:var(--border2);transform:translateY(-1px)}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.stat-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:20px;position:relative;overflow:hidden;transition:all 0.2s;animation:fadeUp 0.35s ease both}
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
.dense-table th{padding:8px 12px;font-size:11.5px}
.dense-table td{padding:8px 12px}
.member-row{cursor:pointer;transition:all 0.18s}
.member-row:hover td{background:rgba(255,255,255,0.055)}
.row-actions{display:flex;gap:6px;opacity:0;transform:translateX(6px);transition:all 0.18s;justify-content:flex-end}
.member-row:hover .row-actions{opacity:1;transform:translateX(0)}
.attendance-meter{display:flex;align-items:center;gap:8px;min-width:150px}
.attendance-ring{width:38px;height:38px;border-radius:50%;display:grid;place-items:center;position:relative;flex-shrink:0}
.attendance-ring::after{content:'';position:absolute;inset:5px;border-radius:50%;background:var(--bg2)}
.attendance-ring span{position:relative;z-index:1;font-size:10.5px;font-weight:800}
.drawer-bg{position:fixed;inset:0;background:rgba(0,0,0,0.35);z-index:110;display:flex;justify-content:flex-end;animation:fadeIn 0.2s ease}
.profile-drawer{width:min(520px,100%);height:100%;background:var(--bg2);border-left:1px solid var(--border2);box-shadow:-18px 0 42px rgba(0,0,0,0.35);padding:24px;overflow-y:auto;animation:drawerIn 0.24s ease}
.analytics-strip{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.analytics-tile{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:12px}
.history-item{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
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
.trend{display:inline-flex;align-items:center;gap:5px;margin-top:10px;padding:4px 8px;border-radius:8px;font-size:11.5px;font-weight:700;border:1px solid transparent}
.trend.up{color:var(--emerald);background:rgba(16,212,126,0.1);border-color:rgba(16,212,126,0.2)}
.trend.down{color:var(--rose);background:rgba(244,63,94,0.1);border-color:rgba(244,63,94,0.2)}
.trend.flat{color:var(--text2);background:rgba(255,255,255,0.05);border-color:var(--border)}
.dashboard-event{position:relative;display:flex;align-items:center;gap:12px;padding:13px 0;border-bottom:1px solid var(--border);transition:all 0.2s}
.dashboard-event:hover{padding-left:8px;background:linear-gradient(90deg,rgba(255,255,255,0.04),transparent);border-radius:10px}
.event-actions{display:flex;gap:6px;opacity:0;transform:translateX(6px);transition:all 0.2s}
.dashboard-event:hover .event-actions{opacity:1;transform:translateX(0)}
.status-badge{display:inline-flex;align-items:center;gap:5px;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:700;border:1px solid}
.status-upcoming{color:var(--cyan);background:rgba(6,182,212,0.1);border-color:rgba(6,182,212,0.24)}
.status-ongoing{color:var(--gold);background:rgba(240,180,41,0.11);border-color:rgba(240,180,41,0.25)}
.status-completed{color:var(--emerald);background:rgba(16,212,126,0.1);border-color:rgba(16,212,126,0.22)}
.mode-banner{border-radius:14px;padding:14px 16px;margin-bottom:16px;border:1px solid;display:flex;align-items:center;justify-content:space-between;gap:12px}
.mode-banner.admin{background:rgba(16,212,126,0.1);border-color:rgba(16,212,126,0.28);color:var(--emerald)}
.mode-banner.view{background:rgba(244,63,94,0.1);border-color:rgba(244,63,94,0.26);color:var(--rose)}
.attendance-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.attendance-card{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:14px;transition:all 0.18s;position:relative;overflow:hidden}
.attendance-card.editable{cursor:pointer}
.attendance-card.editable:hover{transform:translateY(-2px);border-color:var(--border2);background:var(--cardh)}
.attendance-card.locked{opacity:0.68;filter:saturate(0.72)}
.attendance-card::before{content:'';position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--status-color,var(--border2))}
.status-picker{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-top:12px}
.status-choice{border:1px solid var(--border);background:rgba(255,255,255,0.035);color:var(--text2);border-radius:8px;padding:6px 4px;font-size:11px;font-weight:700;cursor:pointer;transition:all 0.15s;font-family:'DM Sans',sans-serif}
.status-choice:hover,.status-choice.active{border-color:var(--status-color);color:var(--status-color);background:color-mix(in srgb,var(--status-color) 14%,transparent)}
.status-choice:disabled{cursor:not-allowed;opacity:0.55}
.status-pill{display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid var(--status-color);color:var(--status-color);background:color-mix(in srgb,var(--status-color) 12%,transparent)}
.ops-panel{background:linear-gradient(135deg,rgba(124,106,248,0.08),rgba(6,182,212,0.05));border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px}
.quick-actions{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.quick-action{border:1px solid var(--border);background:var(--bg3);border-radius:12px;padding:14px;text-align:left;cursor:pointer;color:var(--text);transition:all 0.2s;font-family:'DM Sans',sans-serif}
.quick-action:hover{transform:translateY(-2px);border-color:var(--border2);background:var(--cardh)}
.quick-action-icon{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:16px}
.member-rank-card{display:grid;grid-template-columns:auto auto auto 1fr;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--border);transition:all 0.2s}
.member-rank-card:hover{transform:translateX(4px)}
.mini-ring{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;position:relative}
.mini-ring::after{content:'';position:absolute;inset:5px;border-radius:50%;background:var(--bg2)}
.mini-ring span{position:relative;z-index:1;font-size:11px;font-weight:800}
.streak-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:8px;background:rgba(240,180,41,0.12);color:var(--gold);font-size:11px;font-weight:700;border:1px solid rgba(240,180,41,0.22)}
.skeleton-card{height:138px;border-radius:14px;background:linear-gradient(90deg,var(--bg3),var(--bg4),var(--bg3));background-size:220% 100%;animation:shimmer 1.1s infinite}
.skeleton-line{height:12px;border-radius:8px;background:linear-gradient(90deg,var(--bg3),var(--bg4),var(--bg3));background-size:220% 100%;animation:shimmer 1.1s infinite}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes shimmer{0%{background-position:120% 0}100%{background-position:-120% 0}}
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
@media (max-width:1100px){.grid-4,.quick-actions{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}.event-actions{opacity:1;transform:none}.top-search{min-width:180px}}
@media (max-width:820px){.sidebar{width:76px}.sidebar .brand-copy,.sidebar .nav-section,.sidebar .nav-label,.sidebar .sb-mode-copy{display:none}.sidebar .brand{justify-content:center;padding-left:8px;padding-right:8px}.sidebar .nav-item{justify-content:center;padding:8px}.topbar{gap:8px;padding:0 12px}.topbar-date,.quick-top-action{display:none}.top-search{min-width:120px}}
@media (max-width:680px){.content{padding:16px}.grid-3,.grid-4,.quick-actions{grid-template-columns:1fr}.dashboard-event{align-items:flex-start;flex-wrap:wrap}.event-actions{width:100%;justify-content:flex-end}.member-rank-card{grid-template-columns:auto auto 1fr}.member-rank-card .avatar{display:none}.top-search{display:none}}
`;

const VIEWS = ["Dashboard", "Members", "New Joinees", "Events", "Attendance", "Analytics", "Reports"];
const VIEW_ICONS = { Dashboard: "D", Members: "M", "New Joinees": "N", Events: "E", Attendance: "A", Analytics: "Y", Reports: "R" };

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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
    Object.values(attendance).forEach(rec => { total++; if (isAttendedStatus(rec[memberId])) present++; });
    return { total, present, pct: total ? Math.round(present / total * 100) : 0 };
  };

  const getEventStats = (eventId) => {
    const rec = attendance[eventId] || {};
    const newRec = newJoineeAttendance[eventId] || {};
    const present = members.filter(m => m.active && isAttendedStatus(rec[m.id])).length + newJoinees.filter(j => j.active && isAttendedStatus(newRec[j.id])).length;
    const total = members.filter(m => m.active).length + newJoinees.filter(j => j.active).length;
    return { present, absent: total - present, total, pct: total ? Math.round(present / total * 100) : 0 };
  };

  return (
    <>
      <style>{css}</style>
      <div className={`app ${isAdmin ? "admin-mode" : "view-mode"}`}>
        <Sidebar
          view={view}
          setView={setView}
          members={members}
          newJoinees={newJoinees}
          events={events}
          isAdmin={isAdmin}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          onAdminClick={isAdmin ? () => { setIsAdmin(false); showToast("Admin mode disabled"); } : openAdminLogin}
        />
        <div className="main">
          <Topbar
            view={view}
            setView={setView}
            members={members}
            newJoinees={newJoinees}
            events={events}
            isAdmin={isAdmin}
            onAdminClick={openAdminLogin}
            onAdminExit={() => { setIsAdmin(false); showToast("Admin mode disabled"); }}
          />
          <div className="content scroll-area">
            {view === "Dashboard" && <Dashboard members={members} events={events} attendance={attendance} getEventStats={getEventStats} getMemberStats={getMemberStats} setView={setView} isAdmin={isAdmin} />}
            {view === "Members" && <Members members={members} setMembers={setMembers} events={events} attendance={attendance} getMemberStats={getMemberStats} showToast={showToast} isAdmin={isAdmin} setView={setView} />}
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

function Sidebar({ view, setView, members, newJoinees, events, isAdmin, collapsed, setCollapsed, onAdminClick }) {
  const activeCount = members.filter(m => m.active).length;
  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""} ${isAdmin ? "admin" : "view"}`}>
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)} title={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
        {collapsed ? "›" : "‹"}
      </button>
      <div className="brand">
        <div className="brand-icon">AY</div>
        <div className="brand-copy">
          <div className="brand-title">Arham Yuva Seva Group</div>
          <div className="brand-sub">Attendance Tracker</div>
        </div>
      </div>
      <div className="nav scroll-area">
        <div className="nav-section">Navigation</div>
        {VIEWS.map(v => (
          <div key={v} data-tip={v} className={`nav-item${view === v ? " active" : ""}`} onClick={() => setView(v)}>
            <div className="nav-icon">{VIEW_ICONS[v]}</div>
            <span className="nav-label">{v}</span>
            {v === "Members" && <span className="badge">{activeCount}</span>}
            {v === "New Joinees" && <span className="badge">{newJoinees.length}</span>}
            {v === "Events" && <span className="badge">{events.length}</span>}
          </div>
        ))}
      </div>
      <div className="sb-footer">
        <div className="nav-item" data-tip={isAdmin ? "Exit Admin" : "Unlock Admin"} onClick={onAdminClick} style={{ color: isAdmin ? "var(--emerald)" : "var(--accent2)", borderColor: isAdmin ? "rgba(16,212,126,0.28)" : "var(--border)" }}>
          <div className="nav-icon">{isAdmin ? "U" : "L"}</div>
          <span className="nav-label">{isAdmin ? "Exit Admin" : "Admin"}</span>
        </div>
        <div className="sb-mode-copy" style={{ marginTop: 8, fontSize: 11, color: isAdmin ? "var(--emerald)" : "var(--text3)", padding: "0 10px" }}>
          {isAdmin ? "Unlocked editing" : "Locked view-only"}
        </div>
      </div>
    </div>
  );
}

function Topbar({ view, setView, members, newJoinees, events, isAdmin, onAdminClick, onAdminExit }) {
  const [query, setQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const searchItems = [
    ...VIEWS.map(v => ({ label: v, meta: "Navigation", view: v })),
    ...members.slice(0, 8).map(m => ({ label: m.name, meta: `Member · ${m.area || "No area"}`, view: "Members" })),
    ...newJoinees.slice(0, 5).map(j => ({ label: j.name, meta: "New Joinee", view: "New Joinees" })),
    ...events.slice(0, 8).map(e => ({ label: e.name, meta: `Event · ${fmtDate(e.date)}`, view: "Events" })),
  ];
  const results = query.trim()
    ? searchItems.filter(item => `${item.label} ${item.meta}`.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
    : [];
  const notifications = [
    `${events.length} events tracked`,
    `${members.filter(m => m.active).length} active members`,
    isAdmin ? "Admin editing is enabled" : "View-only mode is active",
  ];
  return (
    <div className={`topbar ${isAdmin ? "admin" : "view"}`}>
      <h1 className="page-title" style={{ fontSize: 17 }}>{view}</h1>
      <div className="top-search">
        <input className="input" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search members, events, pages..." />
        {results.length > 0 && (
          <div className="search-results">
            {results.map((item, index) => (
              <div key={`${item.label}-${index}`} className="search-result" onClick={() => { setView(item.view); setQuery(""); }}>
                <span className="nav-icon" style={{ width: 24, height: 24, fontSize: 11 }}>{VIEW_ICONS[item.view] || "S"}</span>
                <div>
                  <div style={{ color: "var(--text)", fontWeight: 700 }}>{item.label}</div>
                  <div className="text-xs color-muted">{item.meta}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <button className="btn btn-sm quick-top-action" onClick={() => setView("Attendance")}>A Mark</button>
      <button className="btn btn-sm quick-top-action" onClick={() => setView("Reports")}>R Export</button>
      <span className={`mode-chip ${isAdmin ? "admin" : "view"}`}>{isAdmin ? "◉ Unlocked Admin" : "◎ View Only"}</span>
      {!isAdmin && <button className="btn btn-sm" onClick={onAdminClick}>Unlock</button>}
      {isAdmin && <button className="btn btn-sm btn-danger" onClick={onAdminExit}>Lock</button>}
      <div className="flex items-center gap-2 topbar-date" style={{ fontSize: 12, color: "var(--text2)" }}><span className="sync-dot" />Synced now</div>
      <div className="top-menu">
        <button className="top-icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}>N</button>
        {showNotifications && (
          <div className="top-popover">
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Notifications</div>
            {notifications.map(n => <div key={n} className="search-result" style={{ cursor: "default" }}>{n}</div>)}
          </div>
        )}
      </div>
      <div className="top-menu">
        <button className="top-icon-btn" onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}>P</button>
        {showProfile && (
          <div className="top-popover">
            <div style={{ fontWeight: 800 }}>AYSG Console</div>
            <div className="text-xs color-muted mb-3">{isAdmin ? "Admin profile" : "Viewer profile"}</div>
            <button className="btn btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={isAdmin ? onAdminExit : onAdminClick}>{isAdmin ? "Lock Admin" : "Unlock Admin"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ members, events, attendance, getEventStats, getMemberStats, setView, isAdmin }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(timer);
  }, [members.length, events.length]);

  const active = members.filter(m => m.active);
  const totalEvents = events.length;
  const overallPct = active.length
    ? Math.round(active.reduce((s, m) => s + getMemberStats(m.id).pct, 0) / active.length)
    : 0;
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const recentEvents = sortedEvents.slice(0, 4);
  const topMembers = [...active].sort((a, b) => getMemberStats(b.id).pct - getMemberStats(a.id).pct).slice(0, 5);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const currentMonth = today.toISOString().slice(0, 7);
  const previousMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const previousMonth = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthEvents = events.filter(e => e.date.startsWith(currentMonth)).length;
  const previousMonthEvents = events.filter(e => e.date.startsWith(previousMonth)).length;
  const eventGrowth = currentMonthEvents - previousMonthEvents;
  const currentMonthMembers = active.filter(m => m.joinDate?.startsWith(currentMonth)).length;
  const previousMonthMembers = active.filter(m => m.joinDate?.startsWith(previousMonth)).length;
  const memberGrowth = currentMonthMembers - previousMonthMembers;
  const avgForEvents = (list) => list.length ? Math.round(list.reduce((sum, e) => sum + getEventStats(e.id).pct, 0) / list.length) : 0;
  const recentAvg = avgForEvents(sortedEvents.slice(0, 3));
  const priorAvg = avgForEvents(sortedEvents.slice(3, 6));
  const attendanceTrend = recentAvg - priorAvg;
  const daysAgo = (days) => {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - days);
    return d;
  };
  const activityNow = events.filter(e => new Date(e.date) >= daysAgo(30)).length;
  const activityBefore = events.filter(e => new Date(e.date) >= daysAgo(60) && new Date(e.date) < daysAgo(30)).length;
  const activityTrend = activityNow - activityBefore;
  const lastEventStats = recentEvents[0] ? getEventStats(recentEvents[0].id) : null;
  const lastPriorStats = recentEvents[1] ? getEventStats(recentEvents[1].id) : null;
  const lastEventTrend = lastEventStats && lastPriorStats ? lastEventStats.present - lastPriorStats.present : 0;

  const trend = (value, suffix = "", zeroText = "No change") => ({
    className: value > 0 ? "up" : value < 0 ? "down" : "flat",
    icon: value > 0 ? "↗" : value < 0 ? "↘" : "→",
    text: value === 0 ? zeroText : `${value > 0 ? "+" : ""}${value}${suffix}`,
  });
  const pctColor = (pct) => pct >= 75 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "var(--rose)";
  const eventStatus = (event) => {
    const eventDate = new Date(event.date);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (eventDay.getTime() === startOfToday.getTime()) return { label: "Ongoing", cls: "ongoing", dot: "●" };
    if (eventDay > startOfToday) return { label: "Upcoming", cls: "upcoming", dot: "●" };
    return { label: "Completed", cls: "completed", dot: "●" };
  };
  const memberStreak = (memberId) => {
    let count = 0;
    for (const event of sortedEvents) {
      if (isAttendedStatus(attendance[event.id]?.[memberId])) count += 1;
      else break;
    }
    return count;
  };
  const statCards = [
    { label: "Total Members", value: active.length, icon: "👥", color: "#7c6af8", sub: "Active volunteers", trend: trend(memberGrowth, " joined this month", "Roster steady") },
    { label: "Total Events", value: totalEvents, icon: "📅", color: "#06b6d4", sub: "Activities tracked", trend: trend(eventGrowth, " this month", "No monthly change") },
    { label: "Avg Attendance", value: overallPct + "%", icon: "✅", color: "#10d47e", sub: "Recent pulse vs prior events", trend: trend(attendanceTrend, "%") },
    { label: "Last Event", value: lastEventStats ? lastEventStats.present : 0, icon: "🎯", color: "#f0b429", sub: recentEvents[0] ? recentEvents[0].name : "No events yet", trend: trend(lastEventTrend, " present", "Same as prior event") },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Good {getGreeting()} 🙏</h1>
          <p style={{ color: "var(--text2)", fontSize: 13.5, marginTop: 4 }}>Live AYSG overview with trends, movement, and next actions</p>
        </div>
      </div>
      {isAdmin && (
        <div className="quick-actions">
          {[
            { label: "Create Event", detail: "Plan the next activity", icon: "➕", color: "#06b6d4", view: "Events" },
            { label: "Start Attendance", detail: "Mark today or recent event", icon: "✅", color: "#10d47e", view: "Attendance" },
            { label: "Add Member", detail: "Grow the main group", icon: "👤", color: "#ec4899", view: "Members" },
            { label: "Export Report", detail: "Open PDF exports", icon: "📄", color: "#f0b429", view: "Reports" },
          ].map(a => (
            <button key={a.label} className="quick-action" onClick={() => setView(a.view)}>
              <div className="quick-action-icon" style={{ background: a.color + "22", color: a.color }}>{a.icon}</div>
              <div style={{ fontSize: 13.5, fontWeight: 800 }}>{a.label}</div>
              <div style={{ color: "var(--text2)", fontSize: 11.5, marginTop: 3 }}>{a.detail}</div>
            </button>
          ))}
        </div>
      )}
      <div className="grid-4 mb-6">
        {loading ? [1, 2, 3, 4].map(n => <div key={n} className="skeleton-card" />) : statCards.map((s, index) => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.color + "22" }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
            <div className={`trend ${s.trend.className}`} style={{ animationDelay: `${index * 0.05}s` }}>
              <span>{s.trend.icon}</span><span>{s.trend.text}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="grid-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>Recent Events</h2>
            <button className="btn btn-sm" onClick={() => setView("Events")}>View All →</button>
          </div>
          {loading ? (
            <div>
              {[1, 2, 3].map(n => <div key={n} className="skeleton-line" style={{ height: 54, marginBottom: 10 }} />)}
            </div>
          ) : recentEvents.length === 0 ? <EmptyState icon="📅" msg="No events yet. Create one to activate the dashboard." /> : recentEvents.map(e => {
            const s = getEventStats(e.id);
            const status = eventStatus(e);
            return (
              <div key={e.id} className="dashboard-event">
                <div style={{ width: 42, height: 42, borderRadius: 10, background: e.color + "22", color: e.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📅</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 wrap">
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text)" }}>{e.name}</div>
                    <span className="chip" style={{ background: e.color + "18", borderColor: e.color + "36", color: e.color }}>{e.category || "Event"}</span>
                    <span className={`status-badge status-${status.cls}`}>{status.dot} {status.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 4 }}>{fmtDate(e.date)} · {e.venue || "Venue pending"}</div>
                  <div className="progress-bar" style={{ marginTop: 8, height: 5 }}>
                    <div className="progress-fill" style={{ width: s.pct + "%", background: `linear-gradient(90deg,${e.color},${pctColor(s.pct)})` }} />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 56 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: s.pct >= 75 ? "var(--emerald)" : s.pct >= 50 ? "var(--gold)" : "var(--rose)" }}>{s.pct}%</div>
                  <div style={{ fontSize: 11, color: "var(--text2)" }}>{s.present}/{s.total}</div>
                </div>
                <div className="event-actions">
                  <button className="btn btn-sm" onClick={() => setView("Attendance")}>Mark</button>
                  <button className="btn btn-sm" onClick={() => setView("Reports")}>PDF</button>
                </div>
              </div>
            );
          })}
          {!loading && events.length > 0 && (
            <div className={`trend ${trend(activityTrend, " events in 30d").className}`}>
              <span>{trend(activityTrend).icon}</span>
              <span>{trend(activityTrend, " events in the last 30 days").text}</span>
            </div>
          )}
        </div>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>🏆 Top Members</h2>
            <button className="btn btn-sm" onClick={() => setView("Members")}>View All →</button>
          </div>
          {loading ? (
            <div>
              {[1, 2, 3, 4].map(n => <div key={n} className="skeleton-line" style={{ height: 48, marginBottom: 10 }} />)}
            </div>
          ) : topMembers.length === 0 ? <EmptyState icon="🏆" msg="No active members to rank yet" /> : topMembers.map((m, i) => {
            const s = getMemberStats(m.id);
            const streak = memberStreak(m.id);
            const medal = ["🥇", "🥈", "🥉"][i] || `#${i + 1}`;
            return (
              <div key={m.id} className="member-rank-card">
                <div style={{ fontSize: i < 3 ? 18 : 12, width: 26, textAlign: "center", fontWeight: 800, color: i < 3 ? "var(--gold)" : "var(--text2)" }}>{medal}</div>
                <div className="mini-ring" style={{ background: `conic-gradient(${pctColor(s.pct)} ${s.pct * 3.6}deg, var(--bg4) 0deg)` }}>
                  <span style={{ color: pctColor(s.pct) }}>{s.pct}%</span>
                </div>
                <Avatar name={m.name} size={32} />
                <div className="flex-1">
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                  <div className="flex gap-2 wrap" style={{ marginTop: 5 }}>
                    <span className="streak-badge">🔥 {streak} streak</span>
                    <span className="tag tag-purple">{s.present}/{s.total} attended</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Members({ members, setMembers, events, attendance, getMemberStats, showToast, isAdmin, setView }) {
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterPerformance, setFilterPerformance] = useState("");
  const [filterActivity, setFilterActivity] = useState("");
  const [filterJoiner, setFilterJoiner] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", area: "", gender: "Male", role: "Member", notes: "", joinDate: "", active: true });

  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const today = new Date();
  const daysAgo = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return d;
  };
  const areas = [...new Set(members.map(m => m.area).filter(Boolean))];
  const pctColor = (pct) => pct >= 75 ? "var(--emerald)" : pct >= 50 ? "var(--gold)" : "var(--rose)";
  const roleOf = (m) => m.role || (m.notes?.toLowerCase().includes("lead") ? "Lead" : "Member");
  const attendanceHistory = (memberId) => sortedEvents.map(event => ({
    event,
    present: isAttendedStatus(attendance[event.id]?.[memberId]),
  }));
  const memberInsights = (m) => {
    const stats = getMemberStats(m.id);
    const history = attendanceHistory(m.id);
    const presentHistory = history.filter(h => h.present);
    const lastAttended = presentHistory[0]?.event || null;
    let streak = 0;
    for (const item of history) {
      if (item.present) streak += 1;
      else break;
    }
    const recent = history.slice(0, 5);
    const recentPct = recent.length ? Math.round(recent.filter(h => h.present).length / recent.length * 100) : 0;
    const missed = history.filter(h => !h.present).length;
    const joinedRecently = m.joinDate ? new Date(m.joinDate) >= daysAgo(60) : false;
    const inactiveByAttendance = stats.total > 0 && !lastAttended;
    return { stats, history, presentHistory, lastAttended, streak, recentPct, missed, joinedRecently, inactiveByAttendance };
  };
  const performanceBucket = (pct) => pct >= 75 ? "strong" : pct >= 50 ? "steady" : "needs";
  const filtered = members.filter(m => {
    const insight = memberInsights(m);
    const term = search.toLowerCase();
    const matchesSearch = !search || [m.name, m.mobile, m.id, m.area, roleOf(m)].some(v => String(v || "").toLowerCase().includes(term));
    const matchesPerformance = !filterPerformance || performanceBucket(insight.stats.pct) === filterPerformance;
    const matchesActivity = !filterActivity ||
      (filterActivity === "active" && m.active) ||
      (filterActivity === "inactive" && !m.active) ||
      (filterActivity === "recent" && insight.lastAttended && new Date(insight.lastAttended.date) >= daysAgo(45)) ||
      (filterActivity === "quiet" && (!insight.lastAttended || new Date(insight.lastAttended.date) < daysAgo(45)));
    const matchesJoiner = !filterJoiner || (filterJoiner === "new" ? insight.joinedRecently : !insight.joinedRecently);
    return matchesSearch && (!filterArea || m.area === filterArea) && matchesPerformance && matchesActivity && matchesJoiner;
  });

  const openAdd = () => { setForm({ name: "", mobile: "", area: "", gender: "Male", role: "Member", notes: "", joinDate: new Date().toISOString().split("T")[0], active: true }); setEditMember(null); setShowForm(true); };
  const openEdit = (m) => { setForm({ role: "Member", ...m }); setEditMember(m.id); setShowForm(true); };
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
  const selectedInsights = selectedMember ? memberInsights(selectedMember) : null;

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
        <div className="search-box flex-1" style={{ minWidth: 240 }}>
          <input className="input" placeholder="Search name, mobile, ID, area, role..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ width: 145 }} value={filterArea} onChange={e => setFilterArea(e.target.value)}>
          <option value="">All Areas</option>
          {areas.map(a => <option key={a}>{a}</option>)}
        </select>
        <select className="input" style={{ width: 165 }} value={filterPerformance} onChange={e => setFilterPerformance(e.target.value)}>
          <option value="">All Performance</option>
          <option value="strong">75%+ Strong</option>
          <option value="steady">50-74% Steady</option>
          <option value="needs">Below 50%</option>
        </select>
        <select className="input" style={{ width: 155 }} value={filterActivity} onChange={e => setFilterActivity(e.target.value)}>
          <option value="">All Activity</option>
          <option value="active">Active status</option>
          <option value="inactive">Inactive status</option>
          <option value="recent">Recently attended</option>
          <option value="quiet">Quiet 45d+</option>
        </select>
        <select className="input" style={{ width: 145 }} value={filterJoiner} onChange={e => setFilterJoiner(e.target.value)}>
          <option value="">All Tenure</option>
          <option value="new">New joiners</option>
          <option value="existing">Existing</option>
        </select>
      </div>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {filtered.length === 0 ? <EmptyState icon="👥" msg="No members found" /> : (
          <div style={{ overflowX: "auto" }}>
          <table className="table dense-table" style={{ minWidth: 1040 }}>
            <thead><tr><th>Member</th><th>Attendance</th><th>Streak</th><th>Last Attended</th><th>Role</th><th>Area</th><th>Activity</th><th></th></tr></thead>
            <tbody>
              {filtered.map(m => {
                const insight = memberInsights(m);
                const s = insight.stats;
                const bucket = performanceBucket(s.pct);
                return (
                  <tr key={m.id} className="member-row" onClick={() => setSelectedMember(m)}>
                    <td><div className="flex items-center gap-3"><Avatar name={m.name} size={30} /><div><div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div><div className="text-xs color-muted">{m.id} · {m.mobile || "No mobile"}</div></div></div></td>
                    <td>
                      <div className="attendance-meter">
                        <div className="attendance-ring" style={{ background: `conic-gradient(${pctColor(s.pct)} ${s.pct * 3.6}deg, var(--bg4) 0deg)` }}><span style={{ color: pctColor(s.pct) }}>{s.pct}%</span></div>
                        <div className="flex-1">
                          <div className="progress-bar"><div className="progress-fill" style={{ width: s.pct + "%", background: pctColor(s.pct) }} /></div>
                          <div className="text-xs color-muted" style={{ marginTop: 4 }}>{s.present}/{s.total || events.length} events · {bucket === "strong" ? "Strong" : bucket === "steady" ? "Steady" : "Needs focus"}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="streak-badge">🔥 {insight.streak}</span></td>
                    <td style={{ fontSize: 12.5, color: "var(--text2)" }}>{insight.lastAttended ? <><span style={{ color: "var(--text)" }}>{insight.lastAttended.name}</span><br />{fmtDate(insight.lastAttended.date)}</> : "No attendance yet"}</td>
                    <td><span className="tag tag-purple">{roleOf(m)}</span></td>
                    <td style={{ color: "var(--text2)", fontSize: 12.5 }}>{m.area || "—"}</td>
                    <td><span className={`tag ${m.active ? "tag-present" : "tag-absent"}`}>{m.active ? "Active" : "Inactive"}</span>{insight.joinedRecently && <span className="tag tag-purple" style={{ marginLeft: 6 }}>New</span>}</td>
                    <td>
                      <div className="row-actions">
                        <button className="btn btn-sm" onClick={e => { e.stopPropagation(); setSelectedMember(m); }}>Profile</button>
                        <button className="btn btn-sm" onClick={e => { e.stopPropagation(); setSelectedMember(m); setView("Attendance"); }}>History</button>
                        {isAdmin && <button className="btn btn-sm" onClick={e => { e.stopPropagation(); openEdit(m); }}>Edit</button>}
                        {isAdmin && <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); deleteMember(m.id); }}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}
      </div>
      {selectedMember && selectedInsights && (
        <div className="drawer-bg" onClick={e => e.target === e.currentTarget && setSelectedMember(null)}>
          <div className="profile-drawer">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={selectedMember.name} size={44} />
                <div>
                  <h2 className="section-title" style={{ margin: 0 }}>{selectedMember.name}</h2>
                  <div className="text-xs color-muted">{selectedMember.id} · {roleOf(selectedMember)} · {selectedMember.area || "No area"}</div>
                </div>
              </div>
              <button className="btn btn-sm" onClick={() => setSelectedMember(null)}>Close</button>
            </div>
            <div className="analytics-strip mb-4">
              {[
                ["Attendance", selectedInsights.stats.pct + "%", pctColor(selectedInsights.stats.pct)],
                ["Streak", selectedInsights.streak, "var(--gold)"],
                ["Recent 5", selectedInsights.recentPct + "%", pctColor(selectedInsights.recentPct)],
              ].map(([label, value, color]) => (
                <div key={label} className="analytics-tile">
                  <div className="stat-label" style={{ marginBottom: 5 }}>{label}</div>
                  <div className="stat-value" style={{ color, fontSize: 22 }}>{value}</div>
                </div>
              ))}
            </div>
            <div className="card mb-4" style={{ padding: 14 }}>
              <div className="flex items-center justify-between mb-3">
                <div style={{ fontWeight: 800, fontSize: 13.5 }}>Attendance Trend</div>
                <span className={`tag ${selectedMember.active ? "tag-present" : "tag-absent"}`}>{selectedMember.active ? "Active" : "Inactive"}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.max(selectedInsights.history.slice(0, 10).length, 1)},1fr)`, gap: 5 }}>
                {selectedInsights.history.slice(0, 10).reverse().map(({ event, present }) => (
                  <div key={event.id} title={event.name} style={{ height: 42, borderRadius: 7, background: present ? "rgba(16,212,126,0.22)" : "rgba(244,63,94,0.16)", border: `1px solid ${present ? "rgba(16,212,126,0.35)" : "rgba(244,63,94,0.28)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: present ? "var(--emerald)" : "var(--rose)", fontWeight: 800 }}>
                    {present ? "✓" : "×"}
                  </div>
                ))}
              </div>
            </div>
            <div className="grid-2 mb-4">
              <div className="analytics-tile"><div className="stat-label">Last Attended</div><div style={{ fontWeight: 700, fontSize: 13 }}>{selectedInsights.lastAttended ? selectedInsights.lastAttended.name : "Never"}</div><div className="text-xs color-muted">{selectedInsights.lastAttended ? fmtDate(selectedInsights.lastAttended.date) : "No recorded presence"}</div></div>
              <div className="analytics-tile"><div className="stat-label">Participation</div><div style={{ fontWeight: 700, fontSize: 13 }}>{selectedInsights.presentHistory.length} present · {selectedInsights.missed} missed</div><div className="text-xs color-muted">Joined {fmtDate(selectedMember.joinDate) || "date unknown"}</div></div>
            </div>
            <div className="card mb-4" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>Notes & Details</div>
              <div className="text-sm color-muted">{selectedMember.notes || "No notes added yet."}</div>
              <div className="flex gap-2 wrap mt-4">
                <span className="tag tag-purple">{selectedMember.gender || "Gender not set"}</span>
                <span className="tag tag-purple">{selectedMember.mobile || "No mobile"}</span>
                {selectedInsights.joinedRecently && <span className="tag tag-present">New joiner</span>}
              </div>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <div style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>Participation History</div>
              {selectedInsights.history.length === 0 ? <EmptyState icon="📅" msg="No event history yet" /> : selectedInsights.history.map(({ event, present }) => (
                <div key={event.id} className="history-item">
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{event.name}</div>
                    <div className="text-xs color-muted">{fmtDate(event.date)} · {event.category || "Event"}</div>
                  </div>
                  <span className={`tag ${present ? "tag-present" : "tag-absent"}`}>{present ? "Present" : "Absent"}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
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
              <div className="field"><label>Role</label><input className="input" value={form.role || ""} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Member / Lead / Volunteer" /></div>
            </div>
            <div className="grid-2">
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
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [smartFilter, setSmartFilter] = useState("");
  const isNewJoineeGroup = group === "newJoinees";
  const activePeople = (isNewJoineeGroup ? newJoinees : members).filter(p => p.active);
  const store = isNewJoineeGroup ? newJoineeAttendance : attendance;
  const setStore = isNewJoineeGroup ? setNewJoineeAttendance : setAttendance;
  const rec = store[selEvent] || {};
  const groupLabel = isNewJoineeGroup ? "New Joinees" : "Members";
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const event = events.find(e => e.id === selEvent);
  const statusOrder = ["present", "absent", "late", "excused"];
  const statusMeta = {
    present: { label: "Present", icon: "✓", color: "#10d47e" },
    absent: { label: "Absent", icon: "×", color: "#f43f5e" },
    late: { label: "Late", icon: "⏱", color: "#f0b429" },
    excused: { label: "Excused", icon: "○", color: "#06b6d4" },
  };
  const statusOf = (personId) => normalizeAttendanceStatus(rec[personId]);
  const pctColor = (value) => value >= 75 ? "var(--emerald)" : value >= 50 ? "var(--gold)" : "var(--rose)";
  const areas = isNewJoineeGroup ? [] : [...new Set(members.map(m => m.area).filter(Boolean))];
  const personHistory = (personId) => sortedEvents.map(e => ({
    event: e,
    status: normalizeAttendanceStatus((isNewJoineeGroup ? newJoineeAttendance : attendance)[e.id]?.[personId]),
  }));
  const personStats = (person) => {
    const history = personHistory(person.id).filter(item => item.event.id !== selEvent);
    const attended = history.filter(item => isAttendedStatus(item.status));
    const last = attended[0]?.event || null;
    let streak = 0;
    for (const item of history) {
      if (isAttendedStatus(item.status)) streak += 1;
      else break;
    }
    const pct = history.length ? Math.round(attended.length / history.length * 100) : 0;
    return { history, attended: attended.length, pct, last, streak, firstTimer: attended.length === 0 };
  };
  const filtered = activePeople.filter(p => {
    const status = statusOf(p.id);
    const stats = personStats(p);
    const term = search.toLowerCase();
    const matchesSearch = !search || [p.name, p.id, p.area, p.notes, p.role].some(v => String(v || "").toLowerCase().includes(term));
    const matchesStatus = !statusFilter || status === statusFilter;
    const matchesArea = !areaFilter || p.area === areaFilter;
    const matchesSmart = !smartFilter ||
      (smartFilter === "low" && stats.history.length > 0 && stats.pct < 50) ||
      (smartFilter === "first" && stats.firstTimer) ||
      (smartFilter === "streak" && stats.streak >= 3) ||
      (smartFilter === "missing" && status === "absent");
    return matchesSearch && matchesStatus && matchesArea && matchesSmart;
  });

  const setPersonStatus = (personId, status) => {
    if (!isAdmin) return;
    setStore({ ...store, [selEvent]: { ...rec, [personId]: status } });
  };

  const cycleStatus = (personId) => {
    if (!isAdmin) return;
    const current = statusOf(personId);
    const next = statusOrder[(statusOrder.indexOf(current) + 1) % statusOrder.length];
    setPersonStatus(personId, next);
  };

  const markAll = (status) => {
    if (!isAdmin) return;
    const updated = {};
    activePeople.forEach(p => updated[p.id] = status);
    setStore({ ...store, [selEvent]: updated });
    showToast(`${groupLabel} marked ${statusMeta[status].label}`, "success");
  };

  const importPrevious = () => {
    if (!isAdmin || !selEvent) return;
    const currentIndex = sortedEvents.findIndex(e => e.id === selEvent);
    const previous = sortedEvents.slice(currentIndex + 1).find(e => store[e.id]);
    if (!previous) return showToast("No previous attendance found for this group", "error");
    const prevRec = store[previous.id] || {};
    const updated = {};
    activePeople.forEach(p => updated[p.id] = normalizeAttendanceStatus(prevRec[p.id]));
    setStore({ ...store, [selEvent]: updated });
    showToast(`Imported from ${previous.name}`, "success");
  };

  const resetAttendance = () => {
    if (!isAdmin) return;
    const nextStore = { ...store };
    delete nextStore[selEvent];
    setStore(nextStore);
    showToast("Attendance reset for this event", "success");
  };

  const counts = statusOrder.reduce((acc, status) => {
    acc[status] = activePeople.filter(p => statusOf(p.id) === status).length;
    return acc;
  }, {});
  const present = counts.present + counts.late;
  const pct = activePeople.length ? Math.round(present / activePeople.length * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{isAdmin ? "Operational attendance console for live events" : "View attendance records"}</p>
        </div>
        <span className={`status-badge ${isAdmin ? "status-completed" : "status-upcoming"}`}>{isAdmin ? "● Admin editing active" : "● View-only locked"}</span>
      </div>
      <div className={`mode-banner ${isAdmin ? "admin" : "view"}`}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 13.5 }}>{isAdmin ? "Admin Mode Enabled" : "View-only Mode"}</div>
          <div style={{ fontSize: 12, opacity: 0.82 }}>{isAdmin ? "Cards and status buttons update attendance immediately." : "Editing interactions are disabled. Log in as admin to mark attendance."}</div>
        </div>
        <span style={{ fontSize: 20 }}>{isAdmin ? "⚡" : "🔒"}</span>
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
                  <span>Present/Late: {present}</span>
                  <span>Absent: {counts.absent}</span>
                  <span>Excused: {counts.excused}</span>
                </div>
                <div className="progress-bar"><div className="progress-fill" style={{ width: pct + "%", background: pctColor(pct) }} /></div>
                {event && <div className="text-xs color-muted" style={{ marginTop: 8 }}>{event.name} · {fmtDate(event.date)} · {event.venue || "Venue pending"}</div>}
              </div>
            </div>
          )}
        </div>
      </div>
      {selEvent && (
        <>
          <div className="ops-panel">
            <div className="flex gap-3 mb-4 wrap">
              <button className={`btn btn-sm${!isNewJoineeGroup ? " btn-primary" : ""}`} onClick={() => { setGroup("members"); setAreaFilter(""); }}>Members</button>
              <button className={`btn btn-sm${isNewJoineeGroup ? " btn-primary" : ""}`} onClick={() => { setGroup("newJoinees"); setAreaFilter(""); }}>New Joinees</button>
              <div className="search-box flex-1" style={{ minWidth: 220 }}>
                <input className="input" placeholder={`Search ${groupLabel.toLowerCase()}...`} value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input" style={{ width: 145 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                {statusOrder.map(status => <option key={status} value={status}>{statusMeta[status].label}</option>)}
              </select>
              {!isNewJoineeGroup && (
                <select className="input" style={{ width: 135 }} value={areaFilter} onChange={e => setAreaFilter(e.target.value)}>
                  <option value="">All Areas</option>
                  {areas.map(area => <option key={area}>{area}</option>)}
                </select>
              )}
              <select className="input" style={{ width: 170 }} value={smartFilter} onChange={e => setSmartFilter(e.target.value)}>
                <option value="">Smart Filters</option>
                <option value="low">Low attendance</option>
                <option value="first">First-time attendees</option>
                <option value="streak">3+ streak</option>
                <option value="missing">Currently absent</option>
              </select>
            </div>
            {isAdmin && (
              <div className="flex gap-2 wrap">
                <button className="btn btn-success btn-sm" onClick={() => markAll("present")}>Mark All Present</button>
                <button className="btn btn-danger btn-sm" onClick={() => markAll("absent")}>Mark All Absent</button>
                <button className="btn btn-sm" onClick={importPrevious}>Import Previous Attendance</button>
                <button className="btn btn-sm btn-danger" onClick={resetAttendance}>Reset Attendance</button>
              </div>
            )}
          </div>
          <div className="flex gap-2 wrap mb-4">
            {statusOrder.map(status => (
              <span key={status} className="status-pill" style={{ "--status-color": statusMeta[status].color }}>
                {statusMeta[status].icon} {statusMeta[status].label}: {counts[status]}
              </span>
            ))}
          </div>
          <div className="attendance-grid">
            {filtered.map(p => {
              const status = statusOf(p.id);
              const meta = statusMeta[status] || statusMeta.absent;
              const stats = personStats(p);
              const detail = isNewJoineeGroup ? (p.notes || "New joinee") : (p.area || "Member");
              const role = p.role || (isNewJoineeGroup ? "New Joinee" : "Member");
              return (
                <div key={p.id} className={`attendance-card ${isAdmin ? "editable" : "locked"}`} onClick={() => cycleStatus(p.id)} style={{ "--status-color": meta.color, borderColor: status === "absent" ? "var(--border)" : `${meta.color}44`, background: status === "absent" ? "var(--bg3)" : `${meta.color}12` }}>
                  <div className="flex items-center gap-3">
                    <Avatar name={p.name} size={38} color={isAttendedStatus(status) ? meta.color : undefined} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 wrap">
                        <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--text)" }}>{p.name}</div>
                        <span className="tag tag-purple">{role}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text2)", marginTop: 3 }}>{detail}</div>
                    </div>
                    <span className="status-pill" style={{ "--status-color": meta.color }}>{meta.icon} {meta.label}</span>
                  </div>
                  <div className="flex gap-2 wrap mt-4">
                    <span className="streak-badge">🔥 {stats.streak} streak</span>
                    <span className="tag tag-purple">{stats.pct}% overall</span>
                    {stats.firstTimer && <span className="tag tag-present">First-time</span>}
                  </div>
                  <div className="text-xs color-muted mt-2">
                    Last attended: {stats.last ? `${stats.last.name} (${fmtDate(stats.last.date)})` : "No previous attendance"}
                  </div>
                  <div className="status-picker" onClick={e => e.stopPropagation()}>
                    {statusOrder.map(option => (
                      <button
                        key={option}
                        className={`status-choice ${status === option ? "active" : ""}`}
                        style={{ "--status-color": statusMeta[option].color }}
                        disabled={!isAdmin}
                        onClick={() => setPersonStatus(p.id, option)}
                      >
                        {statusMeta[option].icon} {statusMeta[option].label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && <EmptyState icon="🔎" msg="No people match the selected attendance filters" />}
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

// ─── PDF BUILDERS ──────────────────────────────────────────────────────────

function buildSingleEventPdfHtml({ event, allPeople, attendanceGetter, attendanceStatusGetter, stats, sortBy, groupName = "All People", exportedBy = "AYSG Admin Console", generatedAt = new Date().toLocaleString("en-IN") }) {
  const statusMeta = {
    present: { label: "Present", icon: "✓", color: "#15803d", bg: "#dcfce7", score: 4 },
    late: { label: "Late", icon: "◔", color: "#b45309", bg: "#fef3c7", score: 3 },
    excused: { label: "Excused", icon: "•", color: "#0f766e", bg: "#ccfbf1", score: 2 },
    absent: { label: "Absent", icon: "✕", color: "#be123c", bg: "#ffe4e6", score: 1 },
  };
  const reportGroupForPerson = (person) => {
    if (person.group === "New Joinee") return "New Joiners";
    if (/volunteer/i.test(person.role || person.notes || "")) return "Volunteers";
    return "Main Group";
  };
  const sorted = [...allPeople].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return (statusMeta[attendanceStatusGetter(event.id, b.id)]?.score || 0) - (statusMeta[attendanceStatusGetter(event.id, a.id)]?.score || 0);
  });
  const groupedPeople = ["Main Group", "New Joiners", "Volunteers"].map(section => ({
    section,
    people: sorted.filter(person => reportGroupForPerson(person) === section),
  })).filter(section => section.people.length > 0);
  const statusCounts = sorted.reduce((acc, person) => {
    const status = attendanceStatusGetter(event.id, person.id);
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, { present: 0, late: 0, excused: 0, absent: 0 });
  const pct = stats.pct;
  const pctColor = pct >= 75 ? "#166534" : pct >= 50 ? "#854d0e" : "#991b1b";
  const highlightList = [
    `${statusCounts.present + statusCounts.late} active participants recorded`,
    `${statusCounts.absent} people require follow-up`,
    `${groupedPeople.length} roster section${groupedPeople.length !== 1 ? "s" : ""} represented in this report`,
  ];
  const lowAttendance = groupedPeople.flatMap(section => section.people).filter(person => !attendanceGetter(event.id, person.id)).slice(0, 4);
  const insightBars = [
    ["Present", statusCounts.present, "#22c55e"],
    ["Late", statusCounts.late, "#f59e0b"],
    ["Excused", statusCounts.excused, "#14b8a6"],
    ["Absent", statusCounts.absent, "#f43f5e"],
  ];
  const renderBadge = (status) => {
    const meta = statusMeta[status];
    return `<span class="status-badge" style="color:${meta.color};background:${meta.bg};border-color:${meta.color}22">${meta.icon} ${meta.label}</span>`;
  };
  const renderRows = (people) => people.map((person, index) => {
    const status = attendanceStatusGetter(event.id, person.id);
    const role = person.role || reportGroupForPerson(person);
    return `<tr>
      <td class="idx">${index + 1}</td>
      <td class="name-cell"><div class="name-main">${person.name}</div><div class="name-sub">${role}</div></td>
      <td class="group-cell">${reportGroupForPerson(person)}</td>
      <td class="status-cell">${renderBadge(status)}</td>
    </tr>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>${event.name} - ${groupName} Attendance</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,Arial,sans-serif;background:#eef2f7;color:#0f172a}
    .page{max-width:794px;margin:0 auto;background:#fff;box-shadow:0 18px 50px rgba(15,23,42,0.12)}
    .header{background:linear-gradient(135deg,#10203e 0%,#1e3a5f 45%,#355f8c 100%);padding:38px 42px 30px;color:#fff;position:relative;overflow:hidden}
    .header::before,.header::after{content:'';position:absolute;border-radius:999px;background:rgba(255,255,255,0.06)}
    .header::before{width:180px;height:180px;right:-40px;top:-50px}
    .header::after{width:140px;height:140px;right:90px;bottom:-70px}
    .org-pill{display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:5px 14px;font-size:10px;font-weight:800;letter-spacing:1.8px;text-transform:uppercase;color:#dbeafe;margin-bottom:16px}
    .report-kicker{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#bfdbfe;margin-bottom:10px}
    .event-title{font-size:31px;font-weight:800;line-height:1.15;max-width:80%;margin-bottom:16px}
    .meta-grid{display:flex;flex-wrap:wrap;gap:10px}
    .meta-chip{display:inline-flex;align-items:center;gap:6px;padding:7px 12px;border-radius:999px;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.12);font-size:11px;color:#e0f2fe}
    .summary-wrap{padding:28px 42px 0}
    .insights{display:grid;grid-template-columns:1.15fr 1fr;gap:18px;margin-bottom:18px}
    .panel{border:1px solid #dde5f0;border-radius:18px;padding:20px 22px;background:#fbfdff}
    .panel h3{font-size:12px;letter-spacing:1.1px;text-transform:uppercase;color:#64748b;margin-bottom:12px}
    .lead-line{font-size:24px;font-weight:800;color:#0f172a;margin-bottom:10px}
    .insight-list{display:grid;gap:10px;font-size:13px;color:#334155}
    .insight-item{padding-left:14px;position:relative}
    .insight-item::before{content:'';position:absolute;left:0;top:7px;width:6px;height:6px;border-radius:999px;background:#3b82f6}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
    .stat-card{border:1px solid #e2e8f0;border-radius:18px;padding:18px 18px 16px;background:#fff;min-height:108px;display:flex;flex-direction:column;justify-content:space-between}
    .stat-label{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;font-weight:700}
    .stat-value{font-size:28px;font-weight:800;line-height:1;color:#0f172a}
    .stat-sub{font-size:11px;color:#94a3b8}
    .divider{height:1px;background:linear-gradient(90deg,#dbe5f0,transparent);margin:0 42px}
    .body{padding:24px 42px 28px}
    .chart-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:20px}
    .chart-box{border:1px solid #e2e8f0;border-radius:18px;padding:18px;background:#fff}
    .chart-box h4{font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:14px}
    .bar-list{display:grid;gap:10px}
    .bar-row{display:grid;grid-template-columns:90px 1fr 42px;gap:10px;align-items:center;font-size:12px;color:#334155}
    .bar-track{height:10px;background:#edf2f7;border-radius:999px;overflow:hidden}
    .bar-fill{height:100%;border-radius:999px}
    .alert-box{background:#fff7ed;border:1px solid #fdba74;border-radius:16px;padding:14px 16px;font-size:12.5px;color:#9a3412}
    .alert-box strong{display:block;color:#7c2d12;margin-bottom:4px}
    .section{margin-top:22px}
    .section-head{display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;margin-bottom:14px;border-bottom:1px solid #e8eef5}
    .section-title{font-size:14px;font-weight:800;letter-spacing:0.4px;color:#0f172a}
    .section-meta{font-size:11px;color:#64748b;text-transform:uppercase;letter-spacing:0.9px}
    .group-card{border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;margin-bottom:16px}
    .group-head{padding:12px 16px;background:#f8fbff;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#475569}
    table{width:100%;border-collapse:separate;border-spacing:0}
    th{padding:12px 14px;font-size:10.5px;letter-spacing:1px;text-transform:uppercase;color:#64748b;text-align:left;background:#f8fafc;border-bottom:1px solid #e2e8f0}
    td{padding:13px 14px;border-bottom:1px solid #eef2f7;font-size:12.5px;color:#1e293b}
    tbody tr:nth-child(odd) td{background:#fcfdff}
    tbody tr:nth-child(even) td{background:#f7fafc}
    tbody tr:last-child td{border-bottom:none}
    .idx{width:44px;color:#94a3b8;text-align:center}
    .name-main{font-weight:700;color:#0f172a}
    .name-sub{font-size:11px;color:#64748b;margin-top:3px}
    .group-cell{font-size:11.5px;color:#475569}
    .status-cell{text-align:right}
    .status-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 11px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid}
    .footer{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:end;padding:18px 42px 24px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:10.5px;color:#64748b}
    .footer-center{text-align:center}
    .footer strong{display:block;color:#334155;margin-bottom:3px}
    .page-count::after{content:counter(page)}
    .page-total::after{content:counter(pages)}
    @media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{background:#fff}.page{box-shadow:none}@page{margin:10mm;size:A4 portrait}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <div class="org-pill">Arham Yuva Seva Group</div>
      <div class="report-kicker">Executive Attendance Report</div>
      <div class="event-title">${event.name}</div>
      <div class="meta-grid">
        <div class="meta-chip">Date ${new Date(event.date).toLocaleDateString("en-IN",{weekday:"short",day:"numeric",month:"long",year:"numeric"})}</div>
        <div class="meta-chip">Time ${event.time}</div>
        ${event.venue ? `<div class="meta-chip">Venue ${event.venue}</div>` : ""}
        ${event.category ? `<div class="meta-chip">Category ${event.category}</div>` : ""}
      </div>
    </div>
    <div class="summary-wrap">
      <div class="insights">
        <div class="panel">
          <h3>Key Insights</h3>
          <div class="lead-line">${stats.pct}% attendance performance</div>
          <div class="insight-list">${highlightList.map(item => `<div class="insight-item">${item}</div>`).join("")}</div>
        </div>
        <div class="panel">
          <h3>Low Attendance Alerts</h3>
          ${lowAttendance.length ? lowAttendance.map(person => `<div class="insight-item">${person.name} - ${reportGroupForPerson(person)}</div>`).join("") : `<div class="insight-item">No low-attendance alerts in this report.</div>`}
        </div>
      </div>
      <div class="stats-row">
        <div class="stat-card"><div class="stat-label">Total Participation</div><div class="stat-value">${stats.total}</div><div class="stat-sub">Eligible people in ${groupName}</div></div>
        <div class="stat-card"><div class="stat-label">Present</div><div class="stat-value" style="color:#15803d">${statusCounts.present}</div><div class="stat-sub">On-time attendees</div></div>
        <div class="stat-card"><div class="stat-label">Late / Excused</div><div class="stat-value" style="color:#b45309">${statusCounts.late + statusCounts.excused}</div><div class="stat-sub">${statusCounts.late} late · ${statusCounts.excused} excused</div></div>
        <div class="stat-card"><div class="stat-label">Attendance Rate</div><div class="stat-value" style="color:${pctColor}">${pct}%</div><div class="stat-sub">${stats.present} engaged out of ${stats.total}</div></div>
      </div>
    </div>
    <div class="divider"></div>
    <div class="body">
      <div class="chart-grid">
        <div class="chart-box">
          <h4>Participation Summary</h4>
          <div class="bar-list">
            ${insightBars.map(([label, value, color]) => `<div class="bar-row"><span>${label}</span><div class="bar-track"><div class="bar-fill" style="width:${stats.total ? Math.round(value / stats.total * 100) : 0}%;background:${color}"></div></div><span>${value}</span></div>`).join("")}
          </div>
        </div>
        <div class="chart-box">
          <h4>Attendance Highlights</h4>
          <div class="alert-box"><strong>Report Type</strong>${groupName} attendance summary with grouped roster separation, attendance alerts, and export authentication details.</div>
        </div>
      </div>
      <div class="section">
        <div class="section-head">
          <div class="section-title">Attendance Register</div>
          <div class="section-meta">${sortBy === "name" ? "Sorted Alphabetically" : "Sorted By Status"}</div>
        </div>
        ${groupedPeople.map(section => `
        <div class="group-card">
          <div class="group-head">${section.section} · ${section.people.length} people</div>
          <table>
            <thead><tr><th style="width:44px">#</th><th>Full Name</th><th>Section</th><th style="text-align:right">Status</th></tr></thead>
            <tbody>${renderRows(section.people)}</tbody>
          </table>
        </div>`).join("")}
      </div>
    </div>
    <div class="footer">
      <div><strong>Generated</strong>${generatedAt}<br/>Exported By ${exportedBy}</div>
      <div class="footer-center"><strong>AYSG Attendance Tracker</strong>${groupName} Event Report<br/>Page <span class="page-count"></span></div>
      <div style="text-align:right"><strong>Report Type</strong>Executive Attendance PDF<br/>Page Total <span class="page-total"></span></div>
    </div>
  </div>
  </body></html>`;
}

function buildMatrixPdfHtml({ title, subtitle, colEvents, rowPeople, attendanceGetter, attendanceStatusGetter, generatedAt, exportedBy = "AYSG Admin Console" }) {
  const statusMeta = {
    present: { label: "Present", icon: "✓", color: "#15803d", bg: "#dcfce7" },
    late: { label: "Late", icon: "◔", color: "#b45309", bg: "#fef3c7" },
    excused: { label: "Excused", icon: "•", color: "#0f766e", bg: "#ccfbf1" },
    absent: { label: "Absent", icon: "✕", color: "#be123c", bg: "#ffe4e6" },
  };
  const reportGroupForPerson = (person) => {
    if (person.group === "New Joinee") return "New Joiners";
    if (/volunteer/i.test(person.role || person.notes || "")) return "Volunteers";
    return "Main Group";
  };
  const groupedPeople = ["Main Group", "New Joiners", "Volunteers"].map(section => ({
    section,
    people: rowPeople.filter(person => reportGroupForPerson(person) === section),
  })).filter(section => section.people.length > 0);
  const totalPresent = (pid) => colEvents.filter(e => attendanceGetter(e.id, pid)).length;
  const eventTotals  = colEvents.map(e => rowPeople.filter(p => attendanceGetter(e.id, p.id)).length);
  const overallPct   = rowPeople.length && colEvents.length
    ? Math.round(rowPeople.reduce((s,p) => s + totalPresent(p.id), 0) / (rowPeople.length * colEvents.length) * 100) : 0;
  const highPerformers = rowPeople.filter(p => colEvents.length && Math.round(totalPresent(p.id) / colEvents.length * 100) >= 75).length;
  const lowPerformers = rowPeople.filter(p => colEvents.length && Math.round(totalPresent(p.id) / colEvents.length * 100) < 50).length;
  const monthlyBars = colEvents.map(e => {
    const count = rowPeople.filter(p => attendanceGetter(e.id, p.id)).length;
    return [e.name, count, rowPeople.length ? Math.round(count / rowPeople.length * 100) : 0];
  });
  const eventCols = colEvents.map(e =>
    `<th class="event-col"><div class="event-name">${e.name}</div><div class="event-date">${new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div></th>`
  ).join("");
  const renderStatusCell = (eventId, personId) => {
    const status = attendanceStatusGetter(eventId, personId);
    const meta = statusMeta[status];
    return `<td class="status-td" style="background:${meta.bg};color:${meta.color}">${meta.icon}</td>`;
  };
  const renderRows = (people) => people.map((p, i) => {
    const cnt  = totalPresent(p.id);
    const pct  = colEvents.length ? Math.round(cnt / colEvents.length * 100) : 0;
    const pctColor = pct >= 75 ? "#166534" : pct >= 50 ? "#854d0e" : "#991b1b";
    const pctBg    = pct >= 75 ? "#dcfce7" : pct >= 50 ? "#fef3c7" : "#fee2e2";
    const cells = colEvents.map(e => renderStatusCell(e.id, p.id)).join("");
    return `<tr>
      <td class="idx">${i + 1}</td>
      <td class="name-cell"><div class="name-main">${p.name}</div><div class="name-sub">${p.role || reportGroupForPerson(p)}</div></td>
      ${cells}
      <td class="count-cell">${cnt}/${colEvents.length}</td>
      <td class="rate-cell"><span class="rate-pill" style="color:${pctColor};background:${pctBg}">${pct}%</span></td>
    </tr>`;
  }).join("");
  const totalRow = colEvents.map((e, i) => {
    const cnt = eventTotals[i];
    const p = rowPeople.length ? Math.round(cnt / rowPeople.length * 100) : 0;
    return `<td class="totals-cell">${cnt}<span>${p}%</span></td>`;
  }).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',system-ui,Arial,sans-serif;background:#edf2f7;color:#0f172a;padding:18px}
    .page{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 18px 46px rgba(15,23,42,0.14)}
    .header{background:linear-gradient(135deg,#10203e 0%,#1e3a5f 45%,#355f8c 100%);padding:30px 34px 24px;color:#fff}
    .org-pill{display:inline-block;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:999px;padding:4px 13px;font-size:9.5px;font-weight:800;letter-spacing:1.7px;text-transform:uppercase;color:#dbeafe;margin-bottom:12px}
    .title{font-size:24px;font-weight:800;letter-spacing:-0.3px;margin-bottom:7px}
    .subtitle{font-size:11px;color:#dbeafe}
    .summary{padding:22px 34px 0}
    .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:18px}
    .kpi{border:1px solid #e2e8f0;border-radius:18px;padding:16px 16px 14px;background:#fbfdff}
    .kpi-v{font-size:24px;font-weight:800;margin-bottom:4px}
    .kpi-l{font-size:10.5px;text-transform:uppercase;letter-spacing:1px;color:#64748b;font-weight:700}
    .insights{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px}
    .panel{border:1px solid #e2e8f0;border-radius:18px;background:#fff;padding:16px}
    .panel h4{font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#64748b;margin-bottom:12px}
    .mini-bars{display:grid;gap:10px}
    .mini-bar{display:grid;grid-template-columns:86px 1fr 40px;gap:10px;align-items:center;font-size:12px}
    .track{height:10px;border-radius:999px;background:#eef2f7;overflow:hidden}
    .fill{height:100%;border-radius:999px}
    .legend{display:flex;gap:10px;flex-wrap:wrap;padding:0 34px 16px}
    .leg{display:inline-flex;align-items:center;gap:6px;padding:6px 10px;border-radius:999px;font-size:11px;font-weight:800;border:1px solid}
    .content{padding:0 34px 28px}
    .group-card{border:1px solid #e2e8f0;border-radius:18px;overflow:hidden;margin-top:16px}
    .group-head{padding:12px 16px;background:#f8fbff;border-bottom:1px solid #e2e8f0;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#475569}
    table{width:100%;border-collapse:separate;border-spacing:0}
    th{padding:10px 10px;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:#64748b;background:#f8fafc;border-bottom:1px solid #e2e8f0}
    .event-col{min-width:72px;text-align:center}
    .event-name{font-weight:700;color:#334155}
    .event-date{font-size:8.5px;color:#94a3b8;margin-top:2px}
    td{padding:11px 10px;border-bottom:1px solid #edf2f7;font-size:12px}
    tbody tr:nth-child(odd) td{background:#fcfdff}
    tbody tr:nth-child(even) td{background:#f8fafc}
    tbody tr:last-child td{border-bottom:none}
    .idx{width:40px;text-align:center;color:#94a3b8}
    .name-main{font-weight:700;color:#0f172a}
    .name-sub{font-size:10.5px;color:#64748b;margin-top:2px}
    .status-td{text-align:center;font-weight:800}
    .count-cell{text-align:center;font-weight:700;color:#334155;background:#f8fafc}
    .rate-cell{text-align:center}
    .rate-pill{display:inline-flex;padding:4px 8px;border-radius:999px;font-size:10.5px;font-weight:800}
    .totals-row td{background:#eef2ff !important}
    .totals-label{font-weight:800;color:#4338ca;text-align:right}
    .totals-cell{text-align:center;font-weight:800;color:#4338ca}
    .totals-cell span{display:block;font-size:9px;font-weight:600;opacity:0.75;margin-top:2px}
    .footer{display:grid;grid-template-columns:1fr auto 1fr;gap:16px;align-items:end;padding:18px 34px 22px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:10.5px;color:#64748b}
    .footer-center{text-align:center}
    .footer strong{display:block;color:#334155;margin-bottom:3px}
    .page-count::after{content:counter(page)}
    .page-total::after{content:counter(pages)}
    @media print{*{-webkit-print-color-adjust:exact;print-color-adjust:exact}body{background:#fff;padding:0}.page{box-shadow:none;border-radius:0}@page{size:landscape;margin:8mm}}
  </style></head><body>
  <div class="page">
    <div class="header">
      <div class="org-pill">Arham Yuva Seva Group</div>
      <div class="title">${title}</div>
      <div class="subtitle">${subtitle} · ${rowPeople.length} people · ${colEvents.length} events</div>
    </div>
    <div class="summary">
      <div class="kpis">
        <div class="kpi"><div class="kpi-v" style="color:#1d4ed8">${rowPeople.length}</div><div class="kpi-l">Participants</div></div>
        <div class="kpi"><div class="kpi-v" style="color:#0f766e">${colEvents.length}</div><div class="kpi-l">Tracked Events</div></div>
        <div class="kpi"><div class="kpi-v" style="color:${overallPct >= 75 ? "#15803d" : overallPct >= 50 ? "#b45309" : "#be123c"}">${overallPct}%</div><div class="kpi-l">Average Attendance</div></div>
        <div class="kpi"><div class="kpi-v" style="color:#7c3aed">${highPerformers}</div><div class="kpi-l">High Performers</div></div>
      </div>
      <div class="insights">
        <div class="panel">
          <h4>Monthly Trend</h4>
          <div class="mini-bars">${monthlyBars.map(([label, count, percent]) => `<div class="mini-bar"><span>${label}</span><div class="track"><div class="fill" style="width:${percent}%;background:#3b82f6"></div></div><span>${count}</span></div>`).join("")}</div>
        </div>
        <div class="panel">
          <h4>Attendance Highlights</h4>
          <div style="font-size:13px;color:#334155;display:grid;gap:8px">
            <div>${highPerformers} people are tracking at 75% or above.</div>
            <div>${lowPerformers} people are below 50% attendance and may need outreach.</div>
            <div>${groupedPeople.length} roster section${groupedPeople.length !== 1 ? "s" : ""} included for easier scanning.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="legend">
      ${Object.values(statusMeta).map(meta => `<span class="leg" style="color:${meta.color};background:${meta.bg};border-color:${meta.color}22">${meta.icon} ${meta.label}</span>`).join("")}
    </div>
    <div class="content">
      ${groupedPeople.map(section => `
      <div class="group-card">
        <div class="group-head">${section.section} · ${section.people.length} people</div>
        <table>
          <thead>
            <tr>
              <th style="width:40px;text-align:center">#</th>
              <th style="min-width:170px;text-align:left">Participant</th>
              ${eventCols}
              <th style="min-width:58px;text-align:center">Count</th>
              <th style="min-width:58px;text-align:center">Rate</th>
            </tr>
          </thead>
          <tbody>
            ${renderRows(section.people)}
            <tr class="totals-row">
              <td colspan="2" class="totals-label">Event Totals</td>
              ${totalRow}
              <td colspan="2"></td>
            </tr>
          </tbody>
        </table>
      </div>`).join("")}
    </div>
    <div class="footer">
      <div><strong>Generated</strong>${generatedAt}<br/>Exported By ${exportedBy}</div>
      <div class="footer-center"><strong>AYSG Attendance Tracker</strong>Analytical Attendance Report<br/>Page <span class="page-count"></span></div>
      <div style="text-align:right"><strong>Report Type</strong>${title}<br/>Page Total <span class="page-total"></span></div>
    </div>
  </div>
  </body></html>`;
}

// ─── Reports view ──────────────────────────────────────────────────────────
function Reports({ members, newJoinees, events, attendance, newJoineeAttendance, getEventStats, showToast }) {
  const [tab, setTab]             = useState("single");
  const [selEvent, setSelEvent]   = useState(events[0]?.id || "");
  const [selMonth, setSelMonth]   = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd,   setRangeEnd]   = useState("");
  const [showGroup,  setShowGroup]  = useState("all");
  const [sortBy,     setSortBy]     = useState("status"); // "status" | "name"
  const [showAbsent, setShowAbsent] = useState(true);

  const active        = members.filter(m => m.active).map(m => ({ ...m, group: "Member", role: m.role || "Member" }));
  const activeJoinees = newJoinees.filter(j => j.active).map(j => ({ ...j, group: "New Joinee", role: "New Joiner" }));
  const allPeople     = showGroup === "members" ? active : showGroup === "joinees" ? activeJoinees : [...active, ...activeJoinees];
  const peopleForGroup = (group = showGroup) => (
    group === "members" ? active : group === "joinees" ? activeJoinees : [...active, ...activeJoinees]
  );
  const groupLabel = (group = showGroup) => (
    group === "members" ? "Main Group" : group === "joinees" ? "New Joinees" : "All People"
  );

  const attendanceGetter = (eventId, personId) => {
    const isJ = personId.startsWith("N");
    return isAttendedStatus((isJ ? newJoineeAttendance[eventId] : attendance[eventId])?.[personId]);
  };
  const attendanceStatusGetter = (eventId, personId) => {
    const isJ = personId.startsWith("N");
    return normalizeAttendanceStatus((isJ ? newJoineeAttendance[eventId] : attendance[eventId])?.[personId]);
  };

  const eventsInMonth = events.filter(e => e.date.startsWith(selMonth));
  const eventsInRange = events.filter(e => rangeStart && rangeEnd && e.date >= rangeStart && e.date <= rangeEnd);

  const event       = events.find(e => e.id === selEvent);
  const rec         = attendance[selEvent] || {};
  const newRec      = newJoineeAttendance[selEvent] || {};
  const isPresent   = (p) => p.group === "New Joinee" ? isAttendedStatus(newRec[p.id]) : isAttendedStatus(rec[p.id]);

  const sortedPeople = [...allPeople].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return isPresent(b) - isPresent(a);
  });
  const presentList = sortedPeople.filter(isPresent);
  const absentList  = sortedPeople.filter(p => !isPresent(p));
  const stats       = selEvent ? getEventStats(selEvent) : null;
  const monthOptions = [...new Set(events.map(e => e.date.slice(0,7)))].sort().reverse();
  const statsForPeople = (people, eventId) => {
    const counts = people.reduce((acc, person) => {
      const status = attendanceStatusGetter(eventId, person.id);
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { present: 0, absent: 0, late: 0, excused: 0 });
    const present = counts.present + counts.late;
    const total = people.length;
    return { total, present, absent: total - present, late: counts.late, excused: counts.excused, pct: total ? Math.round(present / total * 100) : 0 };
  };

  const openPrint = (html) => {
    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
    showToast("Opened in new tab — use Print → Save as PDF", "success");
  };

  const printSingle = (group = showGroup) => {
    if (!event) return showToast("Select an event first", "error");
    const people = peopleForGroup(group);
    if (!people.length) return showToast(`No active people in ${groupLabel(group)}`, "error");
    openPrint(buildSingleEventPdfHtml({
      event,
      allPeople: people,
      attendanceGetter,
      attendanceStatusGetter,
      stats: statsForPeople(people, event.id),
      sortBy,
      groupName: groupLabel(group),
      generatedAt: new Date().toLocaleString("en-IN"),
    }));
  };
  const printMonthly = (group = showGroup) => {
    if (!eventsInMonth.length) return showToast("No events in that month", "error");
    const people = peopleForGroup(group);
    if (!people.length) return showToast(`No active people in ${groupLabel(group)}`, "error");
    const [yr, mo] = selMonth.split("-");
    const label = new Date(yr, mo-1).toLocaleDateString("en-IN",{month:"long",year:"numeric"});
    const groupName = groupLabel(group);
    openPrint(buildMatrixPdfHtml({ title:`${groupName} Monthly Attendance - ${label}`, subtitle: `${groupName} - ${label}`,
      colEvents:[...eventsInMonth].sort((a,b)=>a.date.localeCompare(b.date)),
      rowPeople:people, attendanceGetter, attendanceStatusGetter, generatedAt:new Date().toLocaleString("en-IN") }));
  };
  const printRange = (group = showGroup) => {
    if (!rangeStart||!rangeEnd) return showToast("Set both start and end dates","error");
    if (!eventsInRange.length) return showToast("No events in that range","error");
    const people = peopleForGroup(group);
    if (!people.length) return showToast(`No active people in ${groupLabel(group)}`, "error");
    const groupName = groupLabel(group);
    openPrint(buildMatrixPdfHtml({ title:`${groupName} Custom Range Report`,
      subtitle:`${groupName} - ${fmtDate(rangeStart)} to ${fmtDate(rangeEnd)}`,
      colEvents:[...eventsInRange].sort((a,b)=>a.date.localeCompare(b.date)),
      rowPeople:people, attendanceGetter, attendanceStatusGetter, generatedAt:new Date().toLocaleString("en-IN") }));
  };

  const tabBtn = (t, label) => (
    <button onClick={() => setTab(t)} style={{
      padding:"9px 20px", borderRadius:10, fontSize:13.5, fontWeight:500, cursor:"pointer",
      border:"1px solid", transition:"all 0.2s",
      background: tab===t ? "linear-gradient(135deg,#5b46f5,#7c6af8)" : "var(--bg3)",
      borderColor: tab===t ? "transparent" : "var(--border)",
      color: tab===t ? "#fff" : "var(--text2)",
      boxShadow: tab===t ? "0 4px 15px rgba(124,106,248,0.3)" : "none",
    }}>{label}</button>
  );

  const pctColor = (p) => p>=75?"var(--emerald)":p>=50?"var(--gold)":"var(--rose)";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="color-muted text-sm" style={{marginTop:4}}>Professional attendance reports & PDF export</p>
        </div>
      </div>

      {/* ── tabs + global filters ── */}
      <div className="flex gap-3 mb-4 wrap items-center">
        {tabBtn("single","📋 Single Event")}
        {tabBtn("monthly","📆 Full Month")}
        {tabBtn("range","📅 Custom Range")}
        <div style={{marginLeft:"auto",display:"flex",gap:10}}>
          <select className="input" style={{width:155}} value={showGroup} onChange={e=>setShowGroup(e.target.value)}>
            <option value="all">All People</option>
            <option value="members">Main Group only</option>
            <option value="joinees">New Joinees only</option>
          </select>
          <select className="input" style={{width:145}} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
            <option value="status">Sort: Status first</option>
            <option value="name">Sort: A–Z Name</option>
          </select>
        </div>
      </div>

      {/* ══════════════ SINGLE EVENT ══════════════ */}
      {tab==="single" && (
        <>
          {/* controls */}
          <div className="card mb-4">
            <div className="flex gap-4 items-end wrap">
              <div style={{flex:1}}>
                <label style={{display:"block",fontSize:12.5,color:"var(--text2)",marginBottom:6}}>Select Event</label>
                <select className="input" value={selEvent} onChange={e=>setSelEvent(e.target.value)}>
                  <option value="">-- Choose Event --</option>
                  {[...events].sort((a,b)=>new Date(b.date)-new Date(a.date)).map(e=>(
                    <option key={e.id} value={e.id}>{e.name} ({fmtDate(e.date)})</option>
                  ))}
                </select>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--text2)",cursor:"pointer",userSelect:"none"}}>
                <input type="checkbox" checked={showAbsent} onChange={e=>setShowAbsent(e.target.checked)} style={{accentColor:"var(--accent)",width:15,height:15}} />
                Show absent
              </label>
              <button className="btn btn-primary" onClick={() => printSingle()} disabled={!selEvent} style={{gap:8}}>
                🖨️ Export PDF
              </button>
              <button className="btn" onClick={() => printSingle("members")} disabled={!selEvent} style={{gap:8}}>
                Main Group PDF
              </button>
              <button className="btn" onClick={() => printSingle("joinees")} disabled={!selEvent} style={{gap:8}}>
                New Joinees PDF
              </button>
            </div>
          </div>

          {event && stats && (
            <>
              {/* banner */}
              <div style={{background:"linear-gradient(135deg,#1e1b4b,#3730a3,#4f46e5)",borderRadius:14,padding:"22px 24px",marginBottom:16,color:"#fff",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:-30,right:-20,width:120,height:120,borderRadius:"50%",background:"rgba(255,255,255,0.04)"}}/>
                <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#a5b4fc",marginBottom:6,fontWeight:700}}>Arham Yuva Seva Group</div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,fontWeight:800,marginBottom:8}}>{event.name}</div>
                <div style={{display:"flex",gap:16,fontSize:12,color:"#c7d2fe",flexWrap:"wrap"}}>
                  <span>📅 {fmtDate(event.date)}</span>
                  <span>🕐 {event.time}</span>
                  {event.venue&&<span>📍 {event.venue}</span>}
                  {event.category&&<span>🏷 {event.category}</span>}
                </div>
              </div>

              {/* 4 stat tiles */}
              <div className="grid-4 mb-4">
                {[
                  {label:"Total",     value:stats.total,              color:"#6366f1", bg:"rgba(99,102,241,0.1)"},
                  {label:"Present",   value:stats.present,            color:"var(--emerald)", bg:"rgba(16,212,126,0.1)"},
                  {label:"Absent",    value:stats.absent,             color:"var(--rose)",    bg:"rgba(244,63,94,0.1)"},
                  {label:"Attendance",value:stats.pct+"%",            color:pctColor(stats.pct), bg:"rgba(124,106,248,0.08)"},
                ].map(s=>(
                  <div key={s.label} style={{background:s.bg,border:`1px solid ${s.color}22`,borderRadius:12,padding:"16px",textAlign:"center"}}>
                    <div style={{fontSize:26,fontWeight:800,fontFamily:"'Syne',sans-serif",color:s.color}}>{s.value}</div>
                    <div style={{fontSize:11,color:"var(--text2)",marginTop:4,textTransform:"uppercase",letterSpacing:0.8,fontWeight:600}}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* attendance bar */}
              <div className="card mb-4" style={{padding:"14px 18px"}}>
                <div className="flex items-center gap-3">
                  <span style={{fontSize:12.5,color:"var(--text2)",minWidth:70}}>Attendance</span>
                  <div style={{flex:1,height:10,borderRadius:5,background:"var(--bg4)",overflow:"hidden"}}>
                    <div style={{height:"100%",width:stats.pct+"%",borderRadius:5,background:`linear-gradient(90deg,${pctColor(stats.pct)},${pctColor(stats.pct)}aa)`,transition:"width 0.5s"}}/>
                  </div>
                  <span style={{fontWeight:700,fontSize:14,color:pctColor(stats.pct),minWidth:40,textAlign:"right"}}>{stats.pct}%</span>
                </div>
              </div>

              {/* present list */}
              {presentList.length > 0 && (
                <div className="card mb-4" style={{padding:0,overflow:"hidden",borderColor:"rgba(16,212,126,0.2)"}}>
                  <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"var(--emerald)"}}/>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"var(--emerald)"}}>Present</span>
                    <span style={{fontSize:12,color:"var(--text2)"}}>{presentList.length} member{presentList.length!==1?"s":""}</span>
                    <span style={{marginLeft:"auto",fontSize:12,color:"var(--text2)"}}>Sorted: {sortBy==="name"?"A–Z":"Status"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:"var(--border)"}}>
                    {presentList.map((p,i)=>(
                      <div key={p.id} style={{background:"var(--bg2)",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,color:"var(--text3)",minWidth:22,textAlign:"right"}}>{i+1}</span>
                        <Avatar name={p.name} size={30} color="#10d47e"/>
                        <span style={{fontSize:13,fontWeight:600,flex:1}}>{p.name}</span>
                        <span style={{fontSize:16}}>✅</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* absent list */}
              {showAbsent && absentList.length > 0 && (
                <div className="card" style={{padding:0,overflow:"hidden",borderColor:"rgba(244,63,94,0.2)"}}>
                  <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:"var(--rose)"}}/>
                    <span style={{fontFamily:"'Syne',sans-serif",fontSize:14,fontWeight:700,color:"var(--rose)"}}>Absent</span>
                    <span style={{fontSize:12,color:"var(--text2)"}}>{absentList.length} member{absentList.length!==1?"s":""}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:1,background:"var(--border)"}}>
                    {absentList.map((p,i)=>(
                      <div key={p.id} style={{background:"var(--bg2)",padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                        <span style={{fontSize:11,color:"var(--text3)",minWidth:22,textAlign:"right"}}>{i+1}</span>
                        <Avatar name={p.name} size={30} color="#f43f5e"/>
                        <span style={{fontSize:13,fontWeight:600,flex:1}}>{p.name}</span>
                        <span style={{fontSize:16}}>❌</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════ FULL MONTH ══════════════ */}
      {tab==="monthly" && (
        <>
          <div className="card mb-4">
            <div className="flex gap-4 items-end wrap">
              <div>
                <label style={{display:"block",fontSize:12.5,color:"var(--text2)",marginBottom:6}}>Select Month</label>
                {monthOptions.length > 0
                  ? <select className="input" style={{width:210}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}>
                      {monthOptions.map(m=>{
                        const [yr,mo]=m.split("-");
                        const lbl=new Date(yr,mo-1).toLocaleDateString("en-IN",{month:"long",year:"numeric"});
                        const cnt=events.filter(e=>e.date.startsWith(m)).length;
                        return <option key={m} value={m}>{lbl} ({cnt} event{cnt!==1?"s":""})</option>;
                      })}
                    </select>
                  : <input className="input" type="month" style={{width:210}} value={selMonth} onChange={e=>setSelMonth(e.target.value)}/>
                }
              </div>
              <div style={{flex:1}}/>
              <button className="btn btn-primary" onClick={() => printMonthly()} disabled={!eventsInMonth.length}>
                🖨️ Export Month PDF ({eventsInMonth.length} event{eventsInMonth.length!==1?"s":""})
              </button>
              <button className="btn" onClick={() => printMonthly("members")} disabled={!eventsInMonth.length}>
                Main Group PDF
              </button>
              <button className="btn" onClick={() => printMonthly("joinees")} disabled={!eventsInMonth.length}>
                New Joinees PDF
              </button>
            </div>
          </div>

          {/* month quick-stats */}
          {eventsInMonth.length > 0 && (() => {
            const avgPct = allPeople.length
              ? Math.round(allPeople.reduce((s,p)=>s+eventsInMonth.filter(e=>attendanceGetter(e.id,p.id)).length,0)
                / (allPeople.length * eventsInMonth.length) * 100) : 0;
            return (
              <div className="grid-4 mb-4">
                {[
                  {label:"Events",      value:eventsInMonth.length,  color:"#6366f1"},
                  {label:"Members",     value:allPeople.length,       color:"var(--cyan)"},
                  {label:"Avg Attend.", value:avgPct+"%",              color:pctColor(avgPct)},
                  {label:"High (≥75%)", value:allPeople.filter(p=>{
                    const c=eventsInMonth.filter(e=>attendanceGetter(e.id,p.id)).length;
                    return eventsInMonth.length&&Math.round(c/eventsInMonth.length*100)>=75;
                  }).length, color:"var(--emerald)"},
                ].map(s=>(
                  <div key={s.label} className="stat-card">
                    <div className="stat-label">{s.label}</div>
                    <div className="stat-value" style={{color:s.color,fontSize:24}}>{s.value}</div>
                  </div>
                ))}
              </div>
            );
          })()}

          <div className="card" style={{padding:0,overflow:"hidden"}}>
            <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>
              {selMonth ? new Date(selMonth+"-01").toLocaleDateString("en-IN",{month:"long",year:"numeric"}) : ""}
              <span style={{fontSize:12,fontWeight:400,color:"var(--text2)",marginLeft:10}}>{eventsInMonth.length} events · {allPeople.length} people</span>
            </div>
            {eventsInMonth.length===0
              ? <EmptyState icon="📅" msg="No events this month"/>
              : <div style={{overflowX:"auto"}}><table className="table" style={{minWidth:eventsInMonth.length*90+260}}>
                  <thead><tr>
                    <th style={{minWidth:34}}>#</th>
                    <th style={{minWidth:160}}>Name</th>
                    {[...eventsInMonth].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>(
                      <th key={e.id} style={{minWidth:80,textAlign:"center",fontSize:11}}>
                        <div style={{fontWeight:700}}>{e.name}</div>
                        <div style={{fontWeight:400,opacity:0.6,fontSize:10}}>{new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
                      </th>
                    ))}
                    <th style={{minWidth:60,textAlign:"center"}}>Count</th>
                    <th style={{minWidth:55,textAlign:"center"}}>%</th>
                  </tr></thead>
                  <tbody>{allPeople.map((p,i)=>{
                    const cnt=eventsInMonth.filter(e=>attendanceGetter(e.id,p.id)).length;
                    const pct=eventsInMonth.length?Math.round(cnt/eventsInMonth.length*100):0;
                    return (<tr key={p.id}>
                      <td style={{color:"var(--text2)",fontSize:12}}>{i+1}</td>
                      <td><div className="flex items-center gap-2"><Avatar name={p.name} size={26}/><span style={{fontSize:13,fontWeight:600}}>{p.name}</span></div></td>
                      {[...eventsInMonth].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                        const ok=attendanceGetter(e.id,p.id);
                        return <td key={e.id} style={{textAlign:"center"}}>
                          <span className={`tag ${ok?"tag-present":"tag-absent"}`} style={{padding:"2px 8px",fontSize:11}}>{ok?"Yes":"No"}</span>
                        </td>;
                      })}
                      <td style={{textAlign:"center",fontWeight:700,fontSize:13}}>{cnt}/{eventsInMonth.length}</td>
                      <td style={{textAlign:"center",fontWeight:700,fontSize:13,color:pctColor(pct)}}>{pct}%</td>
                    </tr>);
                  })}</tbody>
                </table></div>
            }
          </div>
        </>
      )}

      {/* ══════════════ CUSTOM RANGE ══════════════ */}
      {tab==="range" && (
        <>
          <div className="card mb-4">
            <div className="flex gap-4 items-end wrap">
              <div>
                <label style={{display:"block",fontSize:12.5,color:"var(--text2)",marginBottom:6}}>Start Date</label>
                <input className="input" type="date" style={{width:175}} value={rangeStart} onChange={e=>setRangeStart(e.target.value)}/>
              </div>
              <div>
                <label style={{display:"block",fontSize:12.5,color:"var(--text2)",marginBottom:6}}>End Date</label>
                <input className="input" type="date" style={{width:175}} value={rangeEnd} onChange={e=>setRangeEnd(e.target.value)}/>
              </div>
              <div style={{flex:1}}/>
              <button className="btn btn-primary" onClick={() => printRange()} disabled={!rangeStart||!rangeEnd||!eventsInRange.length}>
                🖨️ Export Range PDF ({eventsInRange.length} event{eventsInRange.length!==1?"s":""})
              </button>
              <button className="btn" onClick={() => printRange("members")} disabled={!rangeStart||!rangeEnd||!eventsInRange.length}>
                Main Group PDF
              </button>
              <button className="btn" onClick={() => printRange("joinees")} disabled={!rangeStart||!rangeEnd||!eventsInRange.length}>
                New Joinees PDF
              </button>
            </div>
            {rangeStart&&rangeEnd&&eventsInRange.length===0&&(
              <p style={{color:"var(--gold)",fontSize:12.5,marginTop:12}}>⚠️ No events found between {fmtDate(rangeStart)} and {fmtDate(rangeEnd)}.</p>
            )}
          </div>

          {eventsInRange.length > 0 && (
            <div className="card" style={{padding:0,overflow:"hidden"}}>
              <div style={{padding:"14px 20px",borderBottom:"1px solid var(--border)",fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>
                {fmtDate(rangeStart)} → {fmtDate(rangeEnd)}
                <span style={{fontSize:12,fontWeight:400,color:"var(--text2)",marginLeft:10}}>{eventsInRange.length} events · {allPeople.length} people</span>
              </div>
              <div style={{overflowX:"auto"}}><table className="table" style={{minWidth:eventsInRange.length*90+260}}>
                <thead><tr>
                  <th style={{minWidth:34}}>#</th>
                  <th style={{minWidth:160}}>Name</th>
                  {[...eventsInRange].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>(
                    <th key={e.id} style={{minWidth:80,textAlign:"center",fontSize:11}}>
                      <div style={{fontWeight:700}}>{e.name}</div>
                      <div style={{fontWeight:400,opacity:0.6,fontSize:10}}>{new Date(e.date).toLocaleDateString("en-IN",{day:"2-digit",month:"short"})}</div>
                    </th>
                  ))}
                  <th style={{minWidth:60,textAlign:"center"}}>Count</th>
                  <th style={{minWidth:55,textAlign:"center"}}>%</th>
                </tr></thead>
                <tbody>{allPeople.map((p,i)=>{
                  const cnt=eventsInRange.filter(e=>attendanceGetter(e.id,p.id)).length;
                  const pct=eventsInRange.length?Math.round(cnt/eventsInRange.length*100):0;
                  return (<tr key={p.id}>
                    <td style={{color:"var(--text2)",fontSize:12}}>{i+1}</td>
                    <td><div className="flex items-center gap-2"><Avatar name={p.name} size={26}/><span style={{fontSize:13,fontWeight:600}}>{p.name}</span></div></td>
                    {[...eventsInRange].sort((a,b)=>a.date.localeCompare(b.date)).map(e=>{
                      const ok=attendanceGetter(e.id,p.id);
                      return <td key={e.id} style={{textAlign:"center"}}>
                        <span className={`tag ${ok?"tag-present":"tag-absent"}`} style={{padding:"2px 8px",fontSize:11}}>{ok?"Yes":"No"}</span>
                      </td>;
                    })}
                    <td style={{textAlign:"center",fontWeight:700,fontSize:13}}>{cnt}/{eventsInRange.length}</td>
                    <td style={{textAlign:"center",fontWeight:700,fontSize:13,color:pctColor(pct)}}>{pct}%</td>
                  </tr>);
                })}</tbody>
              </table></div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Avatar({ name, size = 34, color }) {
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const colors = ["#7c6af8", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#06b6d4"];
  const bg = color || colors[name.charCodeAt(0) % colors.length];
  return (
    <div className="avatar" style={{ width: size, height: size, borderRadius: Math.round(size * 0.28), background: bg + "33", border: `1px solid ${bg}44`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, color: bg, flexShrink: 0 }}>{initials}</div>
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
