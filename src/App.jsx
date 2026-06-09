import React, { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { doc, onSnapshot, serverTimestamp, setDoc, collection, addDoc, query, where, deleteDoc } from "firebase/firestore";
import { QRCodeCanvas } from "qrcode.react";
import readXlsxFile from "read-excel-file/browser";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, CalendarDays, ClipboardCheck, LayoutDashboard, Settings, 
  LogOut, Plus, Edit2, Trash2, Search, Filter, Download, 
  MapPin, Clock, Phone, AlertCircle, CheckCircle2, ChevronDown, Activity, UserPlus
} from "lucide-react";
import { auth, db, googleProvider } from "./firebase";

const AnimatedModal = ({ isOpen, onClose, children, style, className = "modal", maxWidth }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        transition={{ duration: 0.2 }}
        className="modal-bg"
        onClick={e => e.target === e.currentTarget && onClose && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={className}
          style={{ ...style, maxWidth }}
          onClick={e => e.stopPropagation()}
        >
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const ALLOWED_ADMIN_NAMES = new Set(["moksh", "moksh shah", "dheer sheth"]);
const FIRESTORE_STATE_COLLECTION = "appState";
const DATA_SCHEMA_VERSION = 1;
const PERSISTED_DATA_KEYS = Object.freeze({
  members: "aysg_members",
  newJoinees: "aysg_new_joinees",
  events: "aysg_events",
  attendance: "aysg_attendance",
  newJoineeAttendance: "aysg_new_joinee_attendance",
});

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

const PHONES = {
  "Riya Ajmera": "+918104255385",
  "Apurva bhai": "+919833426291",
  "Chintan Barvalia": "+919820609632",
  "Dev Patel": "+919920332180",
  "Diya Didi": "+918928286825",
  "Frreya Shah": "+919820265324",
  "Hetvi Sanghvi": "+919323215685",
  "Jinen Doshi": "+918981275316",
  "Khushi Bhayani": "+918976640959",
  "Mansi Sanghvi": "+919323879883",
  "Neeti Gosalia": "+917678023366",
  "Moksh": "+919324355399",
  "Priti Sharma": "+918425071588",
  "Sidhharth Shah": "+919638498189",
  "Umang Bhai": "+919004075096",
  "Vanshi Kamdar": "+917045521484",
  "Yashvir Chheda": "+919321810421",
  "Bhavik Shah": "+919372643473",
  "Darshit Shah": "+919930340334",
  "Akshat Jain": "+919167470108",
  "Vineet Parekh": "+919819645740",
  "Jainam Jobalia": "+918655607007",
  "Ravi Shah": "+918097550876",
  "Anmol Shah": "+918128765341",
  "Ashish Charla": "+919664891245",
  "Dev Savla": "+918779383195",
  "Shubh Sanghrajka": "+919076263792",
  "Yasha Chheda": "+919594068799",
  "Tirth Desai": "+918855810851",
  "Vama Shah": "+917021355055",
  "Krisha Shah": "+919757400070",
  "Devanishi": "+919869734953",
  "Dharmi Sanghvi": "+919867769425",
  "Kinjal Gangar": "+919653306379",
  "Meeta Mehta": "+919833474368",
  "Mayuri": "+919167535269",
  "Priyal Chabhadia": "+917977809821",
  "Yashvi Chheda": "+919702282220",
  "Siddhi Doshi": "+919892602910",
  "Chintan Gada": "+919167109016",
  "Preesha Kothari": "+919326472423",
  "Megh Doshi": "+917718956651",
  "Disha Mehta": "+919321205959",
  "Henal Parekh": "+919004922896",
  "Maitri Sawla": "+918976237368",
  "Riya Shah": "+919920572160",
  "Miheet Bhai": "+919156703032",
  "Heet Bhai": "+917977233413",
  "Vishwa Shah": "+919819987365",
  "Vishva Sheth": "+919372514406",
  "Krish Talsania": "+917400392487",
  "Vaibhavee Turakhia": "+919137510449"
};

const INITIAL_MEMBERS = MEMBER_NAMES.map((name, index) => ({
  id: `M${String(index + 1).padStart(3, "0")}`,
  name,
  mobile: PHONES[name] || "",
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
  mobile: PHONES[name] || "",
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
const passthrough = value => value;

function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function stateDoc(key) {
  return doc(db, FIRESTORE_STATE_COLLECTION, key);
}

function normalizeName(name) {
  return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function isAllowedAdminUser(user) {
  if (!user) return false;
  if (user.email && user.email.toLowerCase() === "moksh230305@gmail.com") return true;
  return ALLOWED_ADMIN_NAMES.has(normalizeName(user.displayName));
}

function isDemoMemberList(members) {
  if (!Array.isArray(members) || members.length !== DEMO_MEMBER_NAMES.length) return false;
  const demoNames = new Set(DEMO_MEMBER_NAMES.map(normalizeName));
  return members.every(member => demoNames.has(normalizeName(member.name)));
}


function migrateMembers(value) {
  if (!Array.isArray(value)) return INITIAL_MEMBERS;
  if (value.length === 0 || isDemoMemberList(value)) return INITIAL_MEMBERS;
  
  const usedIds = new Set();
  const dedupedBase = [];
  let changed = false;
  
  for (const member of value) {
    let m = { ...member };
    // Inject phone number if it exists in our mapping and is currently empty
    if (!m.mobile && PHONES[m.name]) {
      m.mobile = PHONES[m.name];
      changed = true;
    }
    
    if (!m.id || usedIds.has(m.id)) {
      const newId = genId("M");
      usedIds.add(newId);
      dedupedBase.push({ ...m, id: newId });
      changed = true;
    } else {
      usedIds.add(m.id);
      dedupedBase.push(m);
    }
  }

  return changed ? dedupedBase : value;
}

function migrateNewJoinees(value) {
  if (!Array.isArray(value)) return INITIAL_NEW_JOINEES;
  const usedIds = new Set();
  let changed = false;
  const deduped = value.map(joinee => {
    let j = { ...joinee };
    // Inject phone number if it exists in our mapping and is currently empty
    if (!j.mobile && PHONES[j.name]) {
      j.mobile = PHONES[j.name];
      changed = true;
    }

    if (!j.id || usedIds.has(j.id)) {
      changed = true;
      const newId = genId("N");
      usedIds.add(newId);
      return { ...j, id: newId };
    }
    usedIds.add(j.id);
    return j;
  });
  return changed ? deduped : value;
}

function migrateAttendance(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return INITIAL_ATTENDANCE;
  return JSON.stringify(value) === JSON.stringify(DEMO_ATTENDANCE) ? INITIAL_ATTENDANCE : value;
}

function useSyncedStorage(key, initial, migrate = passthrough) {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return migrate(s ? JSON.parse(s) : initial);
    } catch {
      return migrate(initial);
    }
  });
  const remoteReady = useRef(false);
  const localCache = useRef(val);
  const skipNextRemoteSave = useRef(false);

  useEffect(() => {
    localCache.current = val;
  }, [val]);

  useEffect(() => {
    const ref = stateDoc(key);
    const unsubscribe = onSnapshot(
      ref,
      snapshot => {
        if (snapshot.exists()) {
          const remoteData = snapshot.data();
          const remoteValue = migrate(remoteData.value);
          const shouldPersistMigration = JSON.stringify(remoteValue) !== JSON.stringify(remoteData.value);
          remoteReady.current = true;
          skipNextRemoteSave.current = !shouldPersistMigration;
          setVal(remoteValue);
          try {
            localStorage.setItem(key, JSON.stringify(remoteValue));
          } catch {
            // localStorage can be unavailable in private or restricted browser contexts.
          }
          return;
        }

        const seedValue = migrate(localCache.current ?? initial);
        remoteReady.current = true;
        setDoc(ref, {
          value: seedValue,
          schemaVersion: DATA_SCHEMA_VERSION,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true }).catch(error => {
          console.error(`Could not seed ${key} in Firebase`, error);
        });
      },
      error => {
        remoteReady.current = true;
        console.error(`Could not sync ${key} from Firebase`, error);
      }
    );

    return unsubscribe;
  }, [key, initial, migrate]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // localStorage can be unavailable in private or restricted browser contexts.
    }
    if (!remoteReady.current) return;
    if (skipNextRemoteSave.current) {
      skipNextRemoteSave.current = false;
      return;
    }
    setDoc(stateDoc(key), {
      value: val,
      schemaVersion: DATA_SCHEMA_VERSION,
      updatedAt: serverTimestamp(),
    }, { merge: true }).catch(error => {
      console.error(`Could not save ${key} to Firebase`, error);
    });
  }, [key, val]);
  return [val, setVal];
}

function genId(prefix) { return prefix + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase(); }

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

function parseBulkNames(text) {
  return String(text || "")
    .split(/[\n,;\t]+/)
    .map(name => name.trim())
    .filter(Boolean);
}

function namesFromWorksheetRows(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  const firstRow = rows[0] || [];
  const nameHeaderIndex = firstRow.findIndex(cell => {
    const label = normalizeName(cell);
    return ["name", "full name", "member name", "names"].includes(label);
  });
  const nameColumnIndex = nameHeaderIndex >= 0 ? nameHeaderIndex : 0;
  const dataRows = nameHeaderIndex >= 0 ? rows.slice(1) : rows;
  return dataRows
    .map(row => row?.[nameColumnIndex])
    .map(name => String(name || "").trim())
    .filter(Boolean);
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}
:root{
  --bg:#09090f;--bg2:#0f0f1a;--bg3:#151525;--bg4:#1c1c30;
  --border:#ffffff12;--border2:#ffffff20;
  --accent:#7c6af8;--accent2:#a78bfa;--accent3:#5b46f5;
  --gold:#f0b429;--emerald:#10d47e;--rose:#f43f5e;--cyan:#06b6d4;
  --text:#e2e2f0;--text2:#9292b0;--text3:#5a5a7a;
  --card:rgba(255,255,255,0.03);--cardh:rgba(255,255,255,0.06);
  --glass:rgba(124,106,248,0.08);--glow:rgba(124,106,248,0.15);
}
html.light{
  --bg:#f0f2f8;--bg2:#ffffff;--bg3:#f5f6fa;--bg4:#eaecf4;
  --border:#e2e4ef;--border2:#c8cce0;
  --accent:#6254e8;--accent2:#7c6af8;--accent3:#4f3fd4;
  --gold:#d97706;--emerald:#059669;--rose:#e11d48;--cyan:#0891b2;
  --text:#0f1023;--text2:#525570;--text3:#9698b0;
  --card:rgba(0,0,0,0.02);--cardh:rgba(0,0,0,0.04);
  --glass:rgba(98,84,232,0.06);--glow:rgba(98,84,232,0.12);
}
html.light body{background:var(--bg);color:var(--text)}
html.light .sidebar::before{background:radial-gradient(ellipse at 50% 0%,rgba(98,84,232,0.06) 0%,transparent 60%)}
html.light .attendance-card{box-shadow:0 1px 4px rgba(0,0,0,0.06)}
html.light .stat-card{box-shadow:0 1px 4px rgba(0,0,0,0.06)}
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
.btn{display:inline-flex;align-items:center;gap:8px;padding:9px 18px;border-radius:10px;font-size:13.5px;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--bg3);color:var(--text);transition:all 0.2s cubic-bezier(0.25, 1, 0.5, 1);font-family:'DM Sans',sans-serif}
.btn:hover{background:var(--bg4);border-color:var(--border2);transform:translateY(-1px)}
.btn:active{transform:scale(0.96) translateY(0);opacity:0.85}
.btn-primary{background:linear-gradient(135deg,var(--accent3),var(--accent));border:none;color:#fff;box-shadow:0 4px 15px rgba(124,106,248,0.3)}
.btn-primary:hover{opacity:0.9;transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,106,248,0.4)}
.btn-primary:active{transform:scale(0.96) translateY(0);box-shadow:0 2px 8px rgba(124,106,248,0.3)}
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
@keyframes cascadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.table tbody tr, .attendance-card, .history-item { animation: cascadeIn 0.35s cubic-bezier(0.25, 1, 0.5, 1) both; }
.table tbody tr:nth-child(1), .attendance-card:nth-child(1), .history-item:nth-child(1) { animation-delay: 0.03s; }
.table tbody tr:nth-child(2), .attendance-card:nth-child(2), .history-item:nth-child(2) { animation-delay: 0.06s; }
.table tbody tr:nth-child(3), .attendance-card:nth-child(3), .history-item:nth-child(3) { animation-delay: 0.09s; }
.table tbody tr:nth-child(4), .attendance-card:nth-child(4), .history-item:nth-child(4) { animation-delay: 0.12s; }
.table tbody tr:nth-child(5), .attendance-card:nth-child(5), .history-item:nth-child(5) { animation-delay: 0.15s; }
.table tbody tr:nth-child(6), .attendance-card:nth-child(6), .history-item:nth-child(6) { animation-delay: 0.18s; }
.table tbody tr:nth-child(7), .attendance-card:nth-child(7), .history-item:nth-child(7) { animation-delay: 0.21s; }
.table tbody tr:nth-child(8), .attendance-card:nth-child(8), .history-item:nth-child(8) { animation-delay: 0.24s; }
.table tbody tr:nth-child(9), .attendance-card:nth-child(9), .history-item:nth-child(9) { animation-delay: 0.27s; }
.table tbody tr:nth-child(n+10), .attendance-card:nth-child(n+10), .history-item:nth-child(n+10) { animation-delay: 0.30s; }
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

