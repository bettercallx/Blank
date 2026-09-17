import { useState, useRef } from "react";
import { TREES } from "../data/trees";
import { F, W } from "../styles";
import PixelCloud from "../components/PixelCloud";
import { treePixels } from "../components/treePixels";
import MiniTree from "../components/MiniTree";
import { parseForestCSV } from "../utils/importCSV";
import { fmtDuration, fmtDurationShort } from "../utils/format";

export default function Stats({ records, tags, setTags, importRecords, userName, setUserName, userAvatar, setUserAvatar, demo, setDemo, onBack }) {
  const [showSettings,setShowSettings] = useState(false);
  const [settingsName,setSettingsName] = useState("");
  const [statsPeriod,setStatsPeriod] = useState("day"); // day/week/month/year
  const [statsDate,setStatsDate] = useState(new Date());
  const [activeBar,setActiveBar] = useState(null);
  const [activePie,setActivePie] = useState(null);
  const [showForest,setShowForest] = useState(false);
  const [showTreeStats,setShowTreeStats] = useState(false);
  const [activeHourPt,setActiveHourPt] = useState(null);
  const [activeDayPt,setActiveDayPt] = useState(null);
  const [expandDist,setExpandDist] = useState(false);
  const importRef = useRef(null);

  // In demo mode, show a fixed sample identity instead of the real user's — the
  // real userName/userAvatar are left untouched (settings are disabled in demo).
  const displayName = demo ? "k" : userName;
  const displayAvatar = demo ? "fumeshroom" : userAvatar;

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { records: imported, tagNames } = parseForestCSV(ev.target.result);

      // Resolve each Forest tag name to a tag id: reuse an existing tag with the
      // same label (merge), otherwise create a new one. Unset tags → blank.
      const idByLabel = new Map(tags.map(t => [t.label, t.id]));
      const usedIds = new Set(tags.map(t => t.id));
      const additions = [];
      tagNames.forEach(name => {
        if(idByLabel.has(name)) return;            // same-named tag already exists → merge
        let id = name.toLowerCase().replace(/\s+/g,"_") || `tag_${additions.length}`;
        while(usedIds.has(id)) id = `${id}_`;       // avoid colliding with a different tag's id
        usedIds.add(id);
        idByLabel.set(name, id);
        additions.push({ id, label: name });
      });

      const resolved = imported.map(({ tagName, ...r }) => ({
        ...r,
        tag: tagName ? idByLabel.get(tagName) : "uncategorized",
      }));

      if(additions.length) setTags(prev => [...prev, ...additions]);
      importRecords(resolved);
      alert(`导入成功！${resolved.length} 条记录，${additions.length} 个新标签`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // Full backup for migrating web → app
  const exportJSON = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("blank_")) data[k] = localStorage.getItem(k);
    }
    const payload = { app: "blank", exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `blank-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const todayRecs = records.filter(r=>r.date.toDateString()===new Date().toDateString()&&r.completed);
  const todayMin = todayRecs.reduce((s,r)=>s+r.duration,0);

  // How far navigation can reach: back to the oldest record, forward to today.
  // (Derived from real data, so imported history — e.g. back to 2018 — is reachable.)
  const now = new Date();
  const startOfDay = (d) => { const x=new Date(d); x.setHours(0,0,0,0); return x; };
  const weekStart = (d) => { const x=startOfDay(d); x.setDate(x.getDate()-x.getDay()); return x; };
  const earliestRec = records.length ? new Date(Math.min(...records.map(r=>r.date.getTime()))) : now;
  // Always allow navigating back to at least the start of this week — so a brand-new
  // user isn't stuck on "today" — and further back when older data exists.
  const earliest = new Date(Math.min(earliestRec.getTime(), weekStart(now).getTime()));
  const atBackLimit =
    statsPeriod==="day"   ? startOfDay(statsDate) <= startOfDay(earliest) :
    statsPeriod==="week"  ? weekStart(statsDate).getTime() <= weekStart(earliest).getTime() :
    statsPeriod==="month" ? (statsDate.getFullYear()<earliest.getFullYear() || (statsDate.getFullYear()===earliest.getFullYear() && statsDate.getMonth()<=earliest.getMonth())) :
                            statsDate.getFullYear() <= earliest.getFullYear();
  const atFwdLimit =
    statsPeriod==="day"   ? statsDate.toDateString()===now.toDateString() :
    statsPeriod==="week"  ? weekStart(statsDate).getTime() >= weekStart(now).getTime() :
    statsPeriod==="month" ? (statsDate.getMonth()===now.getMonth() && statsDate.getFullYear()===now.getFullYear()) :
                            statsDate.getFullYear()===now.getFullYear();

  return (
    <div style={W.wrap}>
      <div style={{...W.top,display:"flex",justifyContent:demo?"flex-end":"space-between",alignItems:"center"}}>
        {!demo && <button onClick={onBack} style={{background:"none",border:"none",fontSize:13,color:"#8a8078",cursor:"pointer",fontFamily:F}}>← 返回</button>}
        <button onClick={()=>setDemo(d=>!d)} style={{background:"none",border:"none",fontSize:13,color:demo?"#b0a898":"#4a9e5c",fontWeight:demo?400:600,cursor:"pointer",fontFamily:F,display:"inline-flex",alignItems:"center",gap:4}}>
          {demo ? "退出示例 ✕" : <><MiniTree treeId="fumeshroom" size={17} />看看示例 →</>}
        </button>
      </div>
      {demo && (
        <div style={{background:"#eef6ef",color:"#4a9e5c",fontSize:12,fontFamily:F,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 12px"}}>
          <MiniTree treeId={displayAvatar} size={15} />示例数据预览 仅供参考,不会保存到你的记录
        </div>
      )}
      <div style={{flex:1,padding:"0 20px 32px",overflowY:"auto"}}>
        <div style={{...W.card,marginTop:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={W.lbl}>今日专注</div>
              <div style={W.val}>{todayMin>=60?<>{Math.floor(todayMin/60)}<span style={W.unit}>小时</span>{todayMin%60>0&&<>{todayMin%60}<span style={W.unit}>分钟</span></>}</>:<>{todayMin}<span style={W.unit}>分钟</span></>}</div>
              <div style={{fontSize:12,color:"#8a8078",marginTop:4}}>{todayRecs.length} 次专注</div>
            </div>
            <button onClick={()=>{ if(demo) return; setShowSettings(true); setSettingsName(userName); }}
              style={{background:"none",border:"none",cursor:demo?"default":"pointer",padding:4,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <svg width={48} height={48} viewBox="0 0 48 48" style={{imageRendering:"pixelated"}}>
                {treePixels(displayAvatar, 3, 3)}
              </svg>
              <span style={{fontSize:12,color:"#8a8078",fontFamily:F}}>{displayName||"guest"}</span>
              {!demo && <span style={{fontSize:9,color:"#c4baa8",fontFamily:F}}>setting</span>}
            </button>
          </div>
        </div>

        {/* settings modal */}
        {showSettings && (
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,53,48,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}
            onClick={()=>setShowSettings(false)}>
            <div onClick={e=>e.stopPropagation()}>
              <PixelCloud width={300}>
                <div style={{fontSize:14,fontWeight:600,color:"#3a3530",fontFamily:F,marginBottom:12}}>植物园园长</div>

                <input value={settingsName} onChange={e=>setSettingsName(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Enter"&&settingsName.trim()) { setUserName(settingsName.trim()); }}}
                  style={{width:"90%",padding:"8px 14px",borderRadius:8,border:"2px solid #e0d8cc",fontSize:16,fontFamily:F,background:"#f5f0e8",color:"#3a3530",outline:"none",textAlign:"center",boxSizing:"border-box",marginBottom:14}}
                />

                <div style={{display:"flex",flexWrap:"wrap",gap:6,justifyContent:"center",marginBottom:14}}>
                  {TREES.map(t=>(
                    <button key={t.id} onClick={()=>setUserAvatar(t.id)}
                      style={{width:44,height:44,borderRadius:10,border:userAvatar===t.id?"2px solid #3a3530":"2px solid #e8e0d6",
                        background:userAvatar===t.id?"#f0ebe2":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:2}}>
                      <svg width={32} height={32} viewBox="0 0 32 32" style={{imageRendering:"pixelated"}}>
                        {treePixels(t.id, 3, 2)}
                      </svg>
                    </button>
                  ))}
                </div>

                <button onClick={()=>{
                  if(settingsName.trim()) setUserName(settingsName.trim());
                  setShowSettings(false);
                }}
                  style={{padding:"8px 0",width:"90%",borderRadius:8,background:"#3a3530",color:"#faf6ee",fontSize:13,fontFamily:F,fontWeight:600,border:"none",cursor:"pointer"}}>保存</button>

                <button onClick={()=>importRef.current?.click()}
                  style={{marginTop:8,padding:"8px 0",width:"90%",borderRadius:8,background:"transparent",border:"1.5px solid #d8d0c4",color:"#8a8078",fontSize:12,fontFamily:F,cursor:"pointer"}}>📂 导入 CSV 数据</button>
                <input ref={importRef} type="file" accept=".csv" onChange={handleImportCSV} style={{display:"none"}} />

                <button onClick={exportJSON}
                  style={{marginTop:8,padding:"8px 0",width:"90%",borderRadius:8,background:"transparent",border:"1.5px solid #d8d0c4",color:"#8a8078",fontSize:12,fontFamily:F,cursor:"pointer"}}>💾 导出 Blank 数据</button>

                <button onClick={()=>{
                  if(confirm("恢复默认标签、名字和头像？专注记录不受影响")){
                    localStorage.removeItem('blank_tags');
                    localStorage.removeItem('blank_userName');
                    localStorage.removeItem('blank_userAvatar');
                    window.location.reload();
                  }
                }}
                  style={{marginTop:12,padding:"8px 0",width:"90%",borderRadius:8,background:"transparent",border:"1px solid #e8e0d6",color:"#b0a898",fontSize:11,fontFamily:F,cursor:"pointer"}}>
                  🔄 恢复默认设置
                </button>
              </PixelCloud>
            </div>
          </div>
        )}

        {/* period tabs */}
        <div style={{display:"flex",gap:0,marginTop:8,background:"#f0ebe2",borderRadius:10,padding:3}}>
          {[["day","日"],["week","周"],["month","月"],["year","年"]].map(([k,l])=>(
            <button key={k} onClick={()=>setStatsPeriod(k)}
              style={{flex:1,padding:"6px 0",borderRadius:8,fontSize:12,fontFamily:F,border:"none",cursor:"pointer",
                background:statsPeriod===k?"#faf6ee":"transparent",color:statsPeriod===k?"#3a3530":"#b0a898",fontWeight:statsPeriod===k?600:400}}>{l}</button>
          ))}
        </div>

        {/* date navigation */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,padding:"10px 0"}}>
          <button onClick={()=>{
            if(atBackLimit) return;
            const d=new Date(statsDate);
            if(statsPeriod==="day") d.setDate(d.getDate()-1);
            else if(statsPeriod==="week") d.setDate(d.getDate()-7);
            else if(statsPeriod==="month") d.setMonth(d.getMonth()-1);
            else d.setFullYear(d.getFullYear()-1);
            setStatsDate(d);
          }} style={{background:"none",border:"none",fontSize:16,color:atBackLimit?"#e8e0d6":"#c4a882",cursor:"pointer"}}>‹</button>
          <span style={{fontSize:13,color:"#3a3530",fontFamily:F,minWidth:140,textAlign:"center"}}>
            {statsPeriod==="day" && `${statsDate.getFullYear()}年${statsDate.getMonth()+1}月${statsDate.getDate()}日`}
            {statsPeriod==="week" && (()=>{ const s=new Date(statsDate);s.setDate(s.getDate()-s.getDay());return `${s.getMonth()+1}月${s.getDate()}日 - ${s.getMonth()+1}月${s.getDate()+6}日`; })()}
            {statsPeriod==="month" && `${statsDate.getFullYear()}年${statsDate.getMonth()+1}月`}
            {statsPeriod==="year" && `${statsDate.getFullYear()}年`}
          </span>
          <button onClick={()=>{
            if(atFwdLimit) return;
            const d=new Date(statsDate);
            if(statsPeriod==="day") d.setDate(d.getDate()+1);
            else if(statsPeriod==="week") d.setDate(d.getDate()+7);
            else if(statsPeriod==="month") d.setMonth(d.getMonth()+1);
            else d.setFullYear(d.getFullYear()+1);
            setStatsDate(d);
          }} style={{background:"none",border:"none",fontSize:16,color:atFwdLimit?"#e8e0d6":"#c4a882",cursor:"pointer"}}>›</button>
        </div>

        {/* filter records by period */}
        {(()=>{
          const sd = statsDate;
          let filtered = records.filter(r=>r.completed);
          if(statsPeriod==="day") filtered=filtered.filter(r=>r.date.toDateString()===sd.toDateString());
          else if(statsPeriod==="week"){ const start=new Date(sd);start.setDate(start.getDate()-start.getDay());const end=new Date(start);end.setDate(end.getDate()+7); filtered=filtered.filter(r=>r.date>=start&&r.date<end); }
          else if(statsPeriod==="month") filtered=filtered.filter(r=>r.date.getMonth()===sd.getMonth()&&r.date.getFullYear()===sd.getFullYear());
          else filtered=filtered.filter(r=>r.date.getFullYear()===sd.getFullYear());

          const totalMin = filtered.reduce((s,r)=>s+r.duration,0);
          const treeCount = filtered.reduce((s,r)=>s+Math.max(1,Math.ceil(r.duration/60)),0);

          // block 1: forest count — each session gives ceil(duration/60) trees
          const treeIcons = [];
          filtered.forEach(r=>{
            const count = Math.max(1,Math.ceil(r.duration/60));
            for(let j=0;j<count;j++) treeIcons.push(r.tree);
          });

          // trend: compare with previous period (only for current period)
          const now = new Date();
          const isCurrent = (statsPeriod==="day" && sd.toDateString()===now.toDateString())
            || (statsPeriod==="week" && (() => { const ws=new Date(now);ws.setDate(ws.getDate()-ws.getDay());const ss=new Date(sd);ss.setDate(ss.getDate()-ss.getDay()); return ws.toDateString()===ss.toDateString(); })())
            || (statsPeriod==="month" && sd.getMonth()===now.getMonth()&&sd.getFullYear()===now.getFullYear())
            || (statsPeriod==="year" && sd.getFullYear()===now.getFullYear());

          let trendMin = null;
          if(isCurrent) {
            let prevFiltered = records.filter(r=>r.completed);
            if(statsPeriod==="day") {
              const yd = new Date(now); yd.setDate(yd.getDate()-1);
              prevFiltered = prevFiltered.filter(r=>r.date.toDateString()===yd.toDateString());
            } else if(statsPeriod==="week") {
              const start=new Date(now);start.setDate(start.getDate()-start.getDay()-7);
              const end=new Date(start);end.setDate(end.getDate()+7);
              prevFiltered = prevFiltered.filter(r=>r.date>=start&&r.date<end);
            } else if(statsPeriod==="month") {
              const pm=now.getMonth()===0?11:now.getMonth()-1;
              const py=now.getMonth()===0?now.getFullYear()-1:now.getFullYear();
              prevFiltered = prevFiltered.filter(r=>r.date.getMonth()===pm&&r.date.getFullYear()===py);
            } else {
              prevFiltered = prevFiltered.filter(r=>r.date.getFullYear()===now.getFullYear()-1);
            }
            const prevMin = prevFiltered.reduce((s,r)=>s+r.duration,0);
            trendMin = totalMin - prevMin;
          }

          const fmtTrend = (m) => fmtDuration(Math.abs(m));
          const trendLabel = statsPeriod==="day"?"较昨日":statsPeriod==="week"?"较上周":statsPeriod==="month"?"较上月":"较去年";

          // block 2: hourly histogram (day view) or daily bars (week/month/year)
          let barData = [];
          if(statsPeriod==="day"){
            for(let h=0;h<24;h++){
              const hRecs=filtered.filter(r=>r.date.getHours()===h);
              barData.push({label:h%6===0?`${h}:00`:"",value:hRecs.reduce((s,r)=>s+r.duration,0)});
            }
          } else if(statsPeriod==="week"){
            const dayL=["日","一","二","三","四","五","六"];
            const start=new Date(sd);start.setDate(start.getDate()-start.getDay());
            for(let d=0;d<7;d++){
              const day=new Date(start);day.setDate(day.getDate()+d);
              const dRecs=filtered.filter(r=>r.date.toDateString()===day.toDateString());
              barData.push({label:dayL[d],value:dRecs.reduce((s,r)=>s+r.duration,0)});
            }
          } else if(statsPeriod==="month"){
            const daysInMonth=new Date(sd.getFullYear(),sd.getMonth()+1,0).getDate();
            for(let d=1;d<=daysInMonth;d++){
              const dRecs=filtered.filter(r=>r.date.getDate()===d);
              barData.push({label:d%7===1?`${d}`:"",value:dRecs.reduce((s,r)=>s+r.duration,0)});
            }
          } else {
            for(let m=0;m<12;m++){
              const mRecs=filtered.filter(r=>r.date.getMonth()===m);
              barData.push({label:`${m+1}月`,value:mRecs.reduce((s,r)=>s+r.duration,0)});
            }
          }
          const barMax = Math.max(...barData.map(b=>b.value),1);

          // block 3: tag distribution
          const pTagStats={};
          filtered.forEach(r=>{pTagStats[r.tag]=(pTagStats[r.tag]||0)+r.duration;});
          const tagEntries=Object.entries(pTagStats).sort((a,b)=>b[1]-a[1]);
          const pieColors=["#4a9e5c","#e8a735","#5b8fd9","#d46a8a","#8b6fc0","#e07845","#48b5a0","#c4a040"];

          // block 4: favorite tree
          const treeCounts={};
          filtered.forEach(r=>{treeCounts[r.tree]=(treeCounts[r.tree]||0)+Math.max(1,Math.ceil(r.duration/60));});
          const favTrees=Object.entries(treeCounts).sort((a,b)=>b[1]-a[1]);

          return <>
            {/* block 1: forest */}
            <div style={W.card}>
              <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:4}}>
                <MiniTree treeId={displayAvatar} size={16} />
                <span style={{fontSize:13,color:"#8a8078",fontFamily:F}}>{treeCount}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:8,maxHeight:52,overflow:"hidden",alignItems:"center"}}
                onClick={()=>{if(treeIcons.length>20) setShowForest(true);}}>
                {treeIcons.length>0 ? treeIcons.map((tid,i)=><MiniTree key={i} treeId={tid} size={18} />) :
                  <span style={{fontSize:12,color:"#d8d0c4"}}>还没有种树</span>}
                {treeIcons.length>20 && <span style={{fontSize:14,color:"#b0a898",cursor:"pointer",letterSpacing:2}}>···</span>}
              </div>
            </div>

            {/* forest full view modal */}
            {showForest && (
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,53,48,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}
                onClick={()=>setShowForest(false)}>
                <div onClick={e=>e.stopPropagation()}>
                  <PixelCloud width={300}>
                    <div style={{fontSize:14,fontWeight:600,color:"#3a3530",fontFamily:F,marginBottom:4,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                      <MiniTree treeId={displayAvatar} size={18} />{treeCount}
                    </div>
                    <div style={{fontSize:11,color:"#b0a898",fontFamily:F,marginBottom:12}}>
                      {statsPeriod==="day"?"今日":""}
                      {statsPeriod==="week"?"本周":""}
                      {statsPeriod==="month"?"本月":""}
                      {statsPeriod==="year"?"今年":""}
                      种下
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",maxHeight:240,overflowY:"auto"}}>
                      {treeIcons.map((tid,i)=><MiniTree key={i} treeId={tid} size={20} />)}
                    </div>
                    <button onClick={()=>setShowForest(false)}
                      style={{marginTop:12,padding:"6px 0",width:"80%",borderRadius:8,background:"#3a3530",color:"#faf6ee",fontSize:12,fontFamily:F,border:"none",cursor:"pointer"}}>关闭</button>
                  </PixelCloud>
                </div>
              </div>
            )}


            {/* best focus time — week/month/year only, above histogram */}
            {statsPeriod!=="day" && filtered.length>0 && (()=>{
              const hourlyMin = Array(24).fill(0);
              filtered.forEach(r=>{ hourlyMin[r.date.getHours()] += r.duration; });
              const peakHour = hourlyMin.indexOf(Math.max(...hourlyMin));
              const hMax = Math.max(...hourlyMin,1);
              const chartW=260, chartH=60;
              const points = hourlyMin.map((v,h)=>{
                const x = (h/23)*chartW;
                const y = chartH - (v/hMax)*(chartH-8) - 4;
                return `${x},${y}`;
              }).join(" ");
              return (
                <div style={W.card}>
                  <div style={W.lbl}>每日最佳专注时段</div>
                  <div style={{fontSize:13,color:"#3a3530",fontFamily:F,marginTop:6}}>
                    平均每日在 <span style={{fontWeight:600,color:"#4a9e5c"}}>{String(peakHour).padStart(2,"0")}:00</span> 最专注
                  </div>
                  <svg width={chartW} height={chartH+20} viewBox={`0 0 ${chartW} ${chartH+20}`}
                    style={{marginTop:8,display:"block",width:"100%",overflow:"visible",position:"relative",zIndex:2}} onPointerLeave={()=>setActiveHourPt(null)}>
                    {[0,0.25,0.5,0.75,1].map(p=>(
                      <line key={p} x1={0} y1={chartH-(chartH-8)*p-4} x2={chartW} y2={chartH-(chartH-8)*p-4}
                        stroke="#f0ebe2" strokeWidth={1}/>
                    ))}
                    <polygon points={`0,${chartH} ${points} ${chartW},${chartH}`}
                      fill="#4a9e5c" opacity={0.1}/>
                    <polyline points={points} fill="none" stroke="#4a9e5c" strokeWidth={2} strokeLinejoin="round"/>
                    {/* interactive points */}
                    {hourlyMin.map((v,h)=>{
                      if(v===0) return null;
                      const px = (h/23)*chartW;
                      const py = chartH-(v/hMax)*(chartH-8)-4;
                      const isActive = activeHourPt===h;
                      return <g key={h}>
                        {isActive && (
                          <g>
                            <rect x={px-18} y={py-22} width={36} height={18} rx={6} fill="#ffffff" stroke="#e8e0d6" strokeWidth={1}/>
                            <text x={px} y={py-12} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#3a3530"
                              fontFamily="'SF Mono','Menlo',monospace">{v}分</text>
                          </g>
                        )}
                        <circle cx={px} cy={py} r={isActive?5:h===peakHour?4:0} fill="#4a9e5c" stroke="#faf6ee" strokeWidth={2}/>
                        <circle cx={px} cy={py} r={12} fill="transparent"
                          onPointerEnter={()=>setActiveHourPt(h)}
                          onPointerDown={(e)=>{e.preventDefault();setActiveHourPt(h);}}
                          onPointerUp={()=>setActiveHourPt(null)}/>
                      </g>;
                    })}
                    {[0,6,12,18,23].map(h=>{
                      const x = (h/23)*chartW;
                      return <text key={h} x={x} y={chartH+14} textAnchor="middle" fontSize={9} fill="#b0a898"
                        fontFamily="'SF Mono','Menlo',monospace">{h}:00</text>;
                    })}
                  </svg>
                </div>
              );
            })()}

            {/* weekly best focus day — month/year only */}
            {(statsPeriod==="month"||statsPeriod==="year") && filtered.length>0 && (()=>{
              const dayL=["周日","周一","周二","周三","周四","周五","周六"];
              const dailyMin = Array(7).fill(0);
              filtered.forEach(r=>{ dailyMin[r.date.getDay()] += r.duration; });
              const peakDay = dailyMin.indexOf(Math.max(...dailyMin));
              const dMax = Math.max(...dailyMin,1);
              const chartW=260, chartH=60;
              const points = dailyMin.map((v,d)=>{
                const x = (d/6)*chartW;
                const y = chartH - (v/dMax)*(chartH-8) - 4;
                return `${x},${y}`;
              }).join(" ");
              return (
                <div style={W.card}>
                  <div style={W.lbl}>每周最佳专注日</div>
                  <div style={{fontSize:13,color:"#3a3530",fontFamily:F,marginTop:6}}>
                    平均每周在 <span style={{fontWeight:600,color:"#4a9e5c"}}>{dayL[peakDay]}</span> 最专注
                  </div>
                  <svg width={chartW} height={chartH+20} viewBox={`0 0 ${chartW} ${chartH+20}`}
                    style={{marginTop:8,display:"block",width:"100%",overflow:"visible",position:"relative",zIndex:2}} onPointerLeave={()=>setActiveDayPt(null)}>
                    {[0,0.25,0.5,0.75,1].map(p=>(
                      <line key={p} x1={0} y1={chartH-(chartH-8)*p-4} x2={chartW} y2={chartH-(chartH-8)*p-4}
                        stroke="#f0ebe2" strokeWidth={1}/>
                    ))}
                    <polygon points={`0,${chartH} ${points} ${chartW},${chartH}`}
                      fill="#4a9e5c" opacity={0.1}/>
                    <polyline points={points} fill="none" stroke="#4a9e5c" strokeWidth={2} strokeLinejoin="round"/>
                    {/* interactive points */}
                    {dailyMin.map((v,d)=>{
                      if(v===0) return null;
                      const px = (d/6)*chartW;
                      const py = chartH-(v/dMax)*(chartH-8)-4;
                      const isActive = activeDayPt===d;
                      const tipText = fmtDurationShort(v);
                      return <g key={d}>
                        {isActive && (
                          <g>
                            <rect x={px-22} y={py-22} width={44} height={18} rx={6} fill="#ffffff" stroke="#e8e0d6" strokeWidth={1}/>
                            <text x={px} y={py-12} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#3a3530"
                              fontFamily="'SF Mono','Menlo',monospace">{tipText}</text>
                          </g>
                        )}
                        <circle cx={px} cy={py} r={isActive?5:d===peakDay?4:0} fill="#4a9e5c" stroke="#faf6ee" strokeWidth={2}/>
                        <circle cx={px} cy={py} r={14} fill="transparent"
                          onPointerEnter={()=>setActiveDayPt(d)}
                          onPointerDown={(e)=>{e.preventDefault();setActiveDayPt(d);}}
                          onPointerUp={()=>setActiveDayPt(null)}/>
                      </g>;
                    })}
                    {dayL.map((l,d)=>{
                      const x = (d/6)*chartW;
                      return <text key={d} x={x} y={chartH+14} textAnchor="middle" fontSize={9} fill="#b0a898"
                        fontFamily="'SF Mono','Menlo',monospace">{l}</text>;
                    })}
                  </svg>
                </div>
              );
            })()}

            {/* block 2: focus time histogram */}
            <div style={W.card}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={W.lbl}>专注时间</div>
                <span style={{fontSize:12,color:"#8a8078",fontFamily:F}}>累计 {fmtDuration(totalMin)}</span>
              </div>
              {trendMin !== null && (
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:4}}>
                  <span style={{fontSize:11,color:"#b0a898",fontFamily:F}}>{trendLabel}</span>
                  <span style={{fontSize:12,fontWeight:600,fontFamily:F,
                    color:trendMin>0?"#4a9e5c":trendMin<0?"#d46a8a":"#8a8078"}}>
                    {trendMin>0?"↑":trendMin<0?"↓":"—"} {trendMin===0?"持平":fmtTrend(trendMin)}
                  </span>
                </div>
              )}
              <div style={{marginTop:10,position:"relative"}} onPointerLeave={()=>setActiveBar(null)}>
                <div style={{display:"flex",alignItems:"flex-end",gap:statsPeriod==="month"?1:2,height:70}}>
                  {barData.map((b,i)=>(
                    <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",minWidth:0,position:"relative"}}
                      onPointerDown={(e)=>{e.preventDefault();setActiveBar({index:i,value:b.value,label:b.label||`${i}`});}}
                      onPointerEnter={()=>setActiveBar({index:i,value:b.value,label:b.label||`${i}`})}
                      onPointerUp={()=>setActiveBar(null)}
                    >
                      {activeBar&&activeBar.index===i&&b.value>0&&(
                        <div style={{position:"absolute",bottom:"100%",marginBottom:4,background:"#ffffff",color:"#3a3530",
                          border:"1px solid #e8e0d6",fontSize:10,padding:"2px 8px",borderRadius:6,whiteSpace:"nowrap",zIndex:5,fontFamily:F,pointerEvents:"none"}}>
                          {fmtDurationShort(b.value)}
                        </div>
                      )}
                      <div style={{width:"100%",maxWidth:statsPeriod==="week"?16:undefined,height:Math.max(2,(b.value/barMax)*60),
                        background:activeBar&&activeBar.index===i?"#7bc88a":b.value>0?"#4a9e5c":"#e8e0d6",
                        borderRadius:2,transition:"height .3s"}}/>
                    </div>
                  ))}
                </div>
                <div style={{display:"flex",gap:statsPeriod==="month"?1:2,marginTop:2}}>
                  {barData.map((b,i)=>(
                    <div key={i} style={{flex:1,minWidth:0,textAlign:"center"}}>
                      {b.label && <span style={{fontSize:10,color:"#8a8078",whiteSpace:"nowrap"}}>{b.label}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* block 3: tag distribution donut */}
            <div style={W.card}>
              <div style={W.lbl}>专注分布</div>
              <div style={{display:"flex",alignItems:"center",gap:16,marginTop:10}}>
                {totalMin > 0 ? (
                  <svg width={80} height={80} viewBox="0 0 80 80" onPointerLeave={()=>setActivePie(null)}>
                    {(()=>{
                      let startAngle = -90;
                      return tagEntries.map(([tid,mins],i)=>{
                        const pct = mins/totalMin;
                        const angle = pct*360;
                        const endAngle = startAngle + angle;
                        const r=34, cx=40, cy=40;
                        const isActive = activePie===tid;
                        const scale = isActive ? "scale(1.08)" : "scale(1)";
                        const handlers = {
                          onPointerEnter:()=>setActivePie(tid),
                          onPointerDown:(e)=>{e.preventDefault();setActivePie(tid);},
                          onPointerUp:()=>setActivePie(null),
                          style:{transform:scale,transformOrigin:"40px 40px",transition:"transform 0.12s",cursor:"pointer"}
                        };
                        if(angle >= 359.9) {
                          startAngle=endAngle;
                          return <circle key={tid} cx={cx} cy={cy} r={r} fill={pieColors[i%pieColors.length]} {...handlers}/>;
                        }
                        const s1=(startAngle*Math.PI)/180, s2=(endAngle*Math.PI)/180;
                        const x1=cx+r*Math.cos(s1),y1=cy+r*Math.sin(s1);
                        const x2=cx+r*Math.cos(s2),y2=cy+r*Math.sin(s2);
                        const large=angle>180?1:0;
                        const d=`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                        startAngle=endAngle;
                        return <path key={tid} d={d} fill={pieColors[i%pieColors.length]} {...handlers}/>;
                      });
                    })()}
                    <circle cx={40} cy={40} r={18} fill="#f0ebe2"/>
                  </svg>
                ) : <div style={{width:80,height:80,borderRadius:40,background:"#e8e0d6"}}/>}
                <div style={{flex:1}}>
                  {(expandDist?tagEntries:tagEntries.slice(0,5)).map(([tid,mins],i)=>{
                    const tag=tags.find(t=>t.id===tid);
                    const pct=totalMin>0?Math.round(mins/totalMin*100):0;
                    const timeStr = fmtDurationShort(mins);
                    const isActive = activePie===tid;
                    return (
                      <div key={tid}
                        onPointerEnter={()=>setActivePie(tid)}
                        onPointerLeave={()=>setActivePie(null)}
                        style={{display:"flex",alignItems:"center",gap:6,marginBottom:4,padding:"3px 6px",borderRadius:6,
                          background:isActive?"#f0ebe2":"transparent",transform:isActive?"scale(1.03)":"scale(1)",
                          transition:"all 0.12s",cursor:"pointer"}}>
                        <div style={{width:8,height:8,borderRadius:4,background:pieColors[i%pieColors.length],flexShrink:0}}/>
                        <span style={{fontSize:11,color:isActive?"#3a3530":"#6a6258",fontWeight:isActive?600:400,flex:1}}>{tag?.label||tid}</span>
                        <span style={{fontSize:11,color:isActive?"#3a3530":"#8a8078",marginRight:4}}>{timeStr}</span>
                        <span style={{fontSize:11,color:isActive?"#3a3530":"#8a8078"}}>{pct}%</span>
                      </div>
                    );
                  })}
                  {tagEntries.length>5 && (
                    <button onClick={()=>setExpandDist(d=>!d)}
                      style={{background:"none",border:"none",fontSize:11,color:"#b0a898",cursor:"pointer",fontFamily:F,padding:"4px 6px",width:"100%",textAlign:"center"}}>
                      {expandDist?"收起 ↑":`查看全部 ${tagEntries.length} 项 ↓`}
                    </button>
                  )}
                  {tagEntries.length===0 && <span style={{fontSize:12,color:"#d8d0c4"}}>暂无数据</span>}
                </div>
              </div>
            </div>

            {/* block 4: favorite tree — top 3, tap for all */}
            <div style={W.card} onClick={()=>{if(favTrees.length>3) setShowTreeStats(true);}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={W.lbl}>最爱树种</div>
                {favTrees.length>3 && <span style={{fontSize:11,color:"#b0a898",fontFamily:F}}>···</span>}
              </div>
              <div style={{display:"flex",gap:16,marginTop:10}}>
                {favTrees.length>0 ? favTrees.slice(0,3).map(([tid,cnt],rank)=>{
                  const tree=TREES.find(t=>t.id===tid);
                  return (
                    <div key={tid} style={{display:"flex",alignItems:"center",gap:6}}>
                      <svg width={32} height={32} viewBox="0 0 32 32" style={{imageRendering:"pixelated"}}>
                        {treePixels(tid, 3, 2)}
                      </svg>
                      <div>
                        <div style={{fontSize:11,color:"#3a3530",fontFamily:F,fontWeight:rank===0?600:400}}>{tree?.name||tid}</div>
                        <div style={{fontSize:10,color:"#b0a898",fontFamily:F}}>{cnt} 次</div>
                      </div>
                    </div>
                  );
                }) : <span style={{fontSize:12,color:"#d8d0c4"}}>还没有种树</span>}
              </div>
            </div>

            {/* all tree stats modal */}
            {showTreeStats && (
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,53,48,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}
                onClick={()=>setShowTreeStats(false)}>
                <div onClick={e=>e.stopPropagation()}>
                  <PixelCloud width={300}>
                    <div style={{fontSize:14,fontWeight:600,color:"#3a3530",fontFamily:F,marginBottom:12}}>所有树种统计</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:14,justifyContent:"center",maxHeight:280,overflowY:"auto",padding:"4px 0"}}>
                      {favTrees.map(([tid,cnt])=>{
                        const tree=TREES.find(t=>t.id===tid);
                        return (
                          <div key={tid} style={{display:"flex",alignItems:"center",gap:6}}>
                            <svg width={32} height={32} viewBox="0 0 32 32" style={{imageRendering:"pixelated"}}>
                              {treePixels(tid, 3, 2)}
                            </svg>
                            <div>
                              <div style={{fontSize:11,color:"#3a3530",fontFamily:F}}>{tree?.name||tid}</div>
                              <div style={{fontSize:10,color:"#b0a898",fontFamily:F}}>{cnt} 次</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button onClick={()=>setShowTreeStats(false)}
                      style={{marginTop:12,padding:"6px 0",width:"80%",borderRadius:8,background:"#3a3530",color:"#faf6ee",fontSize:12,fontFamily:F,border:"none",cursor:"pointer"}}>关闭</button>
                  </PixelCloud>
                </div>
              </div>
            )}

          </>;
        })()}
      </div>
    </div>
  );
}
