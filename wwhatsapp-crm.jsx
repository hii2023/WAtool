import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import {
  Users, LayoutDashboard, MessageSquare, LogOut, Menu, X, Search,
  ChevronDown, ChevronUp, Upload, Download, Plus, Trash2, Edit3,
  CheckCircle, Bell, Send, RefreshCw, AlertCircle,
  Sun, Moon, Eye, EyeOff, ChevronLeft, ChevronRight, Check,
  FileText, Copy, ExternalLink, Square, CheckSquare, Layers,
  Server, Globe, Rocket, Terminal, BookOpen, Shield, Zap, Info
} from "lucide-react";

const today = new Date().toISOString().split("T")[0];
const d = (offset) => new Date(Date.now() + offset * 86400000).toISOString().split("T")[0];

const SAMPLE_LEADS = [
  { id:1,  name:"Rahul Sharma",   phone:"919876543210", status:"Interested",  followUpDate:d(-1), lastContacted:"2026-03-04", notes:"Very interested in premium plan", city:"Mumbai",    source:"Website",      createdDate:"2026-02-15" },
  { id:2,  name:"Priya Patel",    phone:"919823456789", status:"Follow-up",   followUpDate:d(0),  lastContacted:"2026-03-05", notes:"Asked for product demo",           city:"Ahmedabad", source:"Referral",     createdDate:"2026-02-20" },
  { id:3,  name:"Amit Kumar",     phone:"918765432101", status:"New",         followUpDate:d(2),  lastContacted:null,         notes:"",                                 city:"Delhi",     source:"Facebook Ads", createdDate:"2026-03-01" },
  { id:4,  name:"Sneha Desai",    phone:"917654321098", status:"Negotiation", followUpDate:d(0),  lastContacted:"2026-03-03", notes:"Negotiating on price",             city:"Pune",      source:"Instagram",    createdDate:"2026-02-10" },
  { id:5,  name:"Vikram Singh",   phone:"916543210987", status:"Closed Won",  followUpDate:null,  lastContacted:"2026-03-01", notes:"Deal closed! Sent invoice.",       city:"Bangalore", source:"Website",      createdDate:"2026-01-20" },
  { id:6,  name:"Ananya Iyer",    phone:"915432109876", status:"Contacted",   followUpDate:d(-2), lastContacted:"2026-03-02", notes:"Left voicemail",                   city:"Chennai",   source:"Cold Call",    createdDate:"2026-02-28" },
  { id:7,  name:"Rajan Mehta",    phone:"914321098765", status:"Closed Lost", followUpDate:null,  lastContacted:"2026-02-20", notes:"Went with competitor",             city:"Surat",     source:"Referral",     createdDate:"2026-02-01" },
  { id:8,  name:"Divya Nair",     phone:"913210987654", status:"Interested",  followUpDate:d(1),  lastContacted:"2026-03-05", notes:"Requested brochure",               city:"Kochi",     source:"LinkedIn",     createdDate:"2026-03-02" },
  { id:9,  name:"Sanjay Gupta",   phone:"912109876543", status:"Follow-up",   followUpDate:d(-3), lastContacted:"2026-02-28", notes:"Follow up on proposal sent",       city:"Jaipur",    source:"Website",      createdDate:"2026-02-15" },
  { id:10, name:"Meera Krishnan", phone:"911098765432", status:"New",         followUpDate:d(3),  lastContacted:null,         notes:"Found via Google search",          city:"Hyderabad", source:"Google Ads",   createdDate:"2026-03-05" },
  { id:11, name:"Farhan Sheikh",  phone:"910987654321", status:"Negotiation", followUpDate:d(0),  lastContacted:"2026-03-04", notes:"Payment terms discussion pending", city:"Mumbai",    source:"Referral",     createdDate:"2026-02-22" },
  { id:12, name:"Pooja Agarwal",  phone:"919876501234", status:"Contacted",   followUpDate:d(1),  lastContacted:"2026-03-05", notes:"Very responsive on WhatsApp",      city:"Noida",     source:"Instagram",    createdDate:"2026-03-03" },
];

const SAMPLE_TEMPLATES = [
  { id:1, name:"Casual",            message:"Hi {name} 👋 Hope you're doing great! Just following up on our last conversation. Would love to connect and discuss how we can help you. Let me know when you're free! 😊" },
  { id:2, name:"Formal",            message:"Dear {name},\n\nHope this message finds you well. I am following up regarding our previous discussion. I would appreciate the opportunity to continue our conversation at your earliest convenience.\n\nBest regards" },
  { id:3, name:"Hindi Mix",         message:"Namaste {name} ji, Kaise ho? 🙏 Follow up kar raha tha humari last conversation ke baare mein. Kya aap available hain thodi baat karne ke liye? Please reply karo! 😄" },
  { id:4, name:"Offer Alert",       message:"Hey {name}! 🎉 Great news — we have a special limited-time offer just for you! Get 20% off on your first purchase. This deal expires soon. Let's chat! 🔥" },
  { id:5, name:"Follow-up Reminder",message:"Hi {name}, just a gentle reminder about our upcoming discussion. Looking forward to connecting with you and sharing how we can add value to your business. Talk soon!" },
];

const STATUSES = ["New","Contacted","Interested","Follow-up","Negotiation","Closed Won","Closed Lost"];
const SOURCES  = ["Website","Referral","Facebook Ads","Instagram","LinkedIn","Google Ads","Cold Call","Other"];
const STATUS_COLORS = { "New":"#6366f1","Contacted":"#f59e0b","Interested":"#10b981","Follow-up":"#3b82f6","Negotiation":"#f97316","Closed Won":"#22c55e","Closed Lost":"#ef4444" };