.reports-studio { display: grid; grid-template-columns: 1fr 440px; gap: 24px; align-items: start; height: 100%; }
.report-template-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 12px; margin-bottom: 24px; }
.template-card { background: var(--bg3); border: 1px solid var(--border); border-radius: 12px; padding: 14px; cursor: pointer; transition: all 0.2s; }
.template-card:hover { border-color: var(--border2); background: var(--cardh); transform: translateY(-2px); }
.template-card.active { border-color: var(--accent); background: var(--glass); box-shadow: 0 0 0 1px var(--accent); }
.template-card-title { font-weight: 700; color: var(--text); font-size: 13px; margin-bottom: 4px; }
.template-card-desc { font-size: 11px; color: var(--text2); line-height: 1.4; }
.preview-panel { position: sticky; top: 0; background: var(--bg2); border: 1px solid var(--border2); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; height: calc(100vh - 80px); }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.preview-device { flex: 1; background: #eef2f7; border-radius: 8px; overflow: auto; display: flex; justify-content: center; padding: 20px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.2); scrollbar-width: thin; }
.preview-page { background: #fff; width: 100%; max-width: 794px; min-height: 1123px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); transform-origin: top center; transition: transform 0.2s ease; overflow: hidden; position: relative; }
.preview-page iframe { width: 100%; height: 100%; border: none; min-height: 1123px; }
.export-stepper { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; position: relative; padding: 0 10px; }
.export-stepper::before { content: ''; position: absolute; left: 20px; right: 20px; top: 12px; height: 2px; background: var(--bg4); z-index: 1; }
.step-node { position: relative; z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.step-circle { width: 24px; height: 24px; border-radius: 50%; background: var(--bg3); border: 2px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: var(--text2); transition: all 0.3s; }
.step-label { font-size: 10.5px; color: var(--text2); font-weight: 600; text-align: center; }
.step-node.active .step-circle { border-color: var(--accent); background: var(--accent); color: #fff; box-shadow: 0 0 0 4px var(--glass); animation: stepPulse 1.5s infinite; }
.step-node.active .step-label { color: var(--accent); }
.step-node.done .step-circle { border-color: var(--emerald); background: var(--emerald); color: #fff; }
.step-node.done .step-label { color: var(--emerald); }
@keyframes stepPulse { 0% { box-shadow: 0 0 0 0 rgba(124,106,248,0.4); } 70% { box-shadow: 0 0 0 6px rgba(124,106,248,0); } 100% { box-shadow: 0 0 0 0 rgba(124,106,248,0); } }
.preview-zoom-controls { display: flex; gap: 4px; background: var(--bg3); padding: 4px; border-radius: 8px; border: 1px solid var(--border); }
.preview-zoom-controls button { width: 26px; height: 26px; border: none; background: transparent; color: var(--text); border-radius: 6px; cursor: pointer; font-size: 14px; display: flex; align-items: center; justify-content: center; }
.preview-zoom-controls button:hover { background: var(--bg4); }
.option-checkbox { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--text); cursor: pointer; margin-bottom: 10px; user-select: none; }
.option-checkbox input[type="checkbox"] { width: 16px; height: 16px; accent-color: var(--accent); cursor: pointer; }
.color-swatch { width: 32px; height: 32px; border-radius: 8px; border: 1px solid var(--border2); cursor: pointer; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 0; background: transparent; }
.color-swatch input[type="color"] { width: 150%; height: 150%; border: none; cursor: pointer; padding: 0; background: transparent; margin: -25%; }
.threshold-slider { width: 100%; accent-color: var(--accent); margin-top: 8px; cursor: pointer; }
.locked-reports { text-align: center; padding: 60px 20px; max-width: 400px; margin: 40px auto; background: var(--bg3); border: 1px solid var(--border); border-radius: 20px; }
.reports-footer { padding: 16px; background: var(--bg2); border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; border-radius: 0 0 16px 16px; }
@media (max-width: 1200px) { .reports-studio { grid-template-columns: 1fr; } .preview-panel { height: 800px; } }

/* Analytics Intelligence Center CSS */
.ac-dashboard { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
.ac-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 16px; }
.col-2 { grid-column: span 2; }
.col-3 { grid-column: span 3; }
.col-4 { grid-column: span 4; }
.col-5 { grid-column: span 5; }
.col-6 { grid-column: span 6; }
.col-7 { grid-column: span 7; }
.col-8 { grid-column: span 8; }
.col-12 { grid-column: span 12; }
@media (max-width: 1200px) {
  .col-2, .col-3, .col-4 { grid-column: span 4; }
  .col-5, .col-6, .col-7, .col-8 { grid-column: span 12; }
}
@media (max-width: 800px) {
  .col-2, .col-3, .col-4 { grid-column: span 6; }
}

.ac-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 12px; padding: 16px; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.ac-card-title { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
.ac-card-subtitle { font-size: 11px; color: var(--text2); margin-top: 4px; }

/* Top Stat Cards */
.ac-stat-value { font-size: 24px; font-weight: 700; color: var(--text); display: flex; align-items: baseline; gap: 8px; }
.ac-stat-trend { font-size: 11.5px; font-weight: 600; padding: 2px 6px; border-radius: 4px; display: inline-flex; align-items: center; gap: 4px; margin-top: 8px; }
.trend-up { color: var(--emerald); background: rgba(16, 212, 126, 0.1); }
.trend-down { color: var(--rose); background: rgba(244, 63, 94, 0.1); }

/* SVG Charts */
.ac-chart-container { flex: 1; min-height: 180px; position: relative; width: 100%; display: flex; align-items: flex-end; }
.ac-bar { flex: 1; margin: 0 4px; background: var(--accent); border-radius: 4px 4px 0 0; position: relative; transition: height 0.5s ease; opacity: 0.85; cursor: pointer; }
.ac-bar:hover { opacity: 1; filter: brightness(1.2); }
.ac-bar-label { position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%); font-size: 10px; color: var(--text2); }
.ac-bar-val { position: absolute; top: -20px; left: 50%; transform: translateX(-50%); font-size: 11px; color: var(--text); font-weight: 600; opacity: 0; transition: opacity 0.2s; }
.ac-bar:hover .ac-bar-val { opacity: 1; }

/* Smart Insights */
.insight-item { display: flex; gap: 12px; padding: 12px; background: var(--bg3); border-radius: 8px; margin-bottom: 8px; align-items: flex-start; }
.insight-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; flex-shrink: 0; }
.insight-content h4 { margin: 0 0 4px 0; font-size: 12.5px; color: var(--text); }
.insight-content p { margin: 0; font-size: 11px; color: var(--text2); line-height: 1.4; }

/* Heatmap */
.heatmap-grid { display: flex; flex-direction: column; gap: 4px; width: 100%; overflow-x: auto; padding-bottom: 8px; }
.heatmap-row { display: flex; gap: 4px; align-items: center; }
.heatmap-label { width: 100px; font-size: 11px; color: var(--text2); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex-shrink: 0; }
.heatmap-cell { height: 20px; flex: 1; min-width: 40px; border-radius: 4px; cursor: pointer; transition: transform 0.1s; }
.heatmap-cell:hover { transform: scale(1.1); z-index: 10; box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

/* Needs Attention Tabs */
.ac-tabs { display: flex; gap: 8px; margin-bottom: 12px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
.ac-tab { padding: 4px 12px; border-radius: 12px; font-size: 11.5px; font-weight: 600; color: var(--text2); cursor: pointer; transition: all 0.2s; }
.ac-tab.active { background: rgba(124, 106, 248, 0.15); color: var(--accent2); }

/* Table */
.ac-table { width: 100%; border-collapse: collapse; text-align: left; }
.ac-table th { font-size: 11px; color: var(--text2); font-weight: 600; padding: 8px; border-bottom: 1px solid var(--border); }
.ac-table td { font-size: 12px; color: var(--text); padding: 10px 8px; border-bottom: 1px solid var(--border); }

/* Assistant */
.assistant-launcher{position:fixed;right:22px;bottom:22px;width:52px;height:52px;border-radius:16px;border:1px solid rgba(124,106,248,0.42);background:linear-gradient(135deg,var(--accent3),var(--accent));color:#fff;font-weight:900;box-shadow:0 12px 38px rgba(0,0,0,0.44),0 0 28px rgba(124,106,248,0.28);z-index:190;cursor:pointer}
.assistant-panel{position:fixed;right:22px;bottom:86px;width:min(390px,calc(100vw - 28px));height:min(560px,calc(100vh - 110px));background:var(--bg2);border:1px solid var(--border2);border-radius:16px;box-shadow:0 18px 60px rgba(0,0,0,0.52);z-index:190;display:flex;flex-direction:column;overflow:hidden}
.assistant-head{padding:14px 16px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;gap:10px;background:linear-gradient(180deg,rgba(124,106,248,0.12),transparent)}
.assistant-title{font-family:'Syne',sans-serif;font-weight:800;font-size:14px}
.assistant-sub{font-size:11.5px;color:var(--text2);margin-top:2px}
.assistant-close{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);cursor:pointer}
.assistant-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
.assistant-msg{max-width:88%;padding:10px 12px;border-radius:13px;font-size:12.5px;line-height:1.45;white-space:pre-wrap}
.assistant-msg.bot{align-self:flex-start;background:var(--bg3);border:1px solid var(--border);color:var(--text)}
.assistant-msg.user{align-self:flex-end;background:rgba(124,106,248,0.22);border:1px solid rgba(124,106,248,0.28);color:var(--text)}
.assistant-suggestions{display:flex;gap:7px;flex-wrap:wrap;padding:0 14px 10px}
.assistant-suggestions button{border:1px solid var(--border);background:var(--bg3);color:var(--text2);border-radius:999px;padding:6px 9px;font-size:11.5px;cursor:pointer}
.assistant-form{padding:12px;border-top:1px solid var(--border);display:flex;gap:8px}
.assistant-form input{flex:1;min-width:0}
.assistant-form button{min-width:64px;justify-content:center}
`;

const VIEWS = ["Dashboard", "Members", "New Joinees", "Events", "Attendance", "Analytics", "Reports"];
const VIEW_ICONS = { Dashboard: "D", Members: "M", "New Joinees": "N", Events: "E", Attendance: "A", Analytics: "Y", Reports: "R" };


function PublicCheckIn({ event }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState("");

  const completeSubmit = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, "pending_checkins"), {
        eventId: event.id,
        name: name.trim(),
        mobile: mobile.trim(),
        timestamp: Date.now()
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit check-in. Please try again.");
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (event.lat && event.lng) {
      setLoading(true);
      if (!navigator.geolocation) {
        setGeoError("Geolocation is not supported by your browser. Cannot verify venue lock.");
        setLoading(false);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const dist = getDistanceInMeters(event.lat, event.lng, pos.coords.latitude, pos.coords.longitude);
          if (dist > 300) {
            setGeoError(`📍 Venue Lock Active: You are ${Math.round(dist)}m away. You must be within 300m of the venue to check in.`);
            setLoading(false);
            return;
          }
          await completeSubmit();
        },
        () => {
          setGeoError("Could not get your location. Please enable location services to check in.");
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      await completeSubmit();
    }
  };

  if (submitted) {
    return (
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f9fafb", padding: 20, textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
        <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 8, color: "#111827" }}>Checked In!</h1>
        <p style={{ color: "#4b5563" }}>Your attendance for <strong>{event.name}</strong> has been submitted. The admin will verify it shortly.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", padding: 20 }}>
      <div style={{ background: "white", padding: 32, borderRadius: 16, width: "100%", maxWidth: 400, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <h1 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 4, color: "#111827" }}>Event Check-In</h1>
        <p style={{ color: "#4b5563", marginBottom: 24, fontSize: 14 }}>{event.name} • {new Date(event.date).toLocaleDateString()}</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Full Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }} placeholder="Enter your full name" />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Mobile Number (Optional)</label>
            <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }} placeholder="Enter your mobile number" />
          </div>
          {event.lat && event.lng && (
            <div style={{ background: "#eff6ff", color: "#1d4ed8", padding: "12px", borderRadius: 8, fontSize: 13, display: "flex", gap: 8 }}>
              <span>📍</span> <span>This event is geo-fenced. You must be within 300m of the venue to check in. Location access will be requested.</span>
            </div>
          )}
          {geoError && (
            <div style={{ background: "#fef2f2", color: "#b91c1c", padding: "12px", borderRadius: 8, fontSize: 13, fontWeight: 500 }}>
              {geoError}
            </div>
          )}
          <button type="submit" disabled={loading} style={{ background: "#111827", color: "white", fontWeight: 600, padding: "12px", borderRadius: 8, border: "none", cursor: loading ? "not-allowed" : "pointer", marginTop: 8, transition: "background 0.2s" }}>
            {loading ? "Verifying..." : "Submit Check-In"}
          </button>
        </form>
      </div>
    </div>
  );
}

function PendingRow({ docId, data, members, onApprove, onReject }) {
  const [matchId, setMatchId] = useState("");
  React.useEffect(() => {
    if (!matchId) {
      const m = members.find(x => x.name.toLowerCase() === data.name.toLowerCase());
      if (m && m.id !== matchId) {
        // use setTimeout to avoid set-state-in-effect warning if needed, or simply let it run
        setTimeout(() => setMatchId(m.id), 0);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members, data.name]);
  return (
    <div style={{ border: '1px solid var(--border)', padding: 12, borderRadius: 8, background: "white" }} className="flex items-center justify-between gap-4">
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14 }}>{data.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>{data.mobile || "No mobile"}</div>
      </div>
      <select value={matchId} onChange={e => setMatchId(e.target.value)} className="input" style={{ flex: 1 }}>
        <option value="">-- Match Member --</option>
        <option value="NEW_JOINEE">+ Add as New Joinee</option>
        <optgroup label="Members">
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </optgroup>
      </select>
      <div className="flex gap-2">
        <button disabled={!matchId} className="btn" style={{ padding: "6px 12px", background: "var(--emerald)", color: "white", border: "none", opacity: matchId ? 1 : 0.5 }} onClick={() => onApprove(docId, data, matchId)}>Approve</button>
        <button className="btn" style={{ padding: "6px 12px", background: "#f3f4f6", color: "var(--rose)", border: "none" }} onClick={() => onReject(docId)}>Reject</button>
      </div>
    </div>
  );
}

function PendingCheckinsModal({ eventId, members, onClose, onApprove, showToast }) {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const q = query(collection(db, "pending_checkins"), where("eventId", "==", eventId));
    const unsub = onSnapshot(q, (snap) => {
      setPending(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, [eventId]);

  const handleApprove = async (docId, pendingData, matchedMemberId) => {
    onApprove(matchedMemberId, pendingData);
    await deleteDoc(doc(db, "pending_checkins", docId));
    showToast("Check-in approved", "success");
  };

  const handleReject = async (docId) => {
    await deleteDoc(doc(db, "pending_checkins", docId));
    showToast("Check-in rejected", "info");
  };

  return (
    <AnimatedModal isOpen={true} onClose={onClose} maxWidth={600} style={{ background: '#f9fafb', padding: 32, borderRadius: 16 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Pending Scans ({pending.length})</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 24 }}>&times;</button>
      </div>
      {loading ? <p>Loading...</p> : pending.length === 0 ? <p className="color-muted">No pending check-ins for this event.</p> : (
        <div className="flex flex-col gap-3">
          {pending.map(p => <PendingRow key={p.id} docId={p.id} data={p} members={members} onApprove={handleApprove} onReject={handleReject} />)}
        </div>
      )}
    </AnimatedModal>
  );
}

function CinematicTVMode({ events, members, attendance, setView }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeEvent = [...events].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const rec = activeEvent ? (attendance[activeEvent.id] || {}) : {};
  const activeMembers = members.filter(m => m.active);
  const presentMembers = activeMembers.filter(m => normalizeAttendanceStatus(rec[m.id]) === 'present' || normalizeAttendanceStatus(rec[m.id]) === 'late');
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#000', color: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Syne', sans-serif" }}>
      <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle at center, #1a1a2e 0%, #000 100%)', zIndex: -1, animation: 'pulse 10s infinite alternate' }} />
      
      <div style={{ padding: '40px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <h1 style={{ fontSize: 48, margin: 0, fontWeight: 800, background: 'linear-gradient(90deg, #fff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AYSG Live</h1>
          <p style={{ fontSize: 24, margin: '10px 0 0 0', color: 'rgba(255,255,255,0.6)' }}>{activeEvent?.name || "No Active Event"} &bull; {activeEvent?.venue || ""}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 64, fontWeight: 800, fontFamily: 'monospace' }}>
            {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
          <button className="btn btn-outline" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff', marginTop: 10 }} onClick={() => setView('Dashboard')}>Exit TV Mode</button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', padding: '60px', gap: '60px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 10 }}>Total Check-ins</div>
            <div style={{ fontSize: 120, fontWeight: 800, lineHeight: 1, color: '#10d47e' }}>{presentMembers.length}</div>
            <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.4)', marginTop: 10 }}>out of {activeMembers.length} expected</div>
          </div>
          
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', padding: '40px', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden', position: 'relative' }}>
             <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 30 }}>Present Members</div>
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
               {presentMembers.map(m => (
                 <div key={m.id} style={{ background: 'rgba(16, 212, 126, 0.1)', border: '1px solid rgba(16, 212, 126, 0.3)', padding: '12px 24px', borderRadius: '100px', color: '#10d47e', fontSize: 20, fontWeight: 700 }}>
                   {m.name}
                 </div>
               ))}
               {presentMembers.length === 0 && <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.3)' }}>Waiting for members to arrive...</div>}
             </div>
          </div>
        </div>

        <div style={{ width: '450px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', padding: '60px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
           <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 20, textAlign: 'center' }}>Scan to Check-in</h2>
           <div style={{ background: '#fff', padding: '30px', borderRadius: '32px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
             <QRCodeCanvas value={`${window.location.origin}/?checkin=${activeEvent?.id}`} size={300} level="H" />
           </div>
           <p style={{ fontSize: 20, color: 'rgba(255,255,255,0.5)', marginTop: 40, textAlign: 'center' }}>Point your camera at the screen</p>
        </div>
      </div>
    </div>
  );
}

function MemberStar({ member, stat, position }) {
  const meshRef = useRef();
  const [hovered, setHover] = useState(false);
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.1 * (stat.pct / 100);
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  const color = stat.pct >= 75 ? "#10d47e" : stat.pct >= 50 ? "#f0b429" : "#f43f5e";
  const size = 0.5 + (stat.pct / 100) * 1.5;

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); }}
        onPointerOut={(e) => { e.stopPropagation(); setHover(false); }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={hovered ? 2 : 0.5} roughness={0.2} metalness={0.8} />
      </mesh>
      {hovered && (
        <Html distanceFactor={15}>
          <div style={{ background: 'rgba(0,0,0,0.8)', padding: '10px 15px', borderRadius: '10px', color: 'white', whiteSpace: 'nowrap', border: `1px solid ${color}`, pointerEvents: 'none', transform: 'translate3d(-50%, -150%, 0)' }}>
            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{member.name}</div>
            <div style={{ fontSize: 12, opacity: 0.8 }}>Attendance: {stat.pct}%</div>
            {stat.streak > 0 && <div style={{ fontSize: 12, color: '#f0b429' }}>🔥 {stat.streak} Streak</div>}
          </div>
        </Html>
      )}
    </group>
  );
}

function GalaxyVisualizer({ members, getMemberStats }) {
  const activeMembers = members.filter(m => m.active);
  
  const starData = activeMembers.map((m, i) => {
    const stat = getMemberStats(m.id);
    const angle = i * 0.5;
    const radius = 5 + (i * 0.3);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const y = React.useMemo(() => (Math.random() - 0.5) * 4, []);
    return { m, stat, position: [x, y, z] };
  });

  return (
    <div style={{ width: '100%', height: '500px', background: '#000', borderRadius: '24px', overflow: 'hidden', position: 'relative', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
      <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, color: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>🌌 Member Galaxy</h2>
        <p style={{ opacity: 0.6, margin: '5px 0 0 0', fontSize: 13 }}>Interactive 3D visualization. Stars represent members.</p>
      </div>
      <Canvas camera={{ position: [0, 20, 30], fov: 60 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        {starData.map(data => (
          <MemberStar key={data.m.id} member={data.m} stat={data.stat} position={data.position} />
        ))}
        <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} maxDistance={100} minDistance={10} />
      </Canvas>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState("Dashboard");
  const [attendanceEventId, setAttendanceEventId] = useState("");
  const urlParams = new URLSearchParams(window.location.search);
  const checkinEventId = urlParams.get("checkin");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("aysg_theme");
    const isDark = saved ? saved === "dark" : true;
    // Apply immediately to avoid flash of wrong theme
    if (!isDark) document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
    return isDark;
  });
  const toggleDark = () => setDarkMode(prev => {
    const next = !prev;
    localStorage.setItem("aysg_theme", next ? "dark" : "light");
    return next;
  });
  // Apply theme class to <html> so CSS variables cascade to body and all elements
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
    }
  }, [darkMode]);
  const [members, setMembers] = useSyncedStorage(PERSISTED_DATA_KEYS.members, INITIAL_MEMBERS, migrateMembers);
  const [newJoinees, setNewJoinees] = useSyncedStorage(PERSISTED_DATA_KEYS.newJoinees, INITIAL_NEW_JOINEES, migrateNewJoinees);
  const [events, setEvents] = useSyncedStorage(PERSISTED_DATA_KEYS.events, INITIAL_EVENTS);
  const [attendance, setAttendance] = useSyncedStorage(PERSISTED_DATA_KEYS.attendance, INITIAL_ATTENDANCE, migrateAttendance);
  const [newJoineeAttendance, setNewJoineeAttendance] = useSyncedStorage(PERSISTED_DATA_KEYS.newJoineeAttendance, INITIAL_ATTENDANCE);
  const [adminUser, setAdminUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [adminErr, setAdminErr] = useState("");
  const [toast, setToast] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const toastTimer = useRef();
  const isAdmin = isAllowedAdminUser(adminUser);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    return onAuthStateChanged(auth, user => {
      setAdminUser(user);
      setAuthReady(true);
      if (user && !isAllowedAdminUser(user)) {
        setAdminErr(`${user.displayName || user.email || "This account"} is not allowed to edit.`);
        signOut(auth).catch(error => console.error("Could not sign out unauthorized admin", error));
      }
    });
  }, []);

  const openAdminLogin = async () => {
    setAdminErr("");
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (isAllowedAdminUser(result.user)) {
        showToast(`Admin mode enabled for ${result.user.displayName}`, "success");
        return;
      }
      setAdminErr(`${result.user.displayName || result.user.email || "This account"} is not allowed to edit.`);
      await signOut(auth);
      showToast("Only Moksh Shah and Dheer Sheth can unlock admin mode", "error");
    } catch (error) {
      if (error?.code === "auth/popup-closed-by-user" || error?.code === "auth/cancelled-popup-request") return;
      console.error("Admin sign-in failed", error);
      setAdminErr("Google sign-in failed. Please try again.");
      showToast("Google sign-in failed", "error");
    }
  };

  const handleAdminLogout = async () => {
    await signOut(auth);
    setAdminErr("");
    showToast("Admin mode disabled");
  };

  if (checkinEventId) {
    if (events.length === 0) return <div style={{ padding: 40, textAlign: 'center' }}>Loading event details...</div>;
    const checkinEvent = events.find(e => e.id === checkinEventId);
    if (!checkinEvent) return <div style={{ padding: 40, textAlign: 'center' }}>Event Not Found</div>;
    return <><style>{css}</style><PublicCheckIn event={checkinEvent} /></>;
  }
  const getMemberStats = (memberId) => {
    let total = 0, present = 0;
    Object.values(attendance).forEach(rec => { total++; if (isAttendedStatus(rec[memberId])) present++; });
    return { total, present, pct: total ? Math.round(present / total * 100) : 0 };
  };

  const getMemberBadges = (member) => {
    const stats = getMemberStats(member.id);
    const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
    let streak = 0;
    for (const event of sortedEvents) {
      if (isAttendedStatus(attendance[event.id]?.[member.id])) streak += 1;
      else break;
    }
    const today = new Date();
    const joinedRecently = member.joinDate ? new Date(member.joinDate) >= new Date(today.setDate(today.getDate() - 60)) : false;
    
    const badges = [];
    if (streak >= 3) badges.push({ icon: "🔥", label: "On Fire", tooltip: `Attended ${streak} events in a row` });
    if (stats.pct === 100 && stats.total >= 3) badges.push({ icon: "🌟", label: "Perfect", tooltip: "100% Attendance (3+ events)" });
    if (joinedRecently && stats.pct >= 75 && stats.total >= 1) badges.push({ icon: "🚀", label: "Rising Star", tooltip: "New member with great attendance" });
    if (stats.total >= 10 && stats.pct >= 80) badges.push({ icon: "👑", label: "Veteran", tooltip: "Long-term high attendance" });
    return badges;
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
      {view === "TVMode" ? (
        <CinematicTVMode events={events} members={members} attendance={attendance} setView={setView} />
      ) : (
        <>
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
          onAdminClick={isAdmin ? handleAdminLogout : openAdminLogin}
          darkMode={darkMode}
          toggleDark={toggleDark}
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
            onAdminExit={handleAdminLogout}
            adminUser={adminUser}
            authReady={authReady}
          />
          <div className="content scroll-area">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ height: "100%", width: "100%" }}
              >
                {view === "Dashboard" && <Dashboard members={members} events={events} attendance={attendance} getEventStats={getEventStats} getMemberStats={getMemberStats} setView={setView} setAttendanceEventId={setAttendanceEventId} isAdmin={isAdmin} getMemberBadges={getMemberBadges} />}
                {view === "Members" && <Members members={members} setMembers={setMembers} newJoinees={newJoinees} setNewJoinees={setNewJoinees} events={events} attendance={attendance} getMemberStats={getMemberStats} showToast={showToast} isAdmin={isAdmin} setView={setView} getMemberBadges={getMemberBadges} />}
                {view === "New Joinees" && <NewJoinees newJoinees={newJoinees} setNewJoinees={setNewJoinees} showToast={showToast} isAdmin={isAdmin} />}
                {view === "Events" && <Events events={events} setEvents={setEvents} getEventStats={getEventStats} showToast={showToast} isAdmin={isAdmin} />}
                {view === "Attendance" && <Attendance events={events} members={members} newJoinees={newJoinees} attendance={attendance} setAttendance={setAttendance} newJoineeAttendance={newJoineeAttendance} setNewJoineeAttendance={setNewJoineeAttendance} setNewJoinees={setNewJoinees} showToast={showToast} isAdmin={isAdmin} attendanceEventId={attendanceEventId} setAttendanceEventId={setAttendanceEventId} />}
                {view === "Analytics" && <Analytics members={members} newJoinees={newJoinees} events={events} getMemberStats={getMemberStats} attendance={attendance} newJoineeAttendance={newJoineeAttendance} isAdmin={isAdmin} />}
                {view === "Reports" && <Reports members={members} newJoinees={newJoinees} events={events} attendance={attendance} newJoineeAttendance={newJoineeAttendance} getEventStats={getEventStats} showToast={showToast} isAdmin={isAdmin} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      {toast && (
        <div className="toast" style={{ borderColor: toast.type === "success" ? "rgba(16,212,126,0.3)" : toast.type === "error" ? "rgba(244,63,94,0.3)" : "var(--border2)" }}>
          {toast.type === "success" ? "✅ " : toast.type === "error" ? "❌ " : "ℹ️ "}{toast.msg}
        </div>
      )}
      {adminErr && (
        <div className="toast" style={{ bottom: 82, borderColor: "rgba(244,63,94,0.3)" }}>
          Unauthorized admin account: {adminErr}
        </div>
      )}
      <AttendanceAssistant
        members={members}
        newJoinees={newJoinees}
        events={events}
        attendance={attendance}
        newJoineeAttendance={newJoineeAttendance}
        getMemberStats={getMemberStats}
        getEventStats={getEventStats}
      />
      </>
      )}
    </>
  );
}

function Sidebar({ view, setView, members, newJoinees, events, isAdmin, collapsed, setCollapsed, onAdminClick, darkMode, toggleDark }) {
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
        <div
          className="nav-item"
          data-tip={darkMode ? "Light Mode" : "Dark Mode"}
          onClick={toggleDark}
          style={{ marginTop: 4, color: "var(--text2)", borderColor: "var(--border)" }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          <div className="nav-icon" style={{ fontSize: 16 }}>{darkMode ? "☀️" : "🌙"}</div>
          <span className="nav-label" style={{ fontSize: 13 }}>{darkMode ? "Light Mode" : "Dark Mode"}</span>
        </div>
        <div className="sb-mode-copy" style={{ marginTop: 8, fontSize: 11, color: isAdmin ? "var(--emerald)" : "var(--text3)", padding: "0 10px" }}>
          {isAdmin ? "Unlocked editing" : "Locked view-only"}
        </div>
      </div>
    </div>
  );
}

function Topbar({ view, setView, members, newJoinees, events, isAdmin, onAdminClick, onAdminExit, adminUser, authReady }) {
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
    isAdmin ? `Admin editing is enabled for ${adminUser?.displayName || "admin"}` : "View-only mode is active",
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
      {!isAdmin && <button className="btn btn-sm" onClick={onAdminClick} disabled={!authReady}>{authReady ? "Google Login" : "Checking..."}</button>}
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
            <div className="text-xs color-muted mb-3">{isAdmin ? adminUser?.displayName || "Admin profile" : "Viewer profile"}</div>
            <button className="btn btn-sm" style={{ width: "100%", justifyContent: "center" }} onClick={isAdmin ? onAdminExit : onAdminClick}>{isAdmin ? "Sign Out" : "Admin Google Login"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

function Dashboard({ members, events, attendance, getEventStats, getMemberStats, setView, setAttendanceEventId, isAdmin, getMemberBadges }) {
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
  const chartEvents = [...events].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-10);
  const lineChartData = chartEvents.map(e => {
    const stats = getEventStats(e.id);
    return { name: e.name, pct: stats.pct, present: stats.present };
  });

  const areaCounts = {};
  active.forEach(m => {
    const a = m.area || "Other";
    areaCounts[a] = (areaCounts[a] || 0) + 1;
  });
  const pieChartData = Object.entries(areaCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
  const pieColors = ["#7c6af8", "#06b6d4", "#10d47e", "#f0b429", "#ec4899", "#8b5cf6", "#3b82f6"];

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
            { label: "Live TV Mode", detail: "Cast to a projector", icon: "📺", color: "#8b5cf6", view: "TVMode" },
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
      
      {!loading && events.length > 0 && (
        <div className="grid-2 mb-6">
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title mb-4">📈 Attendance Trends (Last 10 Events)</h2>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text2)" }} tickLine={false} axisLine={{ stroke: "var(--border)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text2)" }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} itemStyle={{ color: "var(--text)" }} />
                  <Line type="monotone" dataKey="pct" name="Attendance %" stroke="#7c6af8" strokeWidth={3} dot={{ r: 4, fill: "#7c6af8" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="card" style={{ padding: 24 }}>
            <h2 className="section-title mb-4">📍 Members by Area</h2>
            <div style={{ height: 260, width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {!loading && members.length > 0 && (
         <GalaxyVisualizer members={members} getMemberStats={getMemberStats} />
      )}

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
                  <button className="btn btn-sm" onClick={() => { setAttendanceEventId(e.id); setView("Attendance"); }}>Mark</button>
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
                  <div className="flex items-center gap-1">
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                    {getMemberBadges(m).length > 0 && (
                      <div className="flex gap-1" style={{ marginLeft: 4 }}>
                        {getMemberBadges(m).map((b, i) => <span key={i} title={b.tooltip} style={{ fontSize: 12, cursor: "help" }}>{b.icon}</span>)}
                      </div>
                    )}
                  </div>
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

      <div className="grid-2" style={{ marginTop: 24 }}>
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>🎂 Birthdays This Month</h2>
          </div>
          {(() => {
            const currentMonthNum = today.getMonth();
            const birthdaysThisMonth = active.filter(m => {
              if (!m.dob) return false;
              const dob = new Date(m.dob);
              return dob.getMonth() === currentMonthNum;
            }).sort((a, b) => new Date(a.dob).getDate() - new Date(b.dob).getDate());

            return birthdaysThisMonth.length === 0 ? (
              <EmptyState icon="🎂" msg="No birthdays this month!" />
            ) : (
              birthdaysThisMonth.map(m => {
                const d = new Date(m.dob);
                const age = today.getFullYear() - d.getFullYear();
                return (
                  <div key={m.id} className="member-rank-card">
                    <div style={{ fontSize: 24, width: 40, textAlign: "center" }}>🎉</div>
                    <div className="flex-1">
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text2)", marginTop: 2 }}>
                        Turns {age} on {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    <button className="btn btn-sm btn-outline">Wish</button>
                  </div>
                );
              })
            );
          })()}
        </div>

        {/* Feature 2: Smart Reminders (Communications) */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title" style={{ margin: 0 }}>📱 Smart Reminders</h2>
          </div>
          {(() => {
            // Find members who missed the last 3 consecutive events
            if (sortedEvents.length < 3) return <EmptyState icon="📱" msg="Need at least 3 events for smart reminders." />;
            const last3Events = sortedEvents.slice(0, 3);
            const slippingMembers = active.filter(m => {
              return last3Events.every(e => !isAttendedStatus(attendance[e.id]?.[m.id]));
            }).slice(0, 5); // Show top 5 to avoid overwhelming

            return slippingMembers.length === 0 ? (
              <EmptyState icon="✅" msg="Everyone is attending well!" />
            ) : (
              <div>
                <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12 }}>These active members missed the last 3 events:</p>
                {slippingMembers.map(m => {
                  const msg = encodeURIComponent(`Hi ${m.name.split(' ')[0]}, we missed you at the last few events! Hope everything is okay. Looking forward to seeing you at the next one! 🙏`);
                  const waUrl = `https://wa.me/${m.mobile?.replace(/\D/g, '') || ''}?text=${msg}`;
                  return (
                    <div key={m.id} className="member-rank-card">
                      <Avatar name={m.name} size={32} />
                      <div className="flex-1">
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{m.name}</div>
                        <div style={{ fontSize: 11, color: "var(--rose)", marginTop: 2 }}>Missed last 3 events</div>
                      </div>
                      {m.mobile ? (
                        <a href={waUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary" style={{ background: "#25D366", borderColor: "#25D366", color: "#fff", textDecoration: "none" }}>WhatsApp</a>
                      ) : (
                        <span className="tag tag-gray">No Mobile</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function Members({ members, setMembers, newJoinees, setNewJoinees, events, attendance, getMemberStats, showToast, isAdmin, setView, getMemberBadges }) {
  const [search, setSearch] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [filterPerformance, setFilterPerformance] = useState("");
  const [filterActivity, setFilterActivity] = useState("");
  const [filterJoiner, setFilterJoiner] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMember, setEditMember] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", mobile: "", area: "", gender: "Male", role: "Member", notes: "", joinDate: "", dob: "", active: true });
  const [duplicateReport, setDuplicateReport] = useState(null);

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
    
    const badges = getMemberBadges(m);

    return { stats, history, presentHistory, lastAttended, streak, recentPct, missed, joinedRecently, inactiveByAttendance, badges };
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

  const openAdd = () => { setForm({ name: "", mobile: "", area: "", gender: "Male", role: "Member", notes: "", joinDate: new Date().toISOString().split("T")[0], dob: "", active: true }); setEditMember(null); setShowForm(true); };
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
  const deleteMember = (id) => {
    setMembers(prev => prev.filter(m => m.id !== id));
    showToast("Member removed", "success");
    setDeleteConfirmId(null);
  };
  
  const cleanAllDuplicates = () => {
    if (!window.confirm("Are you sure you want to run the automatic deduplication tool? This will remove all duplicate members and joinees with the exact same name. Make sure you haven't made changes in other tabs first.")) return;
    
    let removedCount = 0;
    const removedNames = [];
    const uniqueNames = new Set();
    const cleanMembers = [];
    
    for (const m of members) {
      const norm = normalizeName(m.name);
      if (uniqueNames.has(norm)) {
        removedCount++;
        removedNames.push(m.name + " (Member)");
      } else {
        uniqueNames.add(norm);
        cleanMembers.push(m);
      }
    }
    
    const uniqueJoineeNames = new Set();
    const cleanJoinees = [];
    for (const j of newJoinees) {
      const norm = normalizeName(j.name);
      // If they are in members, we also remove them from new joinees!
      if (uniqueNames.has(norm) || uniqueJoineeNames.has(norm)) {
        removedCount++;
        removedNames.push(j.name + " (New Joinee)");
      } else {
        uniqueJoineeNames.add(norm);
        cleanJoinees.push(j);
      }
    }
    
    if (removedCount > 0) {
      setMembers(cleanMembers);
      setNewJoinees(cleanJoinees);
      setDuplicateReport(removedNames);
    } else {
      showToast("No duplicates found!", "info");
    }
  };

  const selectedInsights = selectedMember ? memberInsights(selectedMember) : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="color-muted text-sm" style={{ marginTop: 4 }}>{members.filter(m => m.active).length} active · {members.filter(m => !m.active).length} inactive</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin && <button className="btn btn-outline" onClick={cleanAllDuplicates}>Clean Duplicates</button>}
          {isAdmin && <button className="btn btn-primary" onClick={openAdd}>+ Add Member</button>}
        </div>
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
                      <td><div className="flex items-center gap-3"><Avatar name={m.name} size={30} /><div><div className="flex items-center gap-1"><div style={{ fontWeight: 700, fontSize: 13 }}>{m.name}</div>{insight.badges && insight.badges.length > 0 && <div className="flex gap-1" style={{ marginLeft: 4 }}>{insight.badges.map((b, i) => <span key={i} title={b.tooltip} style={{ cursor: "help" }}>{b.icon}</span>)}</div>}</div><div className="text-xs color-muted">{m.id} · {m.mobile || "No mobile"}</div></div></div></td>
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
                          {isAdmin && <button className="btn btn-sm btn-danger" onClick={e => { e.stopPropagation(); setDeleteConfirmId(m.id); }}>Delete</button>}
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
      <AnimatedModal isOpen={showForm} onClose={() => setShowForm(false)}>
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
          <div className="field"><label>Date of Birth</label><input className="input" type="date" value={form.dob || ""} onChange={e => setForm({ ...form, dob: e.target.value })} /></div>
        </div>
        <div className="grid-2">
          <div className="field"><label>Role</label><input className="input" value={form.role || ""} onChange={e => setForm({ ...form, role: e.target.value })} placeholder="Member / Lead / Volunteer" /></div>
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
      </AnimatedModal>
      <AnimatedModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <h2>Delete Member</h2>
        <p>Are you sure you want to delete this member? This action cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-danger flex-1" style={{ justifyContent: "center" }} onClick={() => deleteMember(deleteConfirmId)}>Delete</button>
          <button className="btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
        </div>
      </AnimatedModal>
      <AnimatedModal isOpen={!!duplicateReport} onClose={() => setDuplicateReport(null)} maxWidth={500}>
        <h2>Duplicates Removed</h2>
        <p className="mb-4" style={{ color: "var(--text)" }}>Successfully removed {duplicateReport?.length} duplicate entries from the database.</p>
        <div className="scroll-area" style={{ maxHeight: 300, background: "var(--bg-alt)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "14px", color: "var(--text-muted)" }}>
            {duplicateReport?.map((name, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{name}</li>
            ))}
          </ul>
        </div>
        <div className="mt-4 flex justify-end">
          <button className="btn btn-primary" onClick={() => setDuplicateReport(null)}>Done</button>
        </div>
      </AnimatedModal>
    </div>
  );
}

function NewJoinees({ newJoinees, setNewJoinees, showToast, isAdmin }) {
  const [search, setSearch] = useState("");
  const [editJoinee, setEditJoinee] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
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
    setNewJoinees(prev => prev.filter(j => j.id !== id));
    showToast("New joinee removed", "success");
    setDeleteConfirmId(null);
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
                        <button className="btn btn-sm btn-danger" onClick={() => setDeleteConfirmId(j.id)}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <AnimatedModal isOpen={showForm} onClose={() => setShowForm(false)}>
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
      </AnimatedModal>
      <AnimatedModal isOpen={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)}>
        <h2>Delete New Joinee</h2>
        <p>Are you sure you want to delete this new joinee? This action cannot be undone.</p>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-danger flex-1" style={{ justifyContent: "center" }} onClick={() => deleteJoinee(deleteConfirmId)}>Delete</button>
          <button className="btn" onClick={() => setDeleteConfirmId(null)}>Cancel</button>
        </div>
      </AnimatedModal>
    </div>
  );
}

function Events({ events, setEvents, getEventStats, showToast, isAdmin }) {
  const [showForm, setShowForm] = useState(false);
  const [editEvent, setEditEvent] = useState(null);
  const [form, setForm] = useState({ name: "", date: "", time: "", venue: "", category: "Religious", notes: "", color: "#7c6af8", lat: null, lng: null });
  const categories = ["Religious", "Social", "Educational", "Cultural", "Other"];
  const colors = ["#7c6af8", "#ec4899", "#14b8a6", "#f59e0b", "#ef4444", "#06b6d4", "#10b981"];

  const openAdd = () => { setForm({ name: "", date: new Date().toISOString().split("T")[0], time: "09:00", venue: "", category: "Religious", notes: "", color: "#7c6af8", lat: null, lng: null }); setEditEvent(null); setShowForm(true); };
  const openEdit = (e) => { setForm({ ...e }); setEditEvent(e.id); setShowForm(true); };
  const saveEvent = () => {
    if (!form.name.trim()) return showToast("Event name required", "error");
    if (editEvent) { setEvents(events.map(e => e.id === editEvent ? { ...form, id: editEvent } : e)); showToast("Event updated", "success"); }
    else { setEvents([...events, { ...form, id: genId("E") }]); showToast("Event created", "success"); }
    setShowForm(false);
  };


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
      <AnimatedModal isOpen={showForm} onClose={() => setShowForm(false)}>
        <h2>{editEvent ? "Edit Event" : "Create New Event"}</h2>
        <div className="field"><label>Event Name</label><input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Sabha" /></div>
        <div className="grid-2">
          <div className="field"><label>Date</label><input className="input" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div className="field"><label>Time</label><input className="input" type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} /></div>
        </div>
        <div className="field"><label>Venue</label><input className="input" value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} placeholder="Location / Venue" /></div>
        <div className="field">
          <label>Venue Lock (Geo-Fencing)</label>
          <div className="flex gap-2">
            <input className="input flex-1" value={form.lat && form.lng ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : "No Coordinates Set"} readOnly placeholder="GPS Coordinates" />
            <button className="btn btn-secondary" onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => setForm({ ...form, lat: pos.coords.latitude, lng: pos.coords.longitude }),
                  (err) => alert("Location access denied or unavailable: " + err.message),
                  { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                );
              } else {
                alert("Geolocation is not supported by your browser");
              }
            }}>📍 Get Location</button>
            {(form.lat || form.lng) && <button className="btn" onClick={() => setForm({ ...form, lat: null, lng: null })}>Clear</button>}
          </div>
        </div>
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
      </AnimatedModal>
    </div>
  );
}

function Attendance({ events, members, newJoinees, attendance, setAttendance, newJoineeAttendance, setNewJoineeAttendance, setNewJoinees, showToast, isAdmin, attendanceEventId, setAttendanceEventId }) {
  const sortedEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const [selEvent, setSelEvent] = useState(attendanceEventId || sortedEvents[0]?.id || "");
  useEffect(() => {
    if (attendanceEventId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelEvent(attendanceEventId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAttendanceEventId(""); // Clear it so it doesn't force override later if they use dropdown
    } else if (!selEvent && sortedEvents.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelEvent(sortedEvents[0].id);
    }
  }, [attendanceEventId, setAttendanceEventId, selEvent, sortedEvents]);
  
  const [showQR, setShowQR] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState("members");
  const [statusFilter, setStatusFilter] = useState("");
  const [areaFilter, setAreaFilter] = useState("");
  const [smartFilter, setSmartFilter] = useState("");
  const [showBulkNames, setShowBulkNames] = useState(false);
  const [bulkNames, setBulkNames] = useState("");
  const fileInputRef = useRef(null);
  const isNewJoineeGroup = group === "newJoinees";
  const activePeople = (isNewJoineeGroup ? newJoinees : members).filter(p => p.active);
  const store = isNewJoineeGroup ? newJoineeAttendance : attendance;
  const setStore = isNewJoineeGroup ? setNewJoineeAttendance : setAttendance;
  const rec = store[selEvent] || {};
  const groupLabel = isNewJoineeGroup ? "New Joinees" : "Members";
  const event = events.find(e => e.id === selEvent);
  
  const statusOrder = ["present", "absent", "late", "excused"];
  const statusMeta = {
    present: { label: "Present", icon: "✓", color: "#10d47e" },
    absent: { label: "Absent", icon: "×", color: "#f43f5e" },
    late: { label: "Late", icon: "⏱", color: "#f0b429" },
    excused: { label: "Excused", icon: "○", color: "#06b6d4" },
  };

  const statusOf = (personId) => {
    const val = rec[personId];
    return normalizeAttendanceStatus(val);
  };
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

  const applyPresentByNames = (names, sourceLabel) => {
    if (!isAdmin || !selEvent) return;
    const uniqueNames = [...new Set(names.map(normalizeName).filter(Boolean))];
    if (uniqueNames.length === 0) {
      showToast(`No names found in ${sourceLabel}`, "error");
      return;
    }

    const peopleByName = new Map(activePeople.map(person => [normalizeName(person.name), person]));
    const matched = [];
    const unmatched = [];
    uniqueNames.forEach(name => {
      const person = peopleByName.get(name);
      if (person) matched.push(person);
      else unmatched.push(name);
    });

    if (matched.length === 0) {
      showToast(`No matching ${groupLabel.toLowerCase()} found`, "error");
      return;
    }

    const updatedRec = { ...rec };
    matched.forEach(person => {
      updatedRec[person.id] = "present";
    });
    setStore({ ...store, [selEvent]: updatedRec });

    const missedText = unmatched.length ? `, ${unmatched.length} not found` : "";
    showToast(`${matched.length} ${groupLabel.toLowerCase()} marked present${missedText}`, unmatched.length ? "info" : "success");
  };

  const handleExcelImport = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      const rows = file.name.toLowerCase().endsWith(".csv")
        ? (await file.text()).split(/\r?\n/).map(line => line.split(","))
        : await readXlsxFile(file);
      applyPresentByNames(namesFromWorksheetRows(rows), file.name);
    } catch (error) {
      console.error("Could not import attendance Excel file", error);
      showToast("Could not read this Excel file", "error");
    }
  };

  const submitBulkNames = () => {
    applyPresentByNames(parseBulkNames(bulkNames), "typed names");
    setBulkNames("");
    setShowBulkNames(false);
  };

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
  
  const [isListening, setIsListening] = useState(false);

  const startVoiceAttendance = () => {
    if (!isAdmin || !selEvent) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition not supported in this browser.", "error");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      showToast("Listening... Say e.g., 'Mark Dhruv and Moksh present'", "success");
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase();
      let statusToSet = "present";
      if (transcript.includes("absent") || transcript.includes("not coming")) statusToSet = "absent";
      else if (transcript.includes("late")) statusToSet = "late";
      else if (transcript.includes("excuse")) statusToSet = "excused";

      let matchCount = 0;
      const updated = {};
      
      activePeople.forEach(p => {
        const nameParts = p.name.toLowerCase().split(' ').filter(part => part.length > 2);
        const matches = nameParts.some(part => transcript.includes(part));
        if (matches) {
           updated[p.id] = statusToSet;
           matchCount++;
        }
      });
      
      if (matchCount > 0) {
        setStore(prev => ({ ...prev, [selEvent]: { ...(prev[selEvent] || {}), ...updated } }));
        showToast(`Voice matched ${matchCount} member(s) to ${statusMeta[statusToSet]?.label || statusToSet}`, "success");
      } else {
        showToast(`Heard: "${transcript}" but no names matched.`, "error");
      }
    };

    recognition.onerror = (e) => {
      showToast("Voice recognition error: " + e.error, "error");
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

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
            {isAdmin && selEvent && (
              <div className="flex gap-2" style={{ marginTop: 8 }}>
                <button className="btn" style={{ flex: 1, padding: "8px", background: "green", color: "var(--text)", border: "1px solid var(--border)" }} onClick={() => setShowQR(true)}>Generate QR</button>
                <button className="btn" style={{ flex: 1, padding: "8px", background: "green", color: "var(--text)", border: "1px solid var(--border)" }} onClick={() => setShowPending(true)}>Pending Scans</button>
              </div>
            )}
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
              
              {isAdmin && selEvent && (
                <button className={`btn btn-sm ${isListening ? "btn-danger pulse-anim" : "btn-primary"}`} onClick={startVoiceAttendance} title="AI Voice Attendance">
                  {isListening ? "🎙 Listening..." : "🎙 AI Voice"}
                </button>
              )}
              
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
                <button className="btn btn-sm" onClick={() => fileInputRef.current?.click()}>Import Excel Names</button>
                <button className="btn btn-sm" onClick={() => setShowBulkNames(true)}>Enter Names</button>
                <button className="btn btn-sm" onClick={importPrevious}>Import Previous Attendance</button>
                <button className="btn btn-sm btn-danger" onClick={resetAttendance}>Reset Attendance</button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.csv"
                  onChange={handleExcelImport}
                  style={{ display: "none" }}
                />
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
      <AnimatedModal isOpen={showBulkNames} onClose={() => setShowBulkNames(false)} maxWidth={520}>
        <h2>Mark {groupLabel} Present</h2>
        <div className="field">
          <label>Names</label>
          <textarea
            className="input"
            value={bulkNames}
            onChange={e => setBulkNames(e.target.value)}
            placeholder="Enter one name per line, or separate names with commas"
            rows={8}
            autoFocus
            style={{ resize: "vertical", minHeight: 160 }}
          />
        </div>
        <p className="color-muted text-xs" style={{ marginTop: -6, marginBottom: 12 }}>
          This marks matching {groupLabel.toLowerCase()} as present for the selected event only.
        </p>
        <div className="flex gap-3 mt-4">
          <button className="btn btn-primary flex-1" style={{ justifyContent: "center" }} onClick={submitBulkNames}>OK</button>
          <button className="btn" onClick={() => setShowBulkNames(false)}>Cancel</button>
        </div>
      </AnimatedModal>
      <AnimatedModal isOpen={showQR && !!selEvent} onClose={() => setShowQR(false)} maxWidth={400} style={{ background: 'white', padding: 32, borderRadius: 16, textAlign: 'center' }}>
        <h2 className="mb-2">Event Check-In QR</h2>
        <p className="color-muted mb-6 text-sm">Members scan this to submit attendance.</p>
        <div style={{ display: 'inline-block', padding: 16, background: '#f9fafb', borderRadius: 12 }}>
          <QRCodeCanvas value={`${window.location.origin}/?checkin=${selEvent}`} size={240} />
        </div>
        <div className="mt-6">
          <button className="btn" style={{ width: '100%', padding: "10px", background: "#f3f4f6", color: "var(--text)", border: "none" }} onClick={() => setShowQR(false)}>Close</button>
        </div>
      </AnimatedModal>
      {showPending && selEvent && (
        <PendingCheckinsModal
          eventId={selEvent}
          members={members}
          onClose={() => setShowPending(false)}
          onApprove={(matchedMemberId, data) => {
            if (matchedMemberId === "NEW_JOINEE") {
              const nid = "NJ_" + Math.random().toString(36).substr(2, 9);
              setNewJoinees([...newJoinees, { id: nid, name: data.name, mobile: data.mobile, active: true }]);
              setNewJoineeAttendance({ ...newJoineeAttendance, [selEvent]: { ...(newJoineeAttendance[selEvent] || {}), [nid]: "present" } });
            } else {
              setAttendance({ ...attendance, [selEvent]: { ...(attendance[selEvent] || {}), [matchedMemberId]: "present" } });
            }
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

function Analytics({ members, newJoinees, events, getMemberStats, attendance, newJoineeAttendance, isAdmin }) {
  const [smartTab, setSmartTab] = React.useState("missed3");

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h2 className="mb-2">Only for admins</h2>
        <p className="color-muted text-sm">Please enable Admin Mode to access the Analytics Studio.</p>
      </div>
    );
  }
  const active = members.filter(m => m.active);
  const totalAttendances = events.reduce((acc, e) => {
    return acc + active.filter(m => {
      const att = attendance[e.id]?.[m.id] || newJoineeAttendance[e.id]?.[m.id];
      return att === 'present' || att === 'late';
    }).length;
  }, 0);

  const avgAttendance = active.length ? Math.round(active.reduce((s, m) => s + getMemberStats(m.id).pct, 0) / active.length) : 0;

  // Group events by month for trends
  const monthGroups = {};
  events.forEach(e => {
    const d = new Date(e.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short' }) + " '" + String(d.getFullYear()).slice(2);
    if (!monthGroups[key]) monthGroups[key] = { label, events: [], totalPct: 0 };
    monthGroups[key].events.push(e);
  });

  const monthKeys = Object.keys(monthGroups).sort();
  const trendData = monthKeys.map(k => {
    const evs = monthGroups[k].events;
    let sumPct = 0;
    evs.forEach(e => {
      const pCount = active.filter(m => {
        const att = attendance[e.id]?.[m.id];
        return att === 'present' || att === 'late';
      }).length;
      sumPct += (pCount / active.length) * 100;
    });
    const avg = evs.length ? sumPct / evs.length : 0;
    return { label: monthGroups[k].label, value: Math.round(avg) };
  });

  // Calculate trends vs previous period (simplistic assumption based on last 2 months)
  const currentMonth = trendData.length > 0 ? trendData[trendData.length - 1].value : 0;
  const prevMonth = trendData.length > 1 ? trendData[trendData.length - 2].value : 0;
  const trendDiff = currentMonth - prevMonth;

  // Donut chart logic
  const areaCounts = active.reduce((acc, m) => { acc[m.area] = (acc[m.area] || 0) + 1; return acc; }, {});
  const areaData = Object.entries(areaCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const donutColors = ["#7c6af8", "#10d47e", "#f0b429", "#ec4899", "#06b6d4"];
  const donutSegments = areaData.map((area, index) => {
    const pct = active.length ? area.count / active.length : 0;
    const previousPct = active.length
      ? areaData.slice(0, index).reduce((sum, item) => sum + item.count / active.length, 0)
      : 0;
    return {
      ...area,
      color: donutColors[index % donutColors.length],
      dashArray: `${pct * 314} 314`,
      dashOffset: -(previousPct * 314),
    };
  });

  // Heatmap logic (Top 5 events, top 8 people for brevity, or scrollable)
  const recentEvents = [...events].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5).reverse();
  const sortedMembers = [...active].sort((a, b) => getMemberStats(b.id).pct - getMemberStats(a.id).pct);

  // Categorization
  const consistent = active.filter(m => getMemberStats(m.id).pct >= 80);
  const irregular = active.filter(m => getMemberStats(m.id).pct >= 40 && getMemberStats(m.id).pct < 80);
  const inactive = active.filter(m => getMemberStats(m.id).pct < 40 && getMemberStats(m.id).total > 0);

  // Insight Generation
  const insights = [];
  if (trendDiff > 0) insights.push({ type: 'positive', title: 'Positive Trend', desc: `Overall attendance improved by ${Math.abs(trendDiff)}% compared to last month.`, color: '#10d47e', bg: '#dcfce7', icon: '↗' });
  else if (trendDiff < 0) insights.push({ type: 'negative', title: 'Attention Required', desc: `Overall attendance dropped by ${Math.abs(trendDiff)}% compared to last month.`, color: '#f43f5e', bg: '#ffe4e6', icon: '↘' });

  // Find low engagement event
  const eventPcts = events.map(e => {
    const count = active.filter(m => {
      const att = attendance[e.id]?.[m.id];
      return att === 'present' || att === 'late';
    }).length;
    return { title: e.name, pct: active.length ? Math.round((count / active.length) * 100) : 0 };
  }).sort((a, b) => a.pct - b.pct);

  if (eventPcts.length > 0) {
    insights.push({ type: 'warning', title: 'Low Engagement Event', desc: `${eventPcts[0].title} had the lowest participation (${eventPcts[0].pct}%).`, color: '#f0b429', bg: '#fef3c7', icon: '📉' });
  }

  // Smart Alerts Logic
  const missedLast3 = active.filter(m => {
    if (recentEvents.length < 3) return false;
    const recentAtt = recentEvents.slice(0, 3).map(e => attendance[e.id]?.[m.id]);
    return recentAtt.every(a => a === 'absent' || !a);
  });

  const below40 = active.filter(m => getMemberStats(m.id).pct < 40 && getMemberStats(m.id).total > 0);

  const firstTimers = [...active, ...(newJoinees || []).filter(j => j.active)].filter(m => {
    const s = getMemberStats(m.id);
    if (s.present === 1 && recentEvents.length > 0) {
      const att = attendance[recentEvents[0].id]?.[m.id] || newJoineeAttendance[recentEvents[0].id]?.[m.id];
      return att === 'present' || att === 'late';
    }
    return false;
  });

  const inactive60 = active.filter(m => {
    const attendedEvents = events.filter(e => {
      const att = attendance[e.id]?.[m.id] || newJoineeAttendance[e.id]?.[m.id];
      return att === 'present' || att === 'late';
    }).sort((a, b) => new Date(b.date) - new Date(a.date));
    if (attendedEvents.length === 0) return false;
    const diffDays = Math.ceil(Math.abs(new Date() - new Date(attendedEvents[0].date)) / (1000 * 60 * 60 * 24));
    return diffDays > 60;
  });

  const highPerformersList = active.filter(m => getMemberStats(m.id).pct >= 85 && getMemberStats(m.id).total >= 3);

  const getSmartTabData = () => {
    switch (smartTab) {
      case 'missed3': return missedLast3;
      case 'below40': return below40;
      case 'firstTimers': return firstTimers;
      case 'inactive60': return inactive60;
      case 'highPerformers': return highPerformersList;
      default: return [];
    }
  };
  const currentSmartList = getSmartTabData();

  return (
    <div className="ac-dashboard">
      <div style={{ marginBottom: "20px" }}>
        <h1 className="page-title" style={{ fontSize: "24px" }}>Analytics Intelligence Center</h1>
        <p className="color-muted text-sm">Real-time insights and smart analysis of attendance patterns</p>
      </div>

      {/* Row 1: Top Stats */}
      <div className="ac-grid">
        <div className="ac-card col-2">
          <div className="ac-card-title">Active Members <span className="icon">👥</span></div>
          <div className="ac-stat-value">{active.length}</div>
          <div className="ac-stat-trend trend-up">100% of total</div>
        </div>
        <div className="ac-card col-2">
          <div className="ac-card-title">Events Conducted <span className="icon">📅</span></div>
          <div className="ac-stat-value">{events.length}</div>
          <div className="ac-stat-trend trend-up">↑ {events.length} this period</div>
        </div>
        <div className="ac-card col-2">
          <div className="ac-card-title">Avg Attendance <span className="icon">📈</span></div>
          <div className="ac-stat-value">{avgAttendance}%</div>
          <div className={`ac-stat-trend ${trendDiff >= 0 ? 'trend-up' : 'trend-down'}`}>
            {trendDiff >= 0 ? '↑' : '↓'} {Math.abs(trendDiff)}% vs last month
          </div>
        </div>
        <div className="ac-card col-2">
          <div className="ac-card-title">Total Attendances <span className="icon">✅</span></div>
          <div className="ac-stat-value">{totalAttendances}</div>
          <div className="ac-stat-trend" style={{ background: "transparent", padding: 0 }}>Across all events</div>
        </div>
        <div className="ac-card col-2">
          <div className="ac-card-title">Consistent Rate <span className="icon">⭐</span></div>
          <div className="ac-stat-value">{active.length ? Math.round((consistent.length / active.length) * 100) : 0}%</div>
          <div className="ac-stat-trend trend-up">High engagement</div>
        </div>
        <div className="ac-card col-2">
          <div className="ac-card-title">Low Engagement <span className="icon">⚠️</span></div>
          <div className="ac-stat-value">{inactive.length}</div>
          <div className="ac-stat-trend trend-down">Needs attention</div>
        </div>
      </div>

      {/* Row 2: Charts and Insights */}
      <div className="ac-grid" style={{ marginTop: "8px" }}>
        {/* Attendance Trend Line Chart */}
        <div className="ac-card col-5" style={{ minHeight: "260px" }}>
          <div className="ac-card-title">Attendance Trend <span className="color-muted text-xs">Monthly</span></div>
          <div className="ac-chart-container" style={{ alignItems: "center" }}>
            <svg viewBox="0 0 400 150" style={{ width: "100%", height: "100%", overflow: "visible" }}>
              {/* Grid lines */}
              <line x1="0" y1="0" x2="400" y2="0" stroke="var(--border)" strokeDasharray="4 4" />
              <line x1="0" y1="50" x2="400" y2="50" stroke="var(--border)" strokeDasharray="4 4" />
              <line x1="0" y1="100" x2="400" y2="100" stroke="var(--border)" strokeDasharray="4 4" />
              <line x1="0" y1="150" x2="400" y2="150" stroke="var(--border)" strokeDasharray="4 4" />
              {/* Labels */}
              <text x="-10" y="5" fontSize="10" fill="var(--text2)" textAnchor="end">100%</text>
              <text x="-10" y="150" fontSize="10" fill="var(--text2)" textAnchor="end">0%</text>

              {/* Line path */}
              <path
                d={`M ${trendData.map((d, i) => `${(i / Math.max(1, trendData.length - 1)) * 400},${150 - (d.value / 100) * 150}`).join(" L ")}`}
                fill="none" stroke="var(--accent)" strokeWidth="3"
              />
              {/* Data points */}
              {trendData.map((d, i) => (
                <g key={i} transform={`translate(${(i / Math.max(1, trendData.length - 1)) * 400}, ${150 - (d.value / 100) * 150})`}>
                  <circle r="4" fill="var(--bg2)" stroke="var(--accent)" strokeWidth="2" />
                  <text y="-10" fontSize="10" fill="var(--text)" textAnchor="middle">{d.value}%</text>
                  <text y="165" fontSize="10" fill="var(--text2)" textAnchor="middle">{d.label}</text>
                </g>
              ))}
            </svg>
          </div>
        </div>

        {/* Monthly Comparison Bar Chart */}
        <div className="ac-card col-4" style={{ minHeight: "260px" }}>
          <div className="ac-card-title">Monthly Comparison <span className="color-muted text-xs">Avg %</span></div>
          <div className="ac-chart-container" style={{ paddingBottom: "24px" }}>
            {trendData.slice(-6).map((d, i) => (
              <div key={i} className="ac-bar" style={{ height: `${d.value}%`, background: `var(${i === trendData.length - 1 ? '--accent' : '--accent2'})` }}>
                <span className="ac-bar-val">{d.value}%</span>
                <span className="ac-bar-label" style={{ whiteSpace: "nowrap" }}>{d.label.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Smart Insights */}
        <div className="ac-card col-3">
          <div className="ac-card-title">✨ Smart Insights</div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {insights.map((ins, i) => (
              <div key={i} className="insight-item">
                <div className="insight-icon" style={{ background: ins.bg, color: ins.color }}>{ins.icon}</div>
                <div className="insight-content">
                  <h4 style={{ color: ins.color }}>{ins.title}</h4>
                  <p>{ins.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Heatmap, Donut, Categories */}
      <div className="ac-grid" style={{ marginTop: "8px" }}>

        {/* Event Participation Heatmap */}
        <div className="ac-card col-5">
          <div className="ac-card-title">Event Participation Heatmap <span className="color-muted text-xs">Recent 5 Events</span></div>
          <div className="heatmap-grid">
            <div className="heatmap-row" style={{ marginBottom: "8px" }}>
              <div className="heatmap-label" style={{ fontWeight: 600 }}>Member</div>
              {recentEvents.map(e => (
                <div key={e.id} className="heatmap-label" style={{ flex: 1, minWidth: "40px", textAlign: "center" }} title={e.name}>
                  {new Date(e.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </div>
              ))}
            </div>
            {sortedMembers.slice(0, 8).map(m => (
              <div key={m.id} className="heatmap-row">
                <div className="heatmap-label" title={m.name}>{m.name}</div>
                {recentEvents.map(e => {
                  const att = attendance[e.id]?.[m.id];
                  const color = att === 'present' ? '#10d47e' : att === 'late' ? '#f0b429' : att === 'excused' ? '#06b6d4' : '#f43f5e';
                  return <div key={e.id} className="heatmap-cell" style={{ background: att ? color : 'var(--bg4)' }} title={`${m.name}: ${att || 'Unknown'}`} />
                })}
              </div>
            ))}
            {sortedMembers.length > 8 && (
              <div className="color-muted text-xs mt-2">... and {sortedMembers.length - 8} more</div>
            )}
            <div className="flex gap-4 mt-4 justify-center">
              <span className="flex items-center gap-2 text-xs"><span style={{ width: 10, height: 10, background: '#10d47e', borderRadius: 2 }}></span> Present</span>
              <span className="flex items-center gap-2 text-xs"><span style={{ width: 10, height: 10, background: '#f0b429', borderRadius: 2 }}></span> Late</span>
              <span className="flex items-center gap-2 text-xs"><span style={{ width: 10, height: 10, background: '#f43f5e', borderRadius: 2 }}></span> Absent</span>
            </div>
          </div>
        </div>

        {/* Area-wise Participation */}
        <div className="ac-card col-3">
          <div className="ac-card-title">Area-wise Participation</div>
          <div className="flex items-center justify-center gap-6" style={{ height: "100%" }}>
            <div style={{ position: "relative", width: "120px", height: "120px" }}>
              <svg viewBox="0 0 100 100" style={{ transform: "rotate(-90deg)", width: "100%", height: "100%" }}>
                {donutSegments.map(segment => (
                  <circle key={segment.name} cx="50" cy="50" r="40" fill="none" stroke={segment.color} strokeWidth="20" strokeDasharray={segment.dashArray} strokeDashoffset={segment.dashOffset} />
                ))}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold" }}>{active.length}</span>
                <span style={{ fontSize: "9px", color: "var(--text2)" }}>Members</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {areaData.slice(0, 5).map((a, i) => (
                <div key={a.name} className="flex items-center gap-2 text-xs">
                  <span style={{ width: 10, height: 10, background: donutColors[i % donutColors.length], borderRadius: "50%" }}></span>
                  <span style={{ width: 60, overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</span>
                  <span className="font-bold">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Attendance Categories */}
        <div className="ac-card col-4">
          <div className="ac-card-title">Attendance Categories</div>
          <div className="flex flex-col gap-4" style={{ flex: 1, justifyContent: "center" }}>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: "#10d47e", fontWeight: 600 }}>Consistent (≥80%)</span>
                <span>{consistent.length} ({active.length ? Math.round((consistent.length / active.length) * 100) : 0}%)</span>
              </div>
              <div style={{ height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${active.length ? (consistent.length / active.length) * 100 : 0}%`, background: "#10d47e" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: "#f0b429", fontWeight: 600 }}>Irregular (40% - 79%)</span>
                <span>{irregular.length} ({active.length ? Math.round((irregular.length / active.length) * 100) : 0}%)</span>
              </div>
              <div style={{ height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${active.length ? (irregular.length / active.length) * 100 : 0}%`, background: "#f0b429" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span style={{ color: "#f43f5e", fontWeight: 600 }}>Inactive (&lt;40%)</span>
                <span>{inactive.length} ({active.length ? Math.round((inactive.length / active.length) * 100) : 0}%)</span>
              </div>
              <div style={{ height: 8, background: "var(--bg4)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${active.length ? (inactive.length / active.length) * 100 : 0}%`, background: "#f43f5e" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Smart Alerts & Top Performers */}
      <div className="ac-grid" style={{ marginTop: "8px" }}>

        {/* Smart Alerts */}
        <div className="ac-card col-7">
          <div className="ac-card-title" style={{ color: "var(--accent)" }}>💡 Smart Alerts</div>
          <div className="ac-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <div className={`ac-tab ${smartTab === 'missed3' ? 'active' : ''}`} onClick={() => setSmartTab('missed3')}>Missed Last 3 ({missedLast3.length})</div>
            <div className={`ac-tab ${smartTab === 'below40' ? 'active' : ''}`} onClick={() => setSmartTab('below40')}>Below 40% ({below40.length})</div>
            <div className={`ac-tab ${smartTab === 'firstTimers' ? 'active' : ''}`} onClick={() => setSmartTab('firstTimers')}>First Timers ({firstTimers.length})</div>
            <div className={`ac-tab ${smartTab === 'inactive60' ? 'active' : ''}`} onClick={() => setSmartTab('inactive60')}>Inactive 60 Days ({inactive60.length})</div>
            <div className={`ac-tab ${smartTab === 'highPerformers' ? 'active' : ''}`} onClick={() => setSmartTab('highPerformers')}>High Performers ({highPerformersList.length})</div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="ac-table">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Attendance %</th>
                  <th>Recent Activity</th>
                </tr>
              </thead>
              <tbody>
                {currentSmartList.slice(0, 8).map(m => {
                  const s = getMemberStats(m.id);
                  return (
                    <tr key={m.id}>
                      <td style={{ fontWeight: 500 }}>{m.name}</td>
                      <td style={{ color: s.pct >= 75 ? "var(--emerald)" : s.pct >= 40 ? "var(--gold)" : "var(--rose)", fontWeight: 600 }}>{s.pct}%</td>
                      <td>
                        <div className="flex gap-2">
                          {recentEvents.slice(0, 3).reverse().map(e => {
                            const att = attendance[e.id]?.[m.id] || newJoineeAttendance[e.id]?.[m.id];
                            return <span key={e.id} style={{ fontSize: 14 }}>{att === 'present' ? '✅' : att === 'late' ? '⏱️' : '❌'}</span>
                          })}
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {currentSmartList.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: "center", padding: "20px", color: "var(--text2)" }}>No members in this category right now.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Performers */}
        <div className="ac-card col-5">
          <div className="ac-card-title">🏆 Top Performers</div>
          <div className="flex flex-col gap-3">
            {sortedMembers.slice(0, 5).map((m, i) => {
              const s = getMemberStats(m.id);
              return (
                <div key={m.id} className="flex items-center gap-3">
                  <div style={{ width: 20, fontSize: 11, color: "var(--text2)", fontWeight: 600 }}>{i + 1}</div>
                  <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{m.name}</div>
                  <div style={{ flex: 2, height: 6, background: "var(--bg4)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${s.pct}%`, background: "var(--emerald)" }} />
                  </div>
                  <div style={{ width: 30, textAlign: "right", fontSize: 11, fontWeight: 700, color: "var(--emerald)" }}>{s.pct}%</div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

const TEMPLATES = {
  singleEvent: { id: "singleEvent", title: "Single Event Report", desc: "Detailed attendance for one specific activity.", requiredOptions: ["eventId"] },
  monthlySummary: { id: "monthlySummary", title: "Monthly Summary", desc: "Aggregated attendance and trends for a specific month.", requiredOptions: ["dateRange"] },
  executiveReport: { id: "executiveReport", title: "Executive Report", desc: "High-level overview with charts and analytics.", requiredOptions: ["includeCharts"] },
  volunteerReport: { id: "volunteerReport", title: "Volunteer Report", desc: "Focused on volunteer activity and contributions.", requiredOptions: [] },
  detailedAttendance: { id: "detailedAttendance", title: "Detailed Attendance", desc: "Line-by-line attendance matrix for all members.", requiredOptions: ["includeAbsent", "includePhone"] }
};

function buildReportHtml({ template, data, options }) {
  const { allPeople, attendanceGetter, stats, generatedAt } = data;
  const { includePhone, includeSignatures, includeCharts, includeAbsent, dateRange } = options;

  const statusMeta = {
    present: { label: "Present", icon: "✓", color: "#10b981", bg: "#d1fae5" },
    late: { label: "Late", icon: "◔", color: "#f59e0b", bg: "#fef3c7" },
    excused: { label: "Excused", icon: "•", color: "#0ea5e9", bg: "#e0f2fe" },
    absent: { label: "Absent", icon: "✕", color: "#ef4444", bg: "#fee2e2" }
  };

  const getStatus = (person, eventId) => {
    const s = attendanceGetter(eventId, person.id);
    return statusMeta[s] || { label: "-", icon: "-", color: "#9ca3af", bg: "transparent" };
  };

  // Filter events by date range if provided
  let filteredEvents = data.events || [];
  if (template === "singleEvent" && options.eventId) {
    filteredEvents = filteredEvents.filter(e => e.id === options.eventId);
  } else if (dateRange && dateRange.start && dateRange.end) {
    const start = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    end.setHours(23, 59, 59, 999);
    filteredEvents = filteredEvents.filter(e => {
      const ed = new Date(e.date);
      return ed >= start && ed <= end;
    });
  }

  // Filter people
  let peopleList = [...allPeople];
  if (template === "volunteerReport") {
    peopleList = peopleList.filter(p => /volunteer/i.test(p.role || p.notes || ""));
  }

  // Apply absent filter (if a template is detailed and includeAbsent is false, we could filter out those with 0 attendance)
  if (!includeAbsent && template === "detailedAttendance") {
    peopleList = peopleList.filter(p => {
      const hasAttendance = filteredEvents.some(e => {
        const s = attendanceGetter(e.id, p.id);
        return s === 'present' || s === 'late';
      });
      return hasAttendance;
    });
  }

  let mostActiveMember = "N/A";
  let maxAttendance = -1;

  if (filteredEvents.length > 0 && peopleList.length > 0) {
    peopleList.forEach(p => {
      let presentCount = 0;
      filteredEvents.forEach(e => {
        const s = getStatus(p, e.id);
        if (s.label === "Present" || s.label === "Late") presentCount++;
      });
      p._sortCount = presentCount;
      if (presentCount > maxAttendance) {
        maxAttendance = presentCount;
        mostActiveMember = p.name;
      }
    });
    if (maxAttendance === 0) mostActiveMember = "None (0%)";

    // Sort by most attended person to least attended
    peopleList.sort((a, b) => {
      if (b._sortCount !== a._sortCount) {
        return b._sortCount - a._sortCount;
      }
      return a.name.localeCompare(b.name);
    });
  } else {
    peopleList.sort((a, b) => a.name.localeCompare(b.name));
  }

  let htmlBody = "";

  const headerHtml = `
    <header class="report-header">
      <div class="header-logo-container">
        <!-- Logo cropped to exclude the bottom text -->
        <img src="/aysg-logo.jpg" alt="AYSG Logo" class="header-logo" onerror="this.style.display='none'" />
      </div>
      <div class="header-details">
        <h1 class="report-title">AYSG Ghatkopar Attendance Report</h1>
        <p class="report-subtitle">${TEMPLATES[template].title}</p>
        <div class="metadata-grid">
          <div class="meta-item"><span class="meta-label">Total Events:</span> ${filteredEvents.length}</div>
          <div class="meta-item"><span class="meta-label">Total Members:</span> ${peopleList.length}</div>
          <div class="meta-item"><span class="meta-label">Most Active:</span> ${mostActiveMember}</div>
          ${dateRange && dateRange.start ? `<div class="meta-item"><span class="meta-label">Period:</span> ${dateRange.start.split('-').reverse().join('/')} to ${dateRange.end ? dateRange.end.split('-').reverse().join('/') : 'Now'}</div>` : ''}
        </div>
      </div>
    </header>
  `;

  const footerHtml = includeSignatures ? `
    <div class="signature-section">
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Prepared By</div>
      </div>
      <div class="sig-block">
        <div class="sig-line"></div>
        <div class="sig-title">Approved By</div>
      </div>
    </div>
  ` : "";

  if (template === "monthlySummary" || template === "executiveReport") {
    htmlBody += `
      <div class="summary-cards">
        <div class="card">
          <div class="card-value" style="color: #4f46e5;">${stats.active}</div>
          <div class="card-label">Active Members</div>
        </div>
        <div class="card">
          <div class="card-value" style="color: #4f46e5;">${filteredEvents.length}</div>
          <div class="card-label">Events in Period</div>
        </div>
        <div class="card">
          <div class="card-value" style="color: #10b981;">${Math.round(stats.avgAttendance)}</div>
          <div class="card-label">Avg. Attendance</div>
        </div>
      </div>
    `;

    if (includeCharts) {
      htmlBody += `
        <div class="chart-section">
          <h3>Attendance Trend</h3>
          <div class="chart-container">
            ${filteredEvents.slice(0, 10).map((e) => {
              const count = allPeople.filter(p => attendanceGetter(e.id, p.id) === 'present' || attendanceGetter(e.id, p.id) === 'late').length;
              const h = Math.max(10, Math.min(100, (count / (allPeople.length || 1)) * 100));
              return `<div class="chart-bar" style="height: ${h}%;" title="${e.name}"></div>`;
            }).join("")}
          </div>
        </div>
      `;
    }
  }

  if (template === "detailedAttendance" || template === "volunteerReport" || template === "singleEvent") {
    htmlBody += `
      <table class="data-table">
        <thead>
          <tr>
            <th style="text-align: center; vertical-align: middle;">Member</th>
            ${includePhone ? `<th style="text-align: center; vertical-align: middle;">Phone</th>` : ""}
            ${filteredEvents.map(e => `
              <th style="vertical-align: top; height: 1px; padding: 0;" title="${e.name}">
                <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: center; height: 100%; padding: 12px 8px; box-sizing: border-box;">
                  <div style="font-size: 11px; font-weight: 600; margin-bottom: 4px; line-height: 1.3; text-align: center;">${e.name}</div>
                  <div style="font-size: 10px; opacity: 0.85; text-align: center;">${new Date(e.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                </div>
              </th>
            `).join("")}
            <th style="text-align: center; width: 80px; vertical-align: middle;">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          ${peopleList.map((p) => {
            let presentCount = 0;
            const eventHtml = filteredEvents.map(e => {
              const s = getStatus(p, e.id);
              if (s.label === "Present" || s.label === "Late") presentCount++;
              return `<td style="text-align: center; background: ${s.bg}; color: ${s.color}; font-weight: bold; font-size: 14px;">${s.icon}</td>`;
            }).join("");
            
            const attendancePct = filteredEvents.length > 0 ? Math.round((presentCount / filteredEvents.length) * 100) : 0;
            const pctColor = attendancePct >= 80 ? "#10b981" : attendancePct >= 50 ? "#f59e0b" : "#ef4444";

            return `
            <tr>
              <td style="font-weight: 500;">${p.name}</td>
              ${includePhone ? `<td style="color: #6b7280;">${p.phone || '-'}</td>` : ""}
              ${eventHtml}
              <td style="text-align: center; font-weight: bold; color: ${pctColor}; background: ${pctColor}15;">${attendancePct}%</td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  } else {
    // Basic event list for monthly summary
    htmlBody += `
      <table class="data-table">
        <thead>
          <tr>
            <th style="text-align: left;">Event Date & Title</th>
            <th style="text-align: center;">Present</th>
            <th style="text-align: center;">Absent</th>
            <th style="text-align: center; width: 80px;">Attendance %</th>
          </tr>
        </thead>
        <tbody>
          ${filteredEvents.map((e) => {
            const pCount = allPeople.filter(p => attendanceGetter(e.id, p.id) === 'present' || attendanceGetter(e.id, p.id) === 'late').length;
            const aCount = allPeople.filter(p => attendanceGetter(e.id, p.id) === 'absent').length;
            const total = pCount + aCount;
            const eventPct = total > 0 ? Math.round((pCount / total) * 100) : 0;
            const pctColor = eventPct >= 80 ? "#10b981" : eventPct >= 50 ? "#f59e0b" : "#ef4444";

            return `
              <tr>
                <td><strong>${new Date(e.date).toLocaleDateString()}</strong> - ${e.name}</td>
                <td style="text-align: center; color: #10b981; font-weight: 500;">${pCount}</td>
                <td style="text-align: center; color: #ef4444; font-weight: 500;">${aCount}</td>
                <td style="text-align: center; font-weight: bold; color: ${pctColor}; background: ${pctColor}15;">${eventPct}%</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>AYSG Ghatkopar Attendance Report - ${TEMPLATES[template].title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      <style>
        :root {
          --primary: #4f46e5;
          --primary-dark: #4338ca;
          --text-main: #1f2937;
          --text-muted: #6b7280;
          --bg-light: #f9fafb;
          --border: #e5e7eb;
        }
        body { 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
          padding: 40px; 
          margin: 0; 
          color: var(--text-main); 
          background-color: #ffffff;
        }
        @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        
        .report-header {
          display: flex;
          align-items: flex-start;
          gap: 24px;
          border-bottom: 2px solid var(--primary);
          padding-bottom: 24px;
          margin-bottom: 32px;
        }
        
        .header-logo-container {
          width: 140px;
          height: 120px;
          overflow: hidden;
          position: relative;
          border-radius: 8px;
          background: #fff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          flex-shrink: 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
        }
        
        .header-logo {
          width: 100%;
          height: 135%;
          object-fit: cover;
          object-position: top center;
        }
        
        .header-details {
          flex: 1;
        }
        
        .report-title {
          margin: 0; 
          color: var(--primary-dark); 
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        
        .report-subtitle {
          margin: 6px 0 16px; 
          color: var(--text-muted); 
          font-size: 15px;
          font-weight: 500;
        }
        
        .metadata-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px 24px;
          font-size: 12px;
          background: var(--bg-light);
          padding: 12px 16px;
          border-radius: 6px;
          border: 1px solid var(--border);
        }
        
        .meta-item { color: var(--text-main); font-weight: 500; }
        .meta-label { color: var(--text-muted); font-weight: 400; margin-right: 4px; }
        
        /* Summary Cards */
        .summary-cards {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
        }
        .card {
          flex: 1;
          padding: 24px 20px;
          background: #ffffff;
          border-radius: 12px;
          text-align: center;
          border: 1px solid var(--border);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .card-value {
          font-size: 36px;
          font-weight: 800;
          margin-bottom: 4px;
          line-height: 1;
        }
        .card-label {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        /* Charts */
        .chart-section {
          margin-bottom: 32px;
          page-break-inside: avoid;
          background: #ffffff;
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .chart-section h3 {
          margin: 0 0 16px;
          font-size: 16px;
          color: var(--text-main);
        }
        .chart-container {
          height: 140px;
          background: var(--bg-light);
          border-radius: 8px;
          display: flex;
          align-items: flex-end;
          padding: 0 16px 16px;
          gap: 12px;
        }
        .chart-bar {
          flex: 1;
          background: linear-gradient(180deg, #6366f1 0%, #4338ca 100%);
          border-radius: 4px 4px 0 0;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        
        /* Data Tables */
        .data-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 12px;
          table-layout: fixed;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid var(--border);
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .data-table thead th {
          background: var(--primary);
          color: #ffffff;
          padding: 12px 10px;
          font-weight: 600;
          border-right: 1px solid rgba(255,255,255,0.1);
          border-bottom: 2px solid var(--primary-dark);
        }
        .data-table thead th:last-child { border-right: none; }
        
        .data-table tbody td {
          padding: 10px;
          border-bottom: 1px solid var(--border);
          border-right: 1px solid var(--border);
          background: #ffffff;
        }
        .data-table tbody tr:nth-child(even) td {
          background: var(--bg-light);
        }
        .data-table tbody tr:last-child td { border-bottom: none; }
        .data-table tbody td:last-child { border-right: none; }
        
        /* Footer */
        .signature-section {
          margin-top: 60px;
          display: flex;
          justify-content: space-between;
          page-break-inside: avoid;
        }
        .sig-block {
          text-align: center;
          width: 200px;
        }
        .sig-line {
          border-bottom: 1px solid var(--text-main);
          height: 40px;
          margin-bottom: 8px;
        }
        .sig-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-muted);
        }
      </style>
    </head>
    <body>
      ${headerHtml}
      ${htmlBody}
      ${footerHtml}
    </body>
    </html>
  `;
}


function Reports({ members, newJoinees, events, attendance, newJoineeAttendance, getEventStats, isAdmin }) {
  const [template, setTemplate] = React.useState("monthlySummary");
  const [zoom, setZoom] = React.useState(1);
  const [exportStep, setExportStep] = React.useState(0);
  const [isExporting, setIsExporting] = React.useState(false);

  // Customization Options
  const [options, setOptions] = React.useState({
    brandColor: "#7c6af8",
    includePhone: false,
    includeSignatures: true,
    includeCharts: true,
    includeAbsent: true,
    dateRange: { start: "", end: "" },
    memberGroup: "all"
  });

  const iframeRef = React.useRef(null);
  const previewHtml = React.useMemo(() => {
    let active = (members || []).filter(m => m.active).map(m => ({ ...m, group: "Member", role: m.role || "Member" }));
    let activeJoinees = (newJoinees || []).filter(j => j.active).map(j => ({ ...j, group: "New Joinee", role: "New Joiner" }));

    if (options.memberGroup === "members") {
      activeJoinees = [];
    } else if (options.memberGroup === "newJoinees") {
      active = [];
    }

    const allPeople = [...active, ...activeJoinees];

    const attendanceGetter = (eId, pId) => {
      return (attendance[eId] && attendance[eId][pId]) || (newJoineeAttendance[eId] && newJoineeAttendance[eId][pId]) || "absent";
    };

    const avgAtt = events.length ? events.reduce((acc, e) => {
      const s = getEventStats(e.id);
      return acc + (s ? (s.present + s.late) : 0);
    }, 0) / events.length : 0;

    const stats = {
      active: allPeople.length,
      avgAttendance: avgAtt
    };

    return buildReportHtml({
      template,
      data: { events, allPeople, attendanceGetter, stats, generatedAt: new Date().toLocaleString("en-IN") },
      options
    });
  }, [template, events, members, newJoinees, attendance, newJoineeAttendance, getEventStats, options]);

  React.useEffect(() => {
    if (iframeRef.current && previewHtml) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(previewHtml);
        doc.close();
      }
    }
  }, [previewHtml, zoom]);

  const handleExport = () => {
    // Open immediately to bypass mobile popup blockers
    const win = window.open("", "_blank");
    if (!win) {
      alert("Please allow pop-ups to generate the PDF on your device.");
      return;
    }

    setIsExporting(true);
    setExportStep(1); // Generating PDF

    // Inject a script that prints after images load
    const printScript = `
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      </script>
    `;

    win.document.open();
    win.document.write(previewHtml + printScript);
    win.document.close();
    win.focus();

    setTimeout(() => {
      setExportStep(2); // Finalizing
      setTimeout(() => {
        setIsExporting(false);
        setExportStep(3); // Done
        setTimeout(() => setExportStep(0), 3000);
      }, 1000);
    }, 1500);
  };

  if (!isAdmin) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔒</div>
        <h2 className="mb-2">Only for admins</h2>
        <p className="color-muted text-sm">Please enable Admin Mode to access the Reports Studio.</p>
      </div>
    );
  }

  return (
    <div className="reports-studio">
      <div className="settings-panel">
        <h2 className="mb-6 font-bold" style={{ fontSize: "22px" }}>Report Studio</h2>

        <div className="section mb-6">
          <h3 className="mb-4 font-semi" style={{ fontSize: "14px" }}>1. Select Template</h3>
          <div className="report-template-grid">
            {Object.values(TEMPLATES).map(tpl => (
              <div
                key={tpl.id}
                className={`template-card ${template === tpl.id ? 'active' : ''}`}
                onClick={() => setTemplate(tpl.id)}
              >
                <div className="template-card-title">{tpl.title}</div>
                <div className="template-card-desc">{tpl.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="section mb-6" style={{ background: "var(--bg2)", padding: "20px", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <h3 className="mb-4 font-semi" style={{ fontSize: "14px" }}>2. Customization</h3>

          <div className="mb-4">
            <label className="text-xs color-muted font-semi block mb-2">Brand Color</label>
            <div className="flex gap-2">
              {['#7c6af8', '#ec4899', '#14b8a6', '#f59e0b', '#ef4444', '#111827'].map(c => (
                <div
                  key={c}
                  className="color-swatch"
                  style={{ background: c, borderColor: options.brandColor === c ? 'var(--text)' : 'transparent' }}
                  onClick={() => setOptions({ ...options, brandColor: c })}
                />
              ))}
              <div className="color-swatch" style={{ background: options.brandColor }}>
                <input
                  type="color"
                  value={options.brandColor}
                  onChange={e => setOptions({ ...options, brandColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          {template === "singleEvent" ? (
            <div className="mb-4">
              <label className="text-xs color-muted font-semi block mb-2">Select Activity</label>
              <select
                className="input"
                style={{ width: "100%" }}
                value={options.eventId}
                onChange={e => setOptions({ ...options, eventId: e.target.value })}
              >
                {events.map(ev => (
                  <option key={ev.id} value={ev.id}>{new Date(ev.date).toLocaleDateString()} - {ev.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="mb-4">
              <label className="text-xs color-muted font-semi block mb-2">Report Period</label>
              <select
                className="input mb-3"
                style={{ width: "100%" }}
                value={options.datePreset}
                onChange={e => {
                  const val = e.target.value;
                  let start = "", end = "";
                  const d = new Date();
                  if (val === "thisMonth") {
                    start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
                    end = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
                  } else if (val === "lastMonth") {
                    start = new Date(d.getFullYear(), d.getMonth() - 1, 1).toISOString().split('T')[0];
                    end = new Date(d.getFullYear(), d.getMonth(), 0).toISOString().split('T')[0];
                  } else if (val === "thisYear") {
                    start = new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
                    end = new Date(d.getFullYear(), 11, 31).toISOString().split('T')[0];
                  }
                  setOptions({ ...options, datePreset: val, dateRange: { start, end } });
                }}
              >
                <option value="allTime">All Time</option>
                <option value="thisMonth">This Month</option>
                <option value="lastMonth">Last Month</option>
                <option value="thisYear">This Year</option>
                <option value="custom">Custom Range</option>
              </select>

              {options.datePreset === "custom" && (
                <div className="grid-2 gap-4" style={{ gridTemplateColumns: '1fr 1fr' }}>
                  <div>
                    <label className="text-xs color-muted font-semi block mb-2">Start Date</label>
                    <input type="date" className="input" style={{ width: "100%" }} value={options.dateRange.start} onChange={e => setOptions({ ...options, dateRange: { ...options.dateRange, start: e.target.value } })} />
                  </div>
                  <div>
                    <label className="text-xs color-muted font-semi block mb-2">End Date</label>
                    <input type="date" className="input" style={{ width: "100%" }} value={options.dateRange.end} onChange={e => setOptions({ ...options, dateRange: { ...options.dateRange, end: e.target.value } })} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mb-4">
            <label className="text-xs color-muted font-semi block mb-2">Member Group</label>
            <select
              className="input mb-3"
              style={{ width: "100%" }}
              value={options.memberGroup}
              onChange={e => setOptions({ ...options, memberGroup: e.target.value })}
            >
              <option value="all">All Members & Joinees</option>
              <option value="members">Main Members Only</option>
              <option value="newJoinees">New Joinees Only</option>
            </select>
          </div>

          <label className="option-checkbox">
            <input type="checkbox" checked={options.includeSignatures} onChange={e => setOptions({ ...options, includeSignatures: e.target.checked })} />
            Include Signature Blocks
          </label>
          <label className="option-checkbox">
            <input type="checkbox" checked={options.includeCharts} onChange={e => setOptions({ ...options, includeCharts: e.target.checked })} />
            Include Analytics Charts
          </label>
          <label className="option-checkbox">
            <input type="checkbox" checked={options.includePhone} onChange={e => setOptions({ ...options, includePhone: e.target.checked })} />
            Include Phone Numbers
          </label>
          <label className="option-checkbox">
            <input type="checkbox" checked={options.includeAbsent} onChange={e => setOptions({ ...options, includeAbsent: e.target.checked })} />
            Include Absent Members
          </label>
        </div>

      </div>

      <div className="preview-panel">
        <div className="preview-header">
          <div className="font-semi text-sm">Live Preview</div>
          <div className="preview-zoom-controls">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} title="Zoom Out">-</button>
            <span style={{ fontSize: '11px', fontWeight: 600, width: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(1.5, zoom + 0.1))} title="Zoom In">+</button>
          </div>
        </div>

        <div className="preview-device">
          <div className="preview-page" style={{ transform: `scale(${zoom})`, marginBottom: `${(zoom - 1) * 1123}px` }}>
            <iframe ref={iframeRef} title="Report Preview" />
          </div>
        </div>

        <div className="reports-footer">
          <div style={{ flex: 1 }}>
            {isExporting ? (
              <div className="export-stepper">
                <div className={`step-node ${exportStep >= 1 ? 'active' : ''} ${exportStep > 1 ? 'done' : ''}`}>
                  <div className="step-circle">1</div>
                  <div className="step-label">Generating</div>
                </div>
                <div className={`step-node ${exportStep >= 2 ? 'active' : ''} ${exportStep > 2 ? 'done' : ''}`}>
                  <div className="step-circle">2</div>
                  <div className="step-label">Formatting</div>
                </div>
                <div className={`step-node ${exportStep >= 3 ? 'active' : ''} ${exportStep > 3 ? 'done' : ''}`}>
                  <div className="step-circle">3</div>
                  <div className="step-label">Ready</div>
                </div>
              </div>
            ) : (
              <span className="text-xs color-muted">Report auto-updates as you change settings.</span>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isExporting}
            style={{ marginLeft: "16px", minWidth: "140px" }}
          >
            {isExporting ? "Exporting..." : "Export to PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AttendanceAssistant({ members, newJoinees, events, attendance, newJoineeAttendance, getMemberStats, getEventStats }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi, I can answer questions about attendance, events, members, new joinees, and who needs attention." },
  ]);

  const suggestions = [
    "Overall attendance summary",
    "Top attendance members",
    "Low attendance members",
    "Latest event stats",
  ];

  const ask = (question) => {
    const clean = question.trim();
    if (!clean) return;
    const answer = answerAttendanceQuestion(clean, { members, newJoinees, events, attendance, newJoineeAttendance, getMemberStats, getEventStats });
    setMessages(prev => [...prev, { from: "user", text: clean }, { from: "bot", text: answer }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <div className="assistant-panel">
          <div className="assistant-head">
            <div>
              <div className="assistant-title">AYSG Assistant</div>
              <div className="assistant-sub">Answers from live attendance data</div>
            </div>
            <button className="assistant-close" onClick={() => setOpen(false)}>x</button>
          </div>
          <div className="assistant-messages">
            {messages.map((msg, index) => (
              <div key={`${msg.from}-${index}`} className={`assistant-msg ${msg.from}`}>{msg.text}</div>
            ))}
          </div>
          <div className="assistant-suggestions">
            {suggestions.map(item => <button key={item} onClick={() => ask(item)}>{item}</button>)}
          </div>
          <form className="assistant-form" onSubmit={e => { e.preventDefault(); ask(input); }}>
            <input className="input" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about attendance..." />
            <button className="btn btn-primary" type="submit">Ask</button>
          </form>
        </div>
      )}
      <button className="assistant-launcher" onClick={() => setOpen(value => !value)} title="Ask AYSG Assistant">AI</button>
    </>
  );
}

function answerAttendanceQuestion(question, data) {
  const q = normalizeName(question);
  const activeMembers = data.members.filter(member => member.active);
  const activeJoinees = data.newJoinees.filter(joinee => joinee.active);
  const allPeople = [
    ...activeMembers.map(person => ({ ...person, group: "Member", store: data.attendance })),
    ...activeJoinees.map(person => ({ ...person, group: "New Joinee", store: data.newJoineeAttendance })),
  ];
  const sortedEvents = [...data.events].sort((a, b) => new Date(b.date) - new Date(a.date));
  const event = findMentionedEvent(q, sortedEvents) || (q.includes("latest") || q.includes("last") || q.includes("recent") ? sortedEvents[0] : null);
  const person = allPeople.find(item => q.includes(normalizeName(item.name)));

  if (q.includes("help") || q.includes("what can you")) {
    return "Try questions like:\n- What is Moksh Shah attendance?\n- Who was present in Chaas Vitran?\n- Who has low attendance?\n- Latest event stats\n- How many members and new joinees are active?";
  }

  if (person) {
    const stats = person.group === "Member" ? data.getMemberStats(person.id) : getPersonStatsFromStore(person.id, data.newJoineeAttendance);
    const last = sortedEvents.find(item => isAttendedStatus(person.store[item.id]?.[person.id]));
    return `${person.name} (${person.group})\nAttendance: ${stats.present}/${stats.total} events (${stats.pct}%).\nLast attended: ${last ? `${last.name} on ${fmtDate(last.date)}` : "No recorded attendance yet."}`;
  }

  if (event) {
    const stats = data.getEventStats(event.id);
    const presentPeople = peopleForEvent(allPeople, event.id, status => isAttendedStatus(status));
    const absentPeople = peopleForEvent(allPeople, event.id, status => normalizeAttendanceStatus(status) === "absent");
    if (q.includes("present") || q.includes("attended")) {
      return `${event.name} present list (${presentPeople.length}):\n${formatNameList(presentPeople)}`;
    }
    if (q.includes("absent") || q.includes("missing")) {
      return `${event.name} absent list (${absentPeople.length}):\n${formatNameList(absentPeople)}`;
    }
    return `${event.name} (${fmtDate(event.date)})\nPresent/Late: ${stats.present}\nAbsent: ${stats.absent}\nTotal active people: ${stats.total}\nAttendance: ${stats.pct}%`;
  }

  if (q.includes("top") || q.includes("best") || q.includes("highest")) {
    const top = activeMembers
      .map(member => ({ ...member, stats: data.getMemberStats(member.id) }))
      .sort((a, b) => b.stats.pct - a.stats.pct || b.stats.present - a.stats.present)
      .slice(0, 5);
    return `Top attendance members:\n${top.map((member, index) => `${index + 1}. ${member.name}: ${member.stats.pct}% (${member.stats.present}/${member.stats.total})`).join("\n") || "No attendance data yet."}`;
  }

  if (q.includes("low") || q.includes("poor") || q.includes("attention") || q.includes("inactive")) {
    const low = activeMembers
      .map(member => ({ ...member, stats: data.getMemberStats(member.id) }))
      .filter(member => member.stats.total > 0)
      .sort((a, b) => a.stats.pct - b.stats.pct || a.stats.present - b.stats.present)
      .slice(0, 8);
    return `Members needing attention:\n${low.map(member => `${member.name}: ${member.stats.pct}% (${member.stats.present}/${member.stats.total})`).join("\n") || "No attendance data yet."}`;
  }

  if (q.includes("member") || q.includes("new joinee") || q.includes("people") || q.includes("count")) {
    return `Active members: ${activeMembers.length}\nActive new joinees: ${activeJoinees.length}\nTotal active people: ${activeMembers.length + activeJoinees.length}\nEvents tracked: ${data.events.length}`;
  }

  const overallPct = activeMembers.length
    ? Math.round(activeMembers.reduce((sum, member) => sum + data.getMemberStats(member.id).pct, 0) / activeMembers.length)
    : 0;
  const latest = sortedEvents[0];
  return `Overall summary:\nEvents tracked: ${data.events.length}\nActive members: ${activeMembers.length}\nActive new joinees: ${activeJoinees.length}\nAverage member attendance: ${overallPct}%\nLatest event: ${latest ? `${latest.name} (${fmtDate(latest.date)})` : "No events yet."}`;
}

function findMentionedEvent(question, events) {
  return events.find(event => {
    const name = normalizeName(event.name);
    return name && (question.includes(name) || name.split(" ").some(part => part.length > 3 && question.includes(part)));
  });
}

function peopleForEvent(people, eventId, predicate) {
  return people.filter(person => predicate(person.store[eventId]?.[person.id]));
}

function getPersonStatsFromStore(personId, store) {
  let total = 0, present = 0;
  Object.values(store).forEach(rec => {
    total += 1;
    if (isAttendedStatus(rec[personId])) present += 1;
  });
  return { total, present, pct: total ? Math.round((present / total) * 100) : 0 };
}

function formatNameList(people) {
  if (people.length === 0) return "No matching records.";
  return people.slice(0, 30).map(person => `- ${person.name} (${person.group})`).join("\n") + (people.length > 30 ? `\n...and ${people.length - 30} more` : "");
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
// Trigger Vercel deploy