const isOverdue = (dt) => dt && dt < today;
const isToday   = (dt) => dt === today;
const fmtDate   = (dt) => { if (!dt) return "—"; const [y,m,day]=dt.split("-"); return `${day}/${m}/${y}`; };
const nextId    = (arr) => arr.length ? Math.max(...arr.map(l=>l.id))+1 : 1;

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,        setUser]    = useState(null);
  const [dark,        setDark]    = useState(true);
  const [view,        setView]    = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(false);
  const [leads,       setLeads]   = useState(SAMPLE_LEADS);
  const [templates,   setTmplts]  = useState(SAMPLE_TEMPLATES);
  const [showHosting, setHosting] = useState(false);

  if (!user) return <LoginPage onLogin={setUser} dark={dark} setDark={setDark} />;

  return (
    <div className={`min-h-screen flex ${dark?"bg-gray-950 text-gray-100":"bg-slate-50 text-gray-900"}`}
      style={{fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <Sidebar view={view} setView={setView} user={user} setUser={setUser}
        dark={dark} open={sidebarOpen} setOpen={setSidebar} leads={leads}
        onHosting={()=>setHosting(true)} />
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={()=>setSidebar(false)}/>}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        <Topbar dark={dark} setDark={setDark} setSidebar={setSidebar} view={view} leads={leads}/>
        <main className="flex-1 overflow-auto">
          {view==="dashboard" && <Dashboard leads={leads} dark={dark} setView={setView}/>}
          {view==="leads"     && <LeadsPage leads={leads} setLeads={setLeads} templates={templates} dark={dark}/>}
          {view==="templates" && <TemplatesPage templates={templates} setTemplates={setTmplts} dark={dark}/>}
        </main>
      </div>
      {showHosting && <HostingGuide dark={dark} onClose={()=>setHosting(false)}/>}
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginPage({onLogin,dark,setDark}) {
  const [email,  setEmail]  = useState("demo@whatsappcrm.com");
  const [pass,   setPass]   = useState("demo123");
  const [show,   setShow]   = useState(false);
  const [loading,setLoading]= useState(false);
  const login = () => { if(!email||!pass)return; setLoading(true); setTimeout(()=>{setLoading(false);onLogin({email,name:"Demo User",avatar:email[0].toUpperCase()});},700); };
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${dark?"bg-gray-950":"bg-slate-50"}`} style={{fontFamily:"'DM Sans','Segoe UI',sans-serif"}}>
      <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
            <MessageSquare size={32} className="text-white"/>
          </div>
          <h1 className="text-2xl font-bold" style={{color:"#25D366"}}>WhatsApp CRM</h1>
          <p className={`text-sm mt-1 ${dark?"text-gray-400":"text-gray-500"}`}>Sign in to your workspace</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${dark?"text-gray-400":"text-gray-600"}`}>Email</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email"
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white focus:border-green-500":"bg-white border-gray-300 focus:border-green-500"}`}/>
          </div>
          <div className="relative">
            <label className={`block text-xs font-medium mb-1.5 ${dark?"text-gray-400":"text-gray-600"}`}>Password</label>
            <input value={pass} onChange={e=>setPass(e.target.value)} type={show?"text":"password"} onKeyDown={e=>e.key==="Enter"&&login()}
              className={`w-full px-4 py-3 rounded-xl border text-sm outline-none pr-11 ${dark?"bg-gray-800 border-gray-700 text-white":"bg-white border-gray-300"}`}/>
            <button onClick={()=>setShow(!show)} className="absolute right-3 top-9 text-gray-400">{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
          </div>
          <button onClick={login} className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
            {loading?<><RefreshCw size={15} className="animate-spin"/>Signing in...</>:"Sign In"}
          </button>
          <p className={`text-center text-xs ${dark?"text-gray-500":"text-gray-400"}`}>demo@whatsappcrm.com / demo123</p>
        </div>
        <button onClick={()=>setDark(!dark)} className={`mt-5 w-full flex items-center justify-center gap-2 text-xs py-2 rounded-lg ${dark?"text-gray-500 hover:text-gray-300":"text-gray-400 hover:text-gray-600"}`}>
          {dark?<Sun size={13}/>:<Moon size={13}/>} {dark?"Light Mode":"Dark Mode"}
        </button>
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({view,setView,user,setUser,dark,open,setOpen,leads,onHosting}) {
  const overdue = leads.filter(l=>isOverdue(l.followUpDate)).length;
  const nav = [{id:"dashboard",label:"Dashboard",icon:LayoutDashboard},{id:"leads",label:"Leads & Customers",icon:Users},{id:"templates",label:"Templates",icon:FileText}];
  return (
    <aside className={`fixed top-0 left-0 h-full w-64 flex flex-col z-30 transition-transform duration-300 ${open?"translate-x-0":"-translate-x-full"} lg:translate-x-0 ${dark?"bg-gray-900 border-r border-gray-800":"bg-white border-r border-gray-200"}`}>
      <div className={`p-5 flex items-center justify-between border-b ${dark?"border-gray-800":"border-gray-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}><MessageSquare size={17} className="text-white"/></div>
          <div><div className="font-bold text-sm" style={{color:"#25D366"}}>WhatsApp CRM</div><div className={`text-xs ${dark?"text-gray-500":"text-gray-400"}`}>v2.1 Pro</div></div>
        </div>
        <button className="lg:hidden text-gray-400" onClick={()=>setOpen(false)}><X size={18}/></button>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {nav.map(({id,label,icon:Icon})=>(
          <button key={id} onClick={()=>{setView(id);setOpen(false);}}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition relative ${view===id?"text-white shadow-lg":dark?"text-gray-400 hover:text-white hover:bg-gray-800":"text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}
            style={view===id?{background:"linear-gradient(135deg,#25D366,#128C7E)"}:{}}>
            <Icon size={17}/>{label}
            {id==="leads"&&overdue>0&&<span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{overdue}</span>}
          </button>
        ))}
        <button onClick={()=>{onHosting();setOpen(false);}} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition mt-2 ${dark?"text-gray-400 hover:text-white hover:bg-gray-800":"text-gray-600 hover:text-gray-900 hover:bg-gray-100"}`}>
          <Rocket size={17}/>Go Live / Deploy
        </button>
      </nav>
      <div className={`p-4 border-t ${dark?"border-gray-800":"border-gray-200"}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>{user.avatar}</div>
          <div className="min-w-0"><div className={`text-sm font-medium truncate ${dark?"text-gray-200":"text-gray-800"}`}>{user.name}</div><div className={`text-xs truncate ${dark?"text-gray-500":"text-gray-400"}`}>{user.email}</div></div>
        </div>
        <button onClick={()=>setUser(null)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${dark?"text-gray-400 hover:text-red-400 hover:bg-red-500/10":"text-gray-500 hover:text-red-500 hover:bg-red-50"}`}><LogOut size={14}/>Sign Out</button>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────────────────────
function Topbar({dark,setDark,setSidebar,view,leads}) {
  const titles={dashboard:"Dashboard",leads:"Leads & Customers",templates:"Message Templates"};
  const todayFU=leads.filter(l=>isToday(l.followUpDate)).length;
  return (
    <header className={`sticky top-0 z-10 flex items-center justify-between px-4 lg:px-6 h-16 border-b ${dark?"bg-gray-950/95 border-gray-800 backdrop-blur":"bg-white/95 border-gray-200 backdrop-blur"}`}>
      <div className="flex items-center gap-3">
        <button className="lg:hidden p-2 rounded-lg text-gray-400" onClick={()=>setSidebar(true)}><Menu size={19}/></button>
        <h2 className={`font-semibold text-lg ${dark?"text-white":"text-gray-900"}`}>{titles[view]}</h2>
      </div>
      <div className="flex items-center gap-2">
        {todayFU>0&&<div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20"><Bell size={11}/>{todayFU} today</div>}
        <button onClick={()=>setDark(!dark)} className={`p-2 rounded-xl ${dark?"text-gray-400 hover:text-yellow-400 hover:bg-gray-800":"text-gray-500 hover:bg-gray-100"}`}>{dark?<Sun size={17}/>:<Moon size={17}/>}</button>
      </div>
    </header>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({leads,dark,setView}) {
  const total=leads.length, todayFU=leads.filter(l=>isToday(l.followUpDate)).length, overdue=leads.filter(l=>isOverdue(l.followUpDate)).length, won=leads.filter(l=>l.status==="Closed Won").length;
  const pieData=STATUSES.map(s=>({name:s,value:leads.filter(l=>l.status===s).length})).filter(d=>d.value>0);
  const recent=[...leads].sort((a,b)=>b.id-a.id).slice(0,6);
  const stats=[{label:"Total Leads",value:total,icon:Users,color:"#6366f1"},{label:"Today's Follow-ups",value:todayFU,icon:Bell,color:"#3b82f6"},{label:"Overdue",value:overdue,icon:AlertCircle,color:"#ef4444",alert:true},{label:"Closed Won",value:won,icon:CheckCircle,color:"#22c55e"}];
  return (
    <div className="p-4 lg:p-6 space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({label,value,icon:Icon,color,alert})=>(
          <div key={label} className={`rounded-2xl p-4 lg:p-5 border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"} ${alert&&value>0?"border-red-500/40":""}`}>
            <div className="inline-flex p-2.5 rounded-xl mb-3" style={{background:color+"22"}}><Icon size={19} style={{color}}/></div>
            <div className={`text-3xl font-bold mb-0.5 ${alert&&value>0?"text-red-400":dark?"text-white":"text-gray-900"}`}>{value}</div>
            <div className={`text-xs font-medium ${dark?"text-gray-400":"text-gray-500"}`}>{label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`rounded-2xl p-5 border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
          <h3 className={`font-semibold mb-4 ${dark?"text-white":"text-gray-900"}`}>Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {pieData.map(e=><Cell key={e.name} fill={STATUS_COLORS[e.name]}/>)}
              </Pie>
              <Tooltip contentStyle={{background:dark?"#1f2937":"#fff",border:"1px solid #374151",borderRadius:10,fontSize:12}}/>
              <Legend iconType="circle" iconSize={9} formatter={v=><span style={{fontSize:11,color:dark?"#9ca3af":"#6b7280"}}>{v}</span>}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className={`rounded-2xl p-5 border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
          <h3 className={`font-semibold mb-4 ${dark?"text-white":"text-gray-900"}`}>Quick Filters</h3>
          <div className="space-y-1.5">
            {[{label:"All Leads",count:total,color:"#6366f1"},{label:"Today Follow-ups",count:todayFU,color:"#3b82f6"},{label:"⚠ Overdue",count:overdue,color:"#ef4444"},{label:"New Leads",count:leads.filter(l=>l.status==="New").length,color:"#f59e0b"},{label:"In Negotiation",count:leads.filter(l=>l.status==="Negotiation").length,color:"#f97316"},{label:"Closed Won",count:won,color:"#22c55e"}].map(({label,count,color})=>(
              <button key={label} onClick={()=>setView("leads")} className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition text-sm ${dark?"hover:bg-gray-800":"hover:bg-gray-50"}`}>
                <span className={`font-medium ${dark?"text-gray-200":"text-gray-700"}`}>{label}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{background:color}}>{count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`rounded-2xl border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark?"border-gray-800":"border-gray-200"}`}>
          <h3 className={`font-semibold ${dark?"text-white":"text-gray-900"}`}>Recent Leads</h3>
          <button onClick={()=>setView("leads")} className="text-sm font-medium" style={{color:"#25D366"}}>View All →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={dark?"bg-gray-800/40":"bg-gray-50"}>
              <tr>{["Name","Phone","Status","Follow-up","City"].map(h=><th key={h} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${dark?"text-gray-400":"text-gray-500"}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {recent.map(lead=>(
                <tr key={lead.id} className={`border-t ${dark?"border-gray-800 hover:bg-gray-800/30":"border-gray-100 hover:bg-gray-50"}`}>
                  <td className={`px-4 py-3 font-medium ${dark?"text-gray-200":"text-gray-900"}`}>{lead.name}</td>
                  <td className={`px-4 py-3 ${dark?"text-gray-400":"text-gray-500"}`}>+{lead.phone}</td>
                  <td className="px-4 py-3"><StatusBadge status={lead.status}/></td>
                  <td className={`px-4 py-3 text-xs ${isOverdue(lead.followUpDate)?"text-red-400 font-semibold":isToday(lead.followUpDate)?"text-green-400 font-semibold":dark?"text-gray-400":"text-gray-500"}`}>{lead.followUpDate?fmtDate(lead.followUpDate):"—"}{isOverdue(lead.followUpDate)&&" ⚠"}</td>
                  <td className={`px-4 py-3 ${dark?"text-gray-400":"text-gray-500"}`}>{lead.city||"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({status}) {
  const c=STATUS_COLORS[status]||"#6b7280";
  return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{background:c+"22",color:c}}>{status}</span>;
}

// ─── LEADS PAGE ───────────────────────────────────────────────────────────────
function LeadsPage({leads,setLeads,templates,dark}) {
  const [search,  setSearch]  = useState("");
  const [statusF, setStatusF] = useState("All");
  const [quickF,  setQuickF]  = useState("all");
  const [sortKey, setSortKey] = useState("id");
  const [sortDir, setSortDir] = useState("desc");
  const [page,    setPage]    = useState(1);
  const PER = 10;

  // cell editing
  const [editCell, setEditCell] = useState(null);
  const [editVal,  setEditVal]  = useState("");

  // multi-select
  const [selMode,  setSelMode]  = useState(false);
  const [selected, setSelected] = useState(new Set());

  // modals
  const [addModal, setAddModal] = useState(false);
  const [impModal, setImpModal] = useState(false);
  const [waModal,  setWaModal]  = useState(null);
  const [delConf,  setDelConf]  = useState(null);

  const filtered = useMemo(()=>{
    let arr=[...leads];
    if(search){const q=search.toLowerCase();arr=arr.filter(l=>l.name.toLowerCase().includes(q)||l.phone.includes(q)||l.city?.toLowerCase().includes(q)||l.notes?.toLowerCase().includes(q));}
    if(statusF!=="All")arr=arr.filter(l=>l.status===statusF);
    if(quickF==="today") arr=arr.filter(l=>isToday(l.followUpDate));
    if(quickF==="overdue")arr=arr.filter(l=>isOverdue(l.followUpDate));
    arr.sort((a,b)=>{let va=a[sortKey]??"",vb=b[sortKey]??"";if(typeof va==="number")return sortDir==="asc"?va-vb:vb-va;return sortDir==="asc"?String(va).localeCompare(String(vb)):String(vb).localeCompare(String(va));});
    return arr;
  },[leads,search,statusF,quickF,sortKey,sortDir]);

  const totalPages=Math.ceil(filtered.length/PER);
  const paginated=filtered.slice((page-1)*PER,page*PER);

  const sort=(k)=>{if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir("asc");}setPage(1);};
  const SortI=({col})=>sortKey===col?(sortDir==="asc"?<ChevronUp size={11}/>:<ChevronDown size={11}/>):<ChevronDown size={11} className="opacity-25"/>;

  const startEdit=(id,field,val)=>{ if(selMode)return; setEditCell({id,field}); setEditVal(val??''); };
  const commitEdit=()=>{ if(!editCell)return; setLeads(ls=>ls.map(l=>l.id===editCell.id?{...l,[editCell.field]:editVal}:l)); setEditCell(null); };
  const cancelEdit=()=>setEditCell(null);
  const isEditing=(id,field)=>editCell?.id===id&&editCell?.field===field;

  const toggleSel=(id)=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const selectAll=()=>setSelected(new Set(paginated.map(l=>l.id)));
  const clearSel=()=>{setSelected(new Set());setSelMode(false);};

  const doExport=(rows=leads)=>{
    const h=["ID","Name","Phone","Status","Follow-up Date","Last Contacted","City","Source","Notes","Created Date"];
    const b=rows.map(l=>[l.id,l.name,l.phone,l.status,l.followUpDate||"",l.lastContacted||"",l.city||"",l.source||"",`"${(l.notes||"").replace(/"/g,'""')}"`,l.createdDate].join(","));
    const csv=[h.join(","),...b].join("\n");
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv);a.download="leads_export.csv";a.click();
  };

  return (
    <div className="p-4 lg:p-6 space-y-4">

      {selMode&&(
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border flex-wrap ${dark?"bg-blue-500/10 border-blue-500/30 text-blue-300":"bg-blue-50 border-blue-200 text-blue-700"}`}>
          <CheckSquare size={15}/>
          <span className="text-sm font-medium flex-1 min-w-0">
            {selected.size} selected ·{" "}
            <button onClick={selectAll} className="underline">Select all on page</button>
          </span>
          <button onClick={()=>doExport(leads.filter(l=>selected.has(l.id)))} disabled={!selected.size}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-500 text-white disabled:opacity-40"><Download size={12}/>Export</button>
          <button onClick={()=>setDelConf("bulk")} disabled={!selected.size}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white disabled:opacity-40"><Trash2 size={12}/>Delete</button>
          <button onClick={clearSel} className="p-1.5 rounded-lg hover:bg-white/10"><X size={14}/></button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl border ${dark?"bg-gray-900 border-gray-700":"bg-white border-gray-300"}`}>
          <Search size={15} className="text-gray-400 flex-shrink-0"/>
          <input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search name, phone, city…" className="flex-1 bg-transparent outline-none text-sm min-w-0"/>
          {search&&<button onClick={()=>setSearch("")} className="text-gray-400"><X size={13}/></button>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={statusF} onChange={e=>{setStatusF(e.target.value);setPage(1);}} className={`px-3 py-2.5 rounded-xl border text-sm outline-none ${dark?"bg-gray-900 border-gray-700 text-gray-200":"bg-white border-gray-300 text-gray-700"}`}>
            <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button onClick={()=>setAddModal(true)} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
            <Plus size={15}/>Add
          </button>
          <button onClick={()=>setImpModal(true)} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Upload size={15}/>Import
          </button>
          <button onClick={()=>doExport()} className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium ${dark?"border-gray-700 text-gray-300 hover:bg-gray-800":"border-gray-300 text-gray-600 hover:bg-gray-50"}`}>
            <Download size={15}/>Export
          </button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {[{id:"all",label:"All",count:leads.length},{id:"today",label:"Today",count:leads.filter(l=>isToday(l.followUpDate)).length},{id:"overdue",label:"⚠ Overdue",count:leads.filter(l=>isOverdue(l.followUpDate)).length,red:true}].map(f=>(
          <button key={f.id} onClick={()=>{setQuickF(f.id);setPage(1);}}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${quickF===f.id?f.red?"bg-red-500 text-white":"text-white":dark?"bg-gray-800 text-gray-400 hover:bg-gray-700":"bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
            style={quickF===f.id&&!f.red?{background:"linear-gradient(135deg,#25D366,#128C7E)"}:{}}>
            {f.label}<span className={`px-1.5 py-0.5 rounded-full text-xs ${quickF===f.id?"bg-white/20 text-white":dark?"bg-gray-700 text-gray-300":"bg-gray-200 text-gray-600"}`}>{f.count}</span>
          </button>
        ))}
        <div className={`ml-auto flex items-center gap-2 text-xs ${dark?"text-gray-500":"text-gray-400"}`}>
          {filtered.length} results
          <button onClick={()=>selMode?clearSel():setSelMode(true)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition
              ${selMode?dark?"bg-blue-500/20 border-blue-500/40 text-blue-300":"bg-blue-50 border-blue-200 text-blue-600":dark?"border-gray-700 text-gray-400 hover:border-gray-500":"border-gray-200 text-gray-500 hover:border-gray-400"}`}>
            <Layers size={12}/>{selMode?"Exit":"Multi-Select"}
          </button>
        </div>
      </div>

      <div className={`flex flex-wrap gap-4 px-4 py-2.5 rounded-xl text-xs ${dark?"bg-gray-900/60 text-gray-500":"bg-gray-100 text-gray-400"}`}>
        <span>✦ <strong>Double-click</strong> any cell to edit inline</span>
        <span>✦ <strong>Single-click</strong> green WA button → opens WhatsApp</span>
        <span>✦ <strong>Long-press / hold</strong> a row on mobile to enter multi-select</span>
        <span>✦ Click 📄 icon to edit notes</span>
      </div>

      <div className={`rounded-2xl border overflow-hidden ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[960px]">
            <thead>
              <tr className={dark?"bg-gray-800/60":"bg-gray-50"}>
                {selMode&&<th className="px-3 py-3 w-10">
                  <button onClick={()=>selected.size===paginated.length?setSelected(new Set()):selectAll()}>
                    {selected.size===paginated.length?<CheckSquare size={15} className="text-green-400"/>:<Square size={15} className="text-gray-400"/>}
                  </button>
                </th>}
                {[{k:"id",l:"ID"},{k:"name",l:"Name"},{k:"phone",l:"Phone"},{k:"status",l:"Status"},{k:"followUpDate",l:"Follow-up"},{k:"lastContacted",l:"Last Contact"},{k:"city",l:"City"},{k:"source",l:"Source"},{k:null,l:"Actions"}].map(({k,l})=>(
                  <th key={l} onClick={()=>k&&sort(k)} className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide cursor-pointer ${dark?"text-gray-400 hover:text-white":"text-gray-500 hover:text-gray-900"}`}>
                    <div className="flex items-center gap-1">{l}{k&&<SortI col={k}/>}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length===0&&<tr><td colSpan={selMode?10:9} className={`px-4 py-12 text-center ${dark?"text-gray-500":"text-gray-400"}`}>No leads found</td></tr>}
              {paginated.map(lead=>(
                <LeadRow key={lead.id} lead={lead} dark={dark}
                  selMode={selMode} selected={selected.has(lead.id)}
                  onToggleSel={()=>toggleSel(lead.id)}
                  onLongPress={()=>{setSelMode(true);toggleSel(lead.id);}}
                  editCell={editCell} editVal={editVal} setEditVal={setEditVal}
                  onStartEdit={startEdit} onCommit={commitEdit} onCancel={cancelEdit} isEditing={isEditing}
                  onDelete={()=>setDelConf(lead.id)} onWA={()=>setWaModal(lead)}
                  onUpdateLead={upd=>setLeads(ls=>ls.map(l=>l.id===lead.id?{...l,...upd}:l))}
                />
              ))}
            </tbody>
          </table>
        </div>
        {totalPages>1&&(
          <div className={`flex items-center justify-between px-4 py-3 border-t ${dark?"border-gray-800 text-gray-400":"border-gray-200 text-gray-500"}`}>
            <span className="text-xs">Page {page} of {totalPages}</span>
            <div className="flex gap-1">
              <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className={`p-1.5 rounded-lg disabled:opacity-30 ${dark?"hover:bg-gray-800":"hover:bg-gray-100"}`}><ChevronLeft size={15}/></button>
              {Array.from({length:totalPages},(_,i)=>i+1).map((p,i,arr)=>(
                (p===1||p===totalPages||Math.abs(p-page)<=1)&&(
                  <span key={p} className="flex items-center">
                    {i>0&&arr[i-1]!==p-1&&<span className="px-1 text-gray-500">…</span>}
                    <button onClick={()=>setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium ${page===p?"text-white":dark?"hover:bg-gray-800":"hover:bg-gray-100"}`} style={page===p?{background:"#25D366"}:{}}>{p}</button>
                  </span>
                )
              ))}
              <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className={`p-1.5 rounded-lg disabled:opacity-30 ${dark?"hover:bg-gray-800":"hover:bg-gray-100"}`}><ChevronRight size={15}/></button>
            </div>
          </div>
        )}
      </div>

      {addModal&&<AddModal dark={dark} onClose={()=>setAddModal(false)} onAdd={lead=>{setLeads(ls=>[...ls,{...lead,id:nextId(ls),createdDate:today,lastContacted:null}]);setAddModal(false);}}/>}
      {impModal&&<ImportModal dark={dark} onClose={()=>setImpModal(false)} onImport={rows=>{setLeads(ls=>[...ls,...rows.map((r,i)=>({...r,id:nextId(ls)+i}))]);setImpModal(false);}}/>}
      {waModal&&<WhatsAppModal dark={dark} lead={waModal} templates={templates} onClose={()=>setWaModal(null)} onSend={lead=>setLeads(ls=>ls.map(l=>l.id===lead.id?{...l,lastContacted:today}:l))}/>}
      {delConf&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm shadow-2xl ${dark?"bg-gray-900 border border-gray-800":"bg-white"}`}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400"/></div>
              <h3 className={`font-semibold mb-1 ${dark?"text-white":"text-gray-900"}`}>Delete {delConf==="bulk"?`${selected.size} leads`:"this lead"}?</h3>
              <p className={`text-sm mb-5 ${dark?"text-gray-400":"text-gray-500"}`}>This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={()=>setDelConf(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
                <button onClick={()=>{if(delConf==="bulk"){setLeads(ls=>ls.filter(l=>!selected.has(l.id)));clearSel();}else setLeads(ls=>ls.filter(l=>l.id!==delConf));setDelConf(null);}} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── LEAD ROW ─────────────────────────────────────────────────────────────────
function LeadRow({lead,dark,selMode,selected,onToggleSel,onLongPress,editCell,editVal,setEditVal,onStartEdit,onCommit,onCancel,isEditing,onDelete,onWA,onUpdateLead}) {
  const timer=useRef(null);
  const didLong=useRef(false);

  const pDown=()=>{ didLong.current=false; timer.current=setTimeout(()=>{didLong.current=true;onLongPress();},600); };
  const pUp=()=>clearTimeout(timer.current);

  const dbl=(field,val)=>e=>{ e.stopPropagation(); if(!selMode) onStartEdit(lead.id,field,val); };
  const inp=`w-full px-2 py-1 rounded-lg border text-sm outline-none ring-2 ring-green-500/40 ${dark?"bg-gray-800 border-green-500/60 text-white":"bg-white border-green-400 text-gray-900"}`;
  const cell=`px-4 py-3 cursor-pointer select-none ${dark?"hover:bg-green-500/5":"hover:bg-green-50/60"} transition-colors`;
  const kdEvt=(e)=>{ if(e.key==="Enter")onCommit(); if(e.key==="Escape")onCancel(); };
  const overCls=isOverdue(lead.followUpDate)?"text-red-400 font-semibold":isToday(lead.followUpDate)?"text-green-400 font-semibold":dark?"text-gray-400":"text-gray-500";

  return (
    <tr onPointerDown={pDown} onPointerUp={pUp} onPointerLeave={pUp}
      onClick={()=>{ if(selMode)onToggleSel(); }}
      className={`border-t transition-colors ${dark?"border-gray-800":"border-gray-100"}
        ${selected?"bg-blue-500/10":""}
        ${isOverdue(lead.followUpDate)&&!selected?dark?"bg-red-500/5":"bg-red-50/40":""}
        ${selMode?"cursor-pointer":""}`}>
      {selMode&&<td className="px-3 py-3" onClick={e=>{e.stopPropagation();onToggleSel();}}>
        {selected?<CheckSquare size={16} className="text-green-400"/>:<Square size={16} className={dark?"text-gray-500":"text-gray-400"}/>}
      </td>}

      <td className={`px-4 py-3 text-xs ${dark?"text-gray-500":"text-gray-400"}`}>#{lead.id}</td>

      <td className={cell} onDoubleClick={dbl("name",lead.name)}>
        {isEditing(lead.id,"name")
          ? <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp} style={{minWidth:120}}/>
          : <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style={{background:`hsl(${lead.id*47%360},60%,50%)`}}>{lead.name[0]}</div>
              <span className={`font-medium text-sm ${dark?"text-gray-200":"text-gray-900"}`}>{lead.name}</span>
            </div>}
      </td>

      <td className={`${cell} font-mono text-xs ${dark?"text-gray-400":"text-gray-500"}`} onDoubleClick={dbl("phone",lead.phone)}>
        {isEditing(lead.id,"phone")?<input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp} style={{minWidth:130}}/>:`+${lead.phone}`}
      </td>

      <td className={cell} onDoubleClick={dbl("status",lead.status)}>
        {isEditing(lead.id,"status")
          ? <select autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp}>
              {STATUSES.map(s=><option key={s}>{s}</option>)}
            </select>
          : <StatusBadge status={lead.status}/>}
      </td>

      <td className={`${cell} text-xs ${overCls}`} onDoubleClick={dbl("followUpDate",lead.followUpDate||"")}>
        {isEditing(lead.id,"followUpDate")
          ? <input autoFocus type="date" value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp}/>
          : <span className="flex items-center gap-1">{isOverdue(lead.followUpDate)&&<AlertCircle size={11}/>}{lead.followUpDate?fmtDate(lead.followUpDate):"—"}</span>}
      </td>

      <td className={`px-4 py-3 text-xs ${dark?"text-gray-500":"text-gray-400"}`}>{lead.lastContacted?fmtDate(lead.lastContacted):"—"}</td>

      <td className={cell} onDoubleClick={dbl("city",lead.city||"")}>
        {isEditing(lead.id,"city")
          ? <input autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp} style={{minWidth:100}}/>
          : <span className={`text-sm ${dark?"text-gray-400":"text-gray-500"}`}>{lead.city||"—"}</span>}
      </td>

      <td className={cell} onDoubleClick={dbl("source",lead.source||"Website")}>
        {isEditing(lead.id,"source")
          ? <select autoFocus value={editVal} onChange={e=>setEditVal(e.target.value)} onBlur={onCommit} onKeyDown={kdEvt} onClick={e=>e.stopPropagation()} className={inp}>
              {SOURCES.map(s=><option key={s}>{s}</option>)}
            </select>
          : <span className={`text-xs ${dark?"text-gray-500":"text-gray-400"}`}>{lead.source||"—"}</span>}
      </td>

      <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center gap-1.5">
          <button onClick={onWA} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white active:scale-95 hover:opacity-90 transition-transform" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
            <Send size={12}/>WA
          </button>
          <NotesCell lead={lead} dark={dark} onSave={notes=>onUpdateLead({notes})}/>
          <button onClick={onDelete} className={`p-1.5 rounded-lg ${dark?"text-gray-500 hover:text-red-400 hover:bg-red-500/10":"text-gray-400 hover:text-red-500 hover:bg-red-50"}`}><Trash2 size={13}/></button>
        </div>
      </td>
    </tr>
  );
}

function NotesCell({lead,dark,onSave}) {
  const [open,setOpen]=useState(false);
  const [val,setVal]=useState(lead.notes||"");
  const ref=useRef();
  useEffect(()=>{ const h=e=>{ if(ref.current&&!ref.current.contains(e.target))setOpen(false); }; document.addEventListener("mousedown",h); return()=>document.removeEventListener("mousedown",h); },[]);
  const save=()=>{onSave(val);setOpen(false);};
  return (
    <div className="relative" ref={ref}>
      <button onClick={()=>{setVal(lead.notes||"");setOpen(!open);}} title={lead.notes||"Add notes"}
        className={`p-1.5 rounded-lg transition ${lead.notes?dark?"text-yellow-400 hover:bg-yellow-400/10":"text-yellow-500 hover:bg-yellow-50":dark?"text-gray-500 hover:text-gray-300 hover:bg-gray-800":"text-gray-400 hover:bg-gray-100"}`}>
        <FileText size={13}/>
      </button>
      {open&&(
        <div className={`absolute right-0 z-40 w-64 rounded-xl shadow-xl border p-3 ${dark?"bg-gray-900 border-gray-700":"bg-white border-gray-200"}`} style={{bottom:"calc(100% + 6px)"}}>
          <div className={`text-xs font-medium mb-2 ${dark?"text-gray-400":"text-gray-600"}`}>Notes — {lead.name}</div>
          <textarea value={val} onChange={e=>setVal(e.target.value)} rows={3} placeholder="Add notes…"
            className={`w-full px-3 py-2 rounded-lg border text-xs outline-none resize-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/>
          <div className="flex gap-2 mt-2">
            <button onClick={()=>setOpen(false)} className={`flex-1 py-1.5 rounded-lg text-xs ${dark?"bg-gray-800 text-gray-400":"bg-gray-100 text-gray-500"}`}>Cancel</button>
            <button onClick={save} className="flex-1 py-1.5 rounded-lg text-xs text-white font-medium" style={{background:"#25D366"}}>Save</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADD MODAL ────────────────────────────────────────────────────────────────
function AddModal({dark,onClose,onAdd}) {
  const [form,setForm]=useState({name:"",phone:"",status:"New",followUpDate:"",city:"",source:"Website",notes:""});
  const [err,setErr]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const submit=()=>{
    if(!form.name.trim()){setErr("Name is required");return;}
    if(!/^\d{10,15}$/.test(form.phone)){setErr("Phone: 10–15 digits with country code, e.g. 919876543210");return;}
    onAdd(form);
  };
  return (
    <Modal dark={dark} title="Add New Lead" onClose={onClose}>
      {err&&<div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">{err}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[{k:"name",l:"Full Name *",p:"Rahul Sharma"},{k:"phone",l:"Phone (country code) *",p:"919876543210"},{k:"city",l:"City",p:"Mumbai"}].map(({k,l,p})=>(
          <div key={k}><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>{l}</label>
          <input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/></div>
        ))}
        {[{k:"status",l:"Status",opts:STATUSES},{k:"source",l:"Source",opts:SOURCES}].map(({k,l,opts})=>(
          <div key={k}><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>{l}</label>
          <select value={form[k]} onChange={e=>set(k,e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}>
            {opts.map(o=><option key={o}>{o}</option>)}</select></div>
        ))}
        <div><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>Follow-up Date</label>
        <input type="date" value={form.followUpDate} onChange={e=>set("followUpDate",e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/></div>
      </div>
      <div className="mt-3"><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>Notes</label>
      <textarea value={form.notes} onChange={e=>set("notes",e.target.value)} rows={3} placeholder="Any notes…" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/></div>
      <div className="flex gap-3 mt-5">
        <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
        <button onClick={submit} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>Add Lead</button>
      </div>
    </Modal>
  );
}

// ─── IMPORT MODAL ─────────────────────────────────────────────────────────────
function ImportModal({dark,onClose,onImport}) {
  const [preview,setPreview]=useState(null);
  const [csv,setCsv]=useState("");
  const fileRef=useRef();

  const TEMPLATE_CSV=`name,phone,status,city,source,followUpDate,notes
Arjun Verma,919811223344,New,Delhi,Website,2026-03-15,Interested in plan A
Kavya Reddy,918877665544,Interested,Hyderabad,Referral,2026-03-18,Needs product demo
Suresh Nair,917766554433,Follow-up,Kochi,LinkedIn,2026-03-12,Called twice no answer
Meena Joshi,916655443322,Negotiation,Pune,Instagram,2026-03-20,Discussing pricing
Raj Kapoor,915544332211,New,Mumbai,Facebook Ads,,Found via ad campaign`;

  const parseCSV=(text)=>{
    const lines=text.trim().split("\n").filter(l=>l.trim());
    if(lines.length<2)return[];
    const headers=lines[0].split(",").map(h=>h.trim().toLowerCase().replace(/[\s_-]/g,""));
    return lines.slice(1).map(line=>{
      const vals=line.split(",").map(v=>v.trim().replace(/^"|"$/g,""));
      const o={};
      headers.forEach((h,i)=>{o[h]=vals[i]||"";});
      return {name:o.name||"Unknown",phone:o.phone||"",status:STATUSES.includes(o.status)?o.status:"New",city:o.city||"",source:SOURCES.includes(o.source)?o.source:"Website",followUpDate:o.followupdate||o.followup||"",notes:o.notes||"",createdDate:today,lastContacted:null};
    }).filter(l=>l.name&&l.phone);
  };

  const handle=(text)=>{setCsv(text);setPreview(parseCSV(text));};
  const onFile=(e)=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>handle(ev.target.result);r.readAsText(f);};

  const downloadTemplate=()=>{
    const a=document.createElement("a");a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(TEMPLATE_CSV);
    a.download="whatsapp_crm_import_template.csv";a.click();
  };

  return (
    <Modal dark={dark} title="Import Leads from CSV" onClose={onClose} wide>
      {/* Download template banner */}
      <div className={`flex items-center gap-3 p-4 rounded-xl border mb-4 ${dark?"bg-green-500/5 border-green-500/20":"bg-green-50 border-green-200"}`}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
          <Download size={18} className="text-white"/>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-semibold ${dark?"text-green-300":"text-green-700"}`}>📥 Download Import Template</div>
          <div className={`text-xs mt-0.5 ${dark?"text-green-500/80":"text-green-600"}`}>Pre-filled CSV with correct columns + 5 sample rows</div>
        </div>
        <button onClick={downloadTemplate} className="px-4 py-2 rounded-xl text-sm font-semibold text-white flex-shrink-0 active:scale-95 transition"
          style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>Download</button>
      </div>

      <div className={`p-3 rounded-xl text-xs mb-3 ${dark?"bg-gray-800 text-gray-400":"bg-blue-50 text-blue-700"}`}>
        <strong>Required columns:</strong> name, phone (no +, e.g. 919876543210)
        &nbsp;|&nbsp; <strong>Optional:</strong> status, city, source, followUpDate (YYYY-MM-DD), notes
      </div>

      <div className={`p-5 rounded-xl border-2 border-dashed text-center cursor-pointer mb-3 transition
        ${dark?"border-gray-700 hover:border-green-500/50 bg-gray-800/20":"border-gray-200 hover:border-green-300 bg-gray-50"}`}
        onClick={()=>fileRef.current.click()}>
        <Upload size={21} className="mx-auto text-gray-400 mb-2"/>
        <p className={`text-sm font-medium ${dark?"text-gray-300":"text-gray-600"}`}>Click to upload CSV file</p>
        <p className={`text-xs mt-1 ${dark?"text-gray-500":"text-gray-400"}`}>or paste CSV data below</p>
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={onFile}/>
      </div>

      <textarea value={csv} onChange={e=>handle(e.target.value)} rows={5} placeholder={TEMPLATE_CSV}
        className={`w-full px-3 py-2.5 rounded-xl border text-xs outline-none resize-none font-mono mb-4 ${dark?"bg-gray-800 border-gray-700 text-white placeholder:text-gray-600":"bg-gray-50 border-gray-300 placeholder:text-gray-400"}`}/>

      {preview&&(
        <div className="mb-4">
          <div className={`flex items-center gap-2 mb-2 text-sm font-medium ${dark?"text-gray-300":"text-gray-700"}`}>
            <CheckCircle size={14} className="text-green-400"/>{preview.length} leads ready to import
          </div>
          <div className={`rounded-xl border overflow-hidden ${dark?"border-gray-700":"border-gray-200"}`}>
            <div className="overflow-x-auto max-h-44">
              <table className="w-full text-xs min-w-[480px]">
                <thead className={dark?"bg-gray-800 text-gray-400":"bg-gray-100 text-gray-500"}>
                  <tr>{["Name","Phone","Status","City","Source"].map(h=><th key={h} className="px-3 py-2 text-left font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>{preview.slice(0,10).map((l,i)=>(
                  <tr key={i} className={`border-t ${dark?"border-gray-700 text-gray-300":"border-gray-200 text-gray-700"}`}>
                    <td className="px-3 py-1.5">{l.name}</td><td className="px-3 py-1.5 font-mono">{l.phone}</td>
                    <td className="px-3 py-1.5"><StatusBadge status={l.status}/></td>
                    <td className="px-3 py-1.5">{l.city||"—"}</td><td className="px-3 py-1.5">{l.source}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
        <button onClick={()=>preview&&onImport(preview)} disabled={!preview||!preview.length}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
          Import {preview?`${preview.length} Lead${preview.length!==1?"s":""}`:""}</button>
      </div>
    </Modal>
  );
}

// ─── WHATSAPP MODAL ───────────────────────────────────────────────────────────
function WhatsAppModal({dark,lead,templates,onClose,onSend}) {
  const [tmpl,setTmpl]=useState(templates[0]);
  const [custom,setCustom]=useState("");
  const [sent,setSent]=useState(false);
  const msg=tmpl?tmpl.message.replace(/{name}/g,lead.name):custom;
  const link=`https://wa.me/${lead.phone}?text=${encodeURIComponent(msg)}`;
  const go=()=>{window.open(link,"_blank");onSend(lead);setSent(true);setTimeout(onClose,1400);};
  return (
    <Modal dark={dark} title="Send WhatsApp Message" onClose={onClose}>
      {sent?(
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-green-400"/></div>
          <div className={`font-semibold ${dark?"text-white":"text-gray-900"}`}>WhatsApp opened!</div>
          <div className={`text-sm mt-1 ${dark?"text-gray-400":"text-gray-500"}`}>Last contacted date updated ✓</div>
        </div>
      ):(
        <div className="space-y-4">
          <div className={`flex items-center gap-3 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{background:`hsl(${lead.id*47%360},60%,50%)`}}>{lead.name[0]}</div>
            <div className="flex-1 min-w-0"><div className={`font-medium text-sm ${dark?"text-white":"text-gray-900"}`}>{lead.name}</div><div className={`text-xs ${dark?"text-gray-400":"text-gray-500"}`}>+{lead.phone} · {lead.city||"N/A"}</div></div>
            <StatusBadge status={lead.status}/>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-2 ${dark?"text-gray-400":"text-gray-600"}`}>Choose Template</label>
            <div className="flex flex-wrap gap-2">
              {templates.map(t=>(
                <button key={t.id} onClick={()=>{setTmpl(t);setCustom("");}}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${tmpl?.id===t.id?"border-green-500 bg-green-500/10 text-green-400":dark?"border-gray-700 text-gray-400 hover:border-gray-500":"border-gray-200 text-gray-600 hover:border-gray-400"}`}>
                  {t.name}
                </button>
              ))}
              <button onClick={()=>{setTmpl(null);setCustom("");}} className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition ${!tmpl?"border-green-500 bg-green-500/10 text-green-400":dark?"border-gray-700 text-gray-400":"border-gray-200 text-gray-600"}`}>✏️ Custom</button>
            </div>
          </div>
          {tmpl
            ? <div className={`p-4 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${dark?"bg-gray-800 text-gray-200":"bg-green-50 text-gray-800"}`}>{msg}</div>
            : <textarea value={custom} onChange={e=>setCustom(e.target.value)} rows={4} placeholder={`Hi ${lead.name}, …`} className={`w-full px-3 py-3 rounded-xl border text-sm outline-none resize-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/>}
          <div className={`flex items-center gap-2 p-2.5 rounded-xl text-xs ${dark?"bg-gray-800 text-gray-500":"bg-gray-50 text-gray-400"}`}>
            <ExternalLink size={11} className="flex-shrink-0"/>
            <span className="truncate flex-1">{link.substring(0,72)}…</span>
            <button onClick={()=>navigator.clipboard?.writeText(link)} className="text-green-400 flex-shrink-0"><Copy size={11}/></button>
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className={`flex-1 py-3 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
            <button onClick={go} disabled={!msg.trim()} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-40 active:scale-95 transition" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>
              <Send size={15}/>Open in WhatsApp
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ─── TEMPLATES PAGE ───────────────────────────────────────────────────────────
function TemplatesPage({templates,setTemplates,dark}) {
  const [showAdd,setShowAdd]=useState(false);
  const [editId,setEditId]=useState(null);
  const [form,setForm]=useState({name:"",message:""});
  const [preview,setPreview]=useState("Rahul");
  const [delId,setDelId]=useState(null);
  const startAdd=()=>{setForm({name:"",message:""});setEditId(null);setShowAdd(true);};
  const startEdit=(t)=>{setForm({name:t.name,message:t.message});setEditId(t.id);setShowAdd(true);};
  const save=()=>{
    if(!form.name.trim()||!form.message.trim())return;
    if(editId)setTemplates(ts=>ts.map(t=>t.id===editId?{...t,...form}:t));
    else setTemplates(ts=>[...ts,{id:Date.now(),...form}]);
    setShowAdd(false);setEditId(null);
  };
  return (
    <div className="p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h3 className={`font-semibold ${dark?"text-white":"text-gray-900"}`}>{templates.length} Templates</h3>
        <p className={`text-sm ${dark?"text-gray-400":"text-gray-500"}`}>Use <code className="bg-green-500/20 text-green-400 px-1 rounded">{"{name}"}</code> as placeholder</p></div>
        <button onClick={startAdd} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}><Plus size={14}/>New Template</button>
      </div>
      <div className={`flex items-center gap-3 p-3 rounded-xl border ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
        <span className={`text-sm ${dark?"text-gray-400":"text-gray-500"}`}>Preview with name:</span>
        <input value={preview} onChange={e=>setPreview(e.target.value)} className={`flex-1 max-w-xs px-3 py-1.5 rounded-lg border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {templates.map(t=>(
          <div key={t.id} className={`rounded-2xl border flex flex-col ${dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200"}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${dark?"border-gray-800":"border-gray-200"}`}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}><MessageSquare size={13} className="text-white"/></div>
                <span className={`font-semibold text-sm ${dark?"text-white":"text-gray-900"}`}>{t.name}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={()=>startEdit(t)} className={`p-1.5 rounded-lg ${dark?"text-gray-400 hover:text-white hover:bg-gray-800":"text-gray-400 hover:bg-gray-100"}`}><Edit3 size={13}/></button>
                <button onClick={()=>setDelId(t.id)} className={`p-1.5 rounded-lg ${dark?"text-gray-400 hover:text-red-400 hover:bg-red-500/10":"text-gray-400 hover:text-red-500 hover:bg-red-50"}`}><Trash2 size={13}/></button>
              </div>
            </div>
            <div className="px-4 pt-3 pb-2 flex-1">
              <div className={`text-xs uppercase tracking-wide font-medium mb-1 ${dark?"text-gray-500":"text-gray-400"}`}>Template</div>
              <p className={`text-sm whitespace-pre-wrap leading-relaxed ${dark?"text-gray-300":"text-gray-600"}`}>{t.message}</p>
            </div>
            <div className="px-4 pb-3">
              <div className={`text-xs uppercase tracking-wide font-medium mb-1.5 ${dark?"text-gray-500":"text-gray-400"}`}>Preview → "{preview}"</div>
              <div className={`p-3 rounded-xl text-sm whitespace-pre-wrap leading-relaxed ${dark?"bg-gray-800 text-gray-300":"bg-green-50 text-gray-700"}`}>{t.message.replace(/{name}/g,preview||"Customer")}</div>
              <button onClick={()=>navigator.clipboard?.writeText(t.message.replace(/{name}/g,preview||"Customer"))}
                className={`mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs border transition ${dark?"border-gray-700 text-gray-400 hover:border-green-500 hover:text-green-400":"border-gray-200 text-gray-500 hover:border-green-400 hover:text-green-600"}`}>
                <Copy size={11}/>Copy Message
              </button>
            </div>
          </div>
        ))}
        <button onClick={startAdd} className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-8 min-h-48 transition ${dark?"border-gray-700 text-gray-500 hover:border-green-500 hover:text-green-400 hover:bg-green-500/5":"border-gray-200 text-gray-400 hover:border-green-400 hover:bg-green-50"}`}>
          <Plus size={28} className="mb-2 opacity-60"/><span className="text-sm font-medium">Add Template</span>
        </button>
      </div>
      {showAdd&&(
        <Modal dark={dark} title={editId?"Edit Template":"New Template"} onClose={()=>{setShowAdd(false);setEditId(null);}}>
          <div className="space-y-4">
            <div><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>Template Name</label>
            <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="e.g. Casual, Formal…" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/></div>
            <div><label className={`block text-xs font-medium mb-1 ${dark?"text-gray-400":"text-gray-600"}`}>Message (use {"{name}"})</label>
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} rows={5} placeholder="Hi {name} 👋 …" className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none ${dark?"bg-gray-800 border-gray-700 text-white":"bg-gray-50 border-gray-300"}`}/></div>
            {form.message&&<div className={`p-3 rounded-xl text-sm ${dark?"bg-gray-800 text-gray-300":"bg-green-50 text-gray-700"}`}><div className={`text-xs font-medium mb-1 ${dark?"text-gray-500":"text-gray-400"}`}>Preview:</div>{form.message.replace(/{name}/g,preview||"Customer")}</div>}
            <div className="flex gap-3">
              <button onClick={()=>{setShowAdd(false);setEditId(null);}} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
              <button onClick={save} disabled={!form.name.trim()||!form.message.trim()} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-40" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>{editId?"Save Changes":"Create Template"}</button>
            </div>
          </div>
        </Modal>
      )}
      {delId&&(
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl p-6 w-full max-w-sm ${dark?"bg-gray-900 border border-gray-800":"bg-white"}`}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 size={22} className="text-red-400"/></div>
              <h3 className={`font-semibold mb-1 ${dark?"text-white":"text-gray-900"}`}>Delete Template?</h3>
              <div className="flex gap-3 mt-5">
                <button onClick={()=>setDelId(null)} className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${dark?"bg-gray-800 text-gray-300":"bg-gray-100 text-gray-600"}`}>Cancel</button>
                <button onClick={()=>{setTemplates(ts=>ts.filter(t=>t.id!==delId));setDelId(null);}} className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500 text-white">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── HOSTING GUIDE ────────────────────────────────────────────────────────────
function HostingGuide({dark,onClose}) {
  const [tab,setTab]=useState(0);
  const bg=dark?"bg-gray-900 border-gray-800":"bg-white border-gray-200";
  const txt=dark?"text-gray-200":"text-gray-800";
  const sub=dark?"text-gray-400":"text-gray-500";
  const Code=({children})=><pre className={`${dark?"bg-gray-800 text-green-400":"bg-gray-900 text-green-400"} rounded-xl px-4 py-3 text-xs font-mono overflow-x-auto my-2 leading-relaxed whitespace-pre-wrap`}>{children}</pre>;
  const Step=({n,title,children})=>(
    <div className="flex gap-4 mb-5">
      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}>{n}</div>
      <div className="flex-1 min-w-0"><div className={`font-semibold text-sm mb-1 ${txt}`}>{title}</div><div className={`text-sm leading-relaxed ${sub}`}>{children}</div></div>
    </div>
  );
  const tabs=[{l:"Vercel",i:<Zap size={13}/>},{l:"Netlify",i:<Globe size={13}/>},{l:"Firebase",i:<Server size={13}/>},{l:"VPS",i:<Terminal size={13}/>},{l:"Database",i:<BookOpen size={13}/>}];

  const panels=[
    <div>
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}><CheckCircle size={14} className="text-green-400 flex-shrink-0"/><span className={`text-sm font-medium ${dark?"text-gray-200":"text-gray-700"}`}>Easiest option — free forever for personal use, deploys in ~2 minutes.</span></div>
      <Step n="1" title="Install Node.js and create project"><Code>{`# 1. Download Node.js 18+ from nodejs.org
# 2. Then run in terminal:
npm create vite@latest whatsapp-crm -- --template react
cd whatsapp-crm
npm install recharts lucide-react`}</Code></Step>
      <Step n="2" title="Add your app code">Replace <code className="text-green-400 bg-gray-800 px-1 rounded">src/App.jsx</code> with the downloaded whatsapp-crm.jsx file.<br/><br/>
        Add Tailwind CSS to <code className="text-green-400 bg-gray-800 px-1 rounded">index.html</code> inside &lt;head&gt;:<Code>{`<script src="https://cdn.tailwindcss.com"></script>`}</Code>
        Update <code className="text-green-400 bg-gray-800 px-1 rounded">src/main.jsx</code>:<Code>{`import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
ReactDOM.createRoot(document.getElementById('root')).render(<App/>)`}</Code></Step>
      <Step n="3" title="Test locally"><Code>{`npm run dev
# Visit http://localhost:5173`}</Code></Step>
      <Step n="4" title="Deploy to Vercel (free)"><Code>{`npm install -g vercel
vercel login     # sign in with GitHub or email
vercel           # follow prompts → live in 60 seconds!
# Your URL: https://whatsapp-crm-xxx.vercel.app`}</Code>
      Or: push to GitHub → go to <strong>vercel.com/new</strong> → import repo → deploy. Auto-deploys on every push.</Step>
      <Step n="5" title="Custom domain (optional)">In Vercel dashboard → Settings → Domains → Add your domain. Free SSL included automatically.</Step>
    </div>,

    <div>
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}><CheckCircle size={14} className="text-green-400 flex-shrink-0"/><span className={`text-sm font-medium ${dark?"text-gray-200":"text-gray-700"}`}>Drag-and-drop deployment. Free tier includes 100GB/month bandwidth.</span></div>
      <Step n="1" title="Build the project">Follow Vercel steps 1–3 to create the project, then:<Code>{`npm run build
# Outputs to: dist/`}</Code></Step>
      <Step n="2" title="Drag & Drop Deploy">Go to <strong>app.netlify.com → Sites</strong> → drag your <code className="text-green-400 bg-gray-800 px-1 rounded">dist/</code> folder onto the page. Live in 30 seconds!</Step>
      <Step n="3" title="Or deploy via CLI"><Code>{`npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist`}</Code></Step>
      <Step n="4" title="Custom domain">Netlify dashboard → Site settings → Domain management → Add custom domain. Free HTTPS auto-configured.</Step>
    </div>,

    <div>
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}><Info size={14} className="text-blue-400 flex-shrink-0"/><span className={`text-sm font-medium ${dark?"text-gray-200":"text-gray-700"}`}>Firebase Hosting + Firestore = real-time data sync across all devices.</span></div>
      <Step n="1" title="Create Firebase project">Go to <strong>console.firebase.google.com</strong> → New Project → Enable Firestore (test mode) + Hosting.</Step>
      <Step n="2" title="Install & initialize"><Code>{`npm install firebase
npm install -g firebase-tools
firebase login
firebase init   # choose: Firestore + Hosting, dist as public dir`}</Code></Step>
      <Step n="3" title="Connect Firebase to your app">Create <code className="text-green-400 bg-gray-800 px-1 rounded">src/firebase.js</code>:<Code>{`import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

export const db = getFirestore(initializeApp({
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_APP.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  // Copy all values from Firebase Console → Project Settings
}));`}</Code></Step>
      <Step n="4" title="Replace useState with Firestore real-time listener"><Code>{`import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";

// Real-time listener (replaces useState initial value)
useEffect(() => {
  return onSnapshot(collection(db, "leads"), snap => {
    setLeads(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}, []);

// Add
await addDoc(collection(db, "leads"), newLead);
// Update  
await updateDoc(doc(db, "leads", lead.id), changes);
// Delete
await deleteDoc(doc(db, "leads", lead.id));`}</Code></Step>
      <Step n="5" title="Deploy"><Code>{`npm run build
firebase deploy
# Live at https://YOUR-APP.web.app`}</Code></Step>
    </div>,

    <div>
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}><Shield size={14} className="text-purple-400 flex-shrink-0"/><span className={`text-sm font-medium ${dark?"text-gray-200":"text-gray-700"}`}>Full control. Use DigitalOcean, Hetzner, or AWS. ~$5–$12/month.</span></div>
      <Step n="1" title="Get a VPS and install dependencies"><Code>{`# Ubuntu 22.04 server
sudo apt update && sudo apt upgrade -y
sudo apt install nginx -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y`}</Code></Step>
      <Step n="2" title="Build and upload your app"><Code>{`# On local machine:
npm run build

# Upload dist/ to server:
scp -r dist/ root@YOUR_IP:/var/www/whatsapp-crm/`}</Code></Step>
      <Step n="3" title="Configure Nginx"><Code>{`# /etc/nginx/sites-available/whatsapp-crm
server {
  listen 80;
  server_name yourdomain.com;
  root /var/www/whatsapp-crm;
  index index.html;
  location / { try_files $uri /index.html; }
}

sudo ln -s /etc/nginx/sites-available/whatsapp-crm /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx`}</Code></Step>
      <Step n="4" title="Free HTTPS with Let's Encrypt"><Code>{`sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com
# Auto-renews every 90 days`}</Code></Step>
    </div>,

    <div>
      <div className={`flex items-center gap-2 mb-4 p-3 rounded-xl ${dark?"bg-gray-800":"bg-gray-50"}`}><Info size={14} className="text-blue-400 flex-shrink-0"/><span className={`text-sm font-medium ${dark?"text-gray-200":"text-gray-700"}`}>Currently data resets on page refresh. Connect a database to persist everything.</span></div>
      <Step n="1" title="Option A: Supabase (recommended — free PostgreSQL)">
        1. Go to <strong>supabase.com</strong> → New Project<br/>
        2. Open SQL Editor and run:<Code>{`create table leads (
  id           bigserial primary key,
  name         text not null,
  phone        text not null,
  status       text default 'New',
  follow_up_date date,
  last_contacted date,
  notes        text,
  city         text,
  source       text,
  created_date date default now()
);
alter table leads enable row level security;
create policy "all" on leads for all using (true);`}</Code>
        3. Install SDK:<Code>{`npm install @supabase/supabase-js`}</Code>
        4. Create <code className="text-green-400 bg-gray-800 px-1 rounded">src/supabase.js</code>:<Code>{`import { createClient } from "@supabase/supabase-js";
export const sb = createClient(
  "https://YOUR_PROJECT.supabase.co",
  "YOUR_ANON_KEY"   // Project Settings → API
);`}</Code>
        5. Replace state with Supabase calls:<Code>{`// Fetch
const { data } = await sb.from("leads").select("*");
setLeads(data);

// Add
await sb.from("leads").insert([newLead]);

// Update
await sb.from("leads").update(changes).eq("id", lead.id);

// Delete
await sb.from("leads").delete().eq("id", lead.id);

// Real-time (add to useEffect)
sb.channel("leads")
  .on("postgres_changes", { event:"*", schema:"public", table:"leads" },
    () => fetchLeads())
  .subscribe();`}</Code>
      </Step>
      <Step n="2" title="Option B: Airtable (zero-code, beginner friendly)">Create an Airtable base with a Leads table matching the columns. Install <code className="text-green-400 bg-gray-800 px-1 rounded">npm install airtable</code> and use their REST API. Perfect if you prefer a spreadsheet-like admin interface.</Step>
      <Step n="3" title="Option C: localStorage (offline, no setup)">For a single-device personal CRM with no server, wrap your state with localStorage:<Code>{`// Save on every update
useEffect(() => {
  localStorage.setItem("crm_leads", JSON.stringify(leads));
}, [leads]);

// Load on startup
const [leads, setLeads] = useState(() => {
  const saved = localStorage.getItem("crm_leads");
  return saved ? JSON.parse(saved) : SAMPLE_LEADS;
});`}</Code></Step>
    </div>
  ];

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-2xl w-full max-w-3xl shadow-2xl border my-4 ${bg}`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark?"border-gray-800":"border-gray-200"}`}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,#25D366,#128C7E)"}}><Rocket size={17} className="text-white"/></div>
            <div><h3 className={`font-bold ${dark?"text-white":"text-gray-900"}`}>How to Go Live</h3><p className={`text-xs ${dark?"text-gray-400":"text-gray-500"}`}>Deployment & database setup guide</p></div>
          </div>
          <button onClick={onClose} className={`p-2 rounded-xl ${dark?"text-gray-400 hover:bg-gray-800":"text-gray-400 hover:bg-gray-100"}`}><X size={18}/></button>
        </div>
        <div className={`flex gap-1 p-3 border-b overflow-x-auto ${dark?"border-gray-800":"border-gray-200"}`}>
          {tabs.map(({l,i},idx)=>(
            <button key={idx} onClick={()=>setTab(idx)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${tab===idx?"text-white":dark?"text-gray-400 hover:bg-gray-800":"text-gray-500 hover:bg-gray-100"}`}
              style={tab===idx?{background:"linear-gradient(135deg,#25D366,#128C7E)"}:{}}>{i}{l}</button>
          ))}
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto">{panels[tab]}</div>
        <div className={`p-4 border-t rounded-b-2xl ${dark?"border-gray-800 bg-gray-800/30":"border-gray-200 bg-gray-50"}`}>
          <div className={`flex items-start gap-2 text-xs ${dark?"text-gray-500":"text-gray-400"}`}>
            <Info size={12} className="flex-shrink-0 mt-0.5"/>
            <span><strong className={dark?"text-gray-300":"text-gray-600"}>Recommended for most people:</strong> Vercel (hosting, free) + Supabase (database, free). Both require no credit card and take under 30 minutes total.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({dark,title,onClose,children,wide}) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`rounded-2xl w-full shadow-2xl my-auto ${wide?"max-w-2xl":"max-w-lg"} ${dark?"bg-gray-900 border border-gray-800":"bg-white"}`}>
        <div className={`flex items-center justify-between p-5 border-b ${dark?"border-gray-800":"border-gray-200"}`}>
          <h3 className={`font-semibold ${dark?"text-white":"text-gray-900"}`}>{title}</h3>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${dark?"text-gray-400 hover:text-white hover:bg-gray-800":"text-gray-400 hover:bg-gray-100"}`}><X size={17}/></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
