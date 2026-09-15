import { useState, useEffect, useRef } from "react";
import { TREES } from "./data/trees";
import { DEFAULT_TAGS } from "./data/tags";
import { useHistory } from "./hooks/useHistory";
import { useLocalState } from "./hooks/useLocalState";
import { fmt, fmtDuration } from "./utils/format";
import { saveActiveSession, loadActiveSession, clearActiveSession } from "./utils/activeSession";
import { F, W } from "./styles";
import PixelCloud from "./components/PixelCloud";
import { TreeRing } from "./components/TreeRing";
import Stats from "./screens/Stats";


// ======= MAIN =======
export default function App() {
  const [screen,setScreen] = useState("home");
  const [selTree,setSelTree] = useState(0);
  const [selTag,setSelTag] = useState(0);
  const [tags,setTags] = useLocalState("blank_tags", DEFAULT_TAGS);
  const [addingTag,setAddingTag] = useState(false);
  const [newTagName,setNewTagName] = useState("");
  const [renamingTag,setRenamingTag] = useState(-1);
  const [renameText,setRenameText] = useState("");
  const [deleteMode,setDeleteMode] = useState(false);
  const [confirmDelete,setConfirmDelete] = useState(null); // {index, label} or null
  const [userName,setUserName] = useLocalState("blank_userName", "园长");   // kept here so identity survives home↔stats nav
  const [userAvatar,setUserAvatar] = useLocalState("blank_userAvatar", "pine");
  const [duration,setDuration] = useState(0);
  const [timeLeft,setTimeLeft] = useState(0);
  const [totalTime,setTotalTime] = useState(0);
  const [treeStage,setTreeStage] = useState(0);
  const startTimeRef = useRef(null);   // wall-clock start, so the timer survives backgrounding
  const completedRef = useRef(false);  // guards against double-completion (timer tick + resume/give-up race)
  const {records,addRecord,importRecords} = useHistory();

  const isStopwatch = duration === 0;

  const startFocus = () => {
    startTimeRef.current = Date.now();
    completedRef.current = false;
    if(isStopwatch) {
      setTimeLeft(0); setTotalTime(0); // stopwatch: count up from 0
    } else {
      const d=duration*60; setTimeLeft(d); setTotalTime(d); // countdown
    }
    setTreeStage(0); setScreen("focus");
    // persist the running session so it survives a full page kill
    saveActiveSession({ startTime: startTimeRef.current, duration, tag: tags[selTag].id, tree: TREES[selTree].id });
  };

  // completing a countdown: plant the tree, record, and show the done screen
  const finishFocus = () => {
    if(completedRef.current) return;
    completedRef.current = true;
    clearActiveSession();
    setTreeStage(3);
    addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration,completed:true});
    bumpTag(selTag);
    setScreen("done");
  };

  const bumpTag = (idx) => {
    if(idx <= 0) return; // already first
    setTags(prev => {
      const t = [...prev];
      const [used] = t.splice(idx, 1);
      t.unshift(used);
      return t;
    });
    setSelTag(0);
  };

  useEffect(()=>{
    if(screen!=="focus") return;
    // Derive time from a wall-clock start instead of counting ticks, so a
    // throttled/paused interval (backgrounded tab, locked phone) stays accurate.
    const tick = () => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if(totalTime===0) {
        setTimeLeft(elapsed); // stopwatch: count up, no auto-end
      } else {
        const remaining = totalTime - elapsed;
        if(remaining<=0){ setTimeLeft(0); finishFocus(); }
        else setTimeLeft(remaining);
      }
    };
    const id = setInterval(tick, 1000);
    // re-sync the instant we return to the foreground, don't wait for the next tick
    const onVisible = () => { if(!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVisible);
    return ()=>{ clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  },[screen,totalTime]);

  useEffect(()=>{
    if(screen!=="focus") return;
    if(totalTime===0) {
      // stopwatch: grow based on elapsed time
      const elapsedMin = timeLeft / 60;
      if(elapsedMin<5) setTreeStage(0); else if(elapsedMin<15) setTreeStage(1); else if(elapsedMin<30) setTreeStage(2); else setTreeStage(3);
    } else {
      const p=1-timeLeft/totalTime;
      if(p<.15) setTreeStage(0); else if(p<.4) setTreeStage(1); else if(p<.7) setTreeStage(2); else setTreeStage(3);
    }
  },[timeLeft,totalTime,screen]);

  // Restore a running session left over from a previous page load (e.g. the OS
  // killed the backgrounded tab). Elapsed time is recomputed from the stored start.
  useEffect(()=>{
    const s = loadActiveSession();
    if(!s) return;
    const treeIdx = Math.max(0, TREES.findIndex(t=>t.id===s.tree));
    const tagIdx = tags.findIndex(t=>t.id===s.tag);
    const safeTagIdx = tagIdx>=0 ? tagIdx : Math.max(0, tags.findIndex(t=>t.id==="uncategorized"));
    const total = s.duration*60; // 0 for stopwatch
    const elapsed = Math.floor((Date.now()-s.startTime)/1000);

    startTimeRef.current = s.startTime;
    setSelTree(treeIdx);
    setSelTag(safeTagIdx);
    setDuration(s.duration);
    setTotalTime(total);

    if(total>0 && elapsed>=total){
      // countdown already finished while the app was gone → plant & record it now
      completedRef.current = true;
      clearActiveSession();
      setTimeLeft(0);
      setTreeStage(3);
      addRecord({tag:s.tag,tree:s.tree,duration:s.duration,completed:true});
      setScreen("done");
    } else {
      // still running → resume where it left off
      completedRef.current = false;
      setTimeLeft(total>0 ? total-elapsed : elapsed);
      setScreen("focus");
    }
  },[]); // once on mount

  const giveUp = ()=>{
    completedRef.current = true; // stop the timer tick from also finishing
    clearActiveSession();
    if(totalTime===0) {
      // stopwatch: record elapsed time — but skip empty (0-min) sessions
      const elapsedMin = Math.floor(timeLeft/60);
      if(elapsedMin>0) {
        addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration:elapsedMin,completed:true});
        bumpTag(selTag);
        setScreen("done");
      } else {
        setScreen("home");
      }
    } else {
      addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration,completed:false});
      setScreen("home");
    }
  };

  const todayRecs = records.filter(r=>r.date.toDateString()===new Date().toDateString()&&r.completed);
  const todayMin = todayRecs.reduce((s,r)=>s+r.duration,0);

  const ringSize = 260;

  // ---- HOME ----
  if(screen==="home") return (
    <div style={W.wrap}>
      <div style={W.top}>
        <span></span>
        <button onClick={()=>setScreen("stats")} style={{background:"none",border:"none",fontSize:13,color:"#8a8078",cursor:"pointer",fontFamily:F}}>统计 →</button>
      </div>


      {/* center area: ring + tree name, vertically centered */}
      <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:0}}>
        <div style={{fontSize:15,color:"#b0a898",fontFamily:F,marginBottom:16,letterSpacing:0.5}}>
          今日已专注 {fmtDuration(todayMin)}
        </div>
        {/* ring with smart gesture: outer edge = dial, center = swipe tree */}
        <div
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const rect = e.currentTarget.getBoundingClientRect();
            const x = touch.clientX - rect.left - rect.width/2;
            const y = touch.clientY - rect.top - rect.height/2;
            const dist = Math.sqrt(x*x + y*y);
            const ringR = ringSize/2 - 18;
            // if touch is far from ring (inside center area), track for swipe
            if(dist < ringR - 25) {
              e.currentTarget._swipeX = touch.clientX;
            } else {
              e.currentTarget._swipeX = null;
            }
          }}
          onTouchEnd={(e) => {
            const startX = e.currentTarget._swipeX;
            if(startX == null) return;
            const delta = e.changedTouches[0].clientX - startX;
            if(Math.abs(delta) > 50) {
              setSelTree(p => delta < 0 ? (p+1)%TREES.length : (p-1+TREES.length)%TREES.length);
            }
            e.currentTarget._swipeX = null;
          }}
        >
          <TreeRing treeId={TREES[selTree].id} stage={3} duration={duration} onDurationChange={setDuration} ringSize={ringSize} />
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginTop:4}}>
          <button onClick={()=>setSelTree(p=>(p-1+TREES.length)%TREES.length)}
            style={{background:"none",border:"none",fontSize:18,color:"#c4a882",cursor:"pointer",padding:"4px 8px"}}>‹</button>
          <span style={{fontSize:13,color:"#8a8078",letterSpacing:1}}>{TREES[selTree].emoji} {TREES[selTree].name}</span>
          <button onClick={()=>setSelTree(p=>(p+1)%TREES.length)}
            style={{background:"none",border:"none",fontSize:18,color:"#c4a882",cursor:"pointer",padding:"4px 8px"}}>›</button>
        </div>

        <div style={{display:"flex",gap:6,justifyContent:"center",marginTop:6}}>
          {TREES.map((_,i)=><div key={i} style={W.dot(i===selTree)}/>)}
        </div>

        {/* tags: + fixed left, scrollable tags middle, - fixed right */}
        <div style={{display:"flex",alignItems:"center",padding:"40px 12px 0",gap:8,width:"100%",boxSizing:"border-box"}}>
          {/* fixed - button on left */}
          {tags.length > 1 && (
            <button onClick={()=>setDeleteMode(d=>!d)}
              style={{flexShrink:0,width:32,height:32,borderRadius:16,border:deleteMode?"1.5px solid #e04040":"1.5px dashed #d8d0c4",background:deleteMode?"#e04040":"transparent",color:deleteMode?"#fff":"#b0a898",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>−</button>
          )}

          {/* scrollable tags */}
          <div style={{flex:1,display:"flex",gap:8,overflowX:"auto",overflowY:"visible",scrollbarWidth:"none",WebkitOverflowScrolling:"touch",minWidth:0,padding:"8px 4px"}} className="no-sb">
            {tags.map((t,i)=>{
              if(renamingTag===i) return (
                <input key={t.id} autoFocus value={renameText}
                  onChange={e=>setRenameText(e.target.value)}
                  onKeyDown={e=>{
                    if(e.key==="Enter"){
                      if(renameText.trim()) setTags(prev=>prev.map((tag,j)=>j===i?{...tag,label:renameText.trim().slice(0,16)}:tag));
                      setRenamingTag(-1);
                    }
                    if(e.key==="Escape") setRenamingTag(-1);
                  }}
                  onBlur={()=>{
                    if(renameText.trim()) setTags(prev=>prev.map((tag,j)=>j===i?{...tag,label:renameText.trim().slice(0,16)}:tag));
                    setRenamingTag(-1);
                  }}
                  style={{flexShrink:0,width:72,padding:"5px 10px",borderRadius:20,border:"1.5px solid #3a3530",fontSize:16,fontFamily:F,background:"transparent",color:"#3a3530",outline:"none"}}
                />
              );
              let pressTimer = null;
              const isProtected = t.id === "uncategorized";
              return (
                <div key={t.id} style={{position:"relative",flexShrink:0}}>
                  <button
                    onClick={(e)=>{ e.stopPropagation(); if(!deleteMode) setSelTag(i); }}
                    onPointerDown={(e)=>{ if(!deleteMode && !isProtected) pressTimer=setTimeout(()=>{setRenamingTag(i);setRenameText(t.label);},500); }}
                    onPointerUp={()=>clearTimeout(pressTimer)}
                    onPointerLeave={()=>clearTimeout(pressTimer)}
                    style={{...W.tag(i===selTag && !deleteMode), animation: deleteMode && !isProtected ? "wobble 0.3s infinite alternate" : "none"}}
                  >{t.label}</button>
                  {deleteMode && !isProtected && tags.length > 1 && (
                    <button
                      onPointerDown={(e)=>e.stopPropagation()}
                      onClick={(e)=>{
                        e.stopPropagation();
                        e.preventDefault();
                        setConfirmDelete({index:i, label:t.label});
                      }}
                      style={{position:"absolute",top:-6,right:-6,width:20,height:20,borderRadius:10,background:"#e04040",color:"#fff",fontSize:12,fontWeight:700,border:"2px solid #faf6ee",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,zIndex:10}}>×</button>
                  )}
                </div>
              );
            })}
          </div>

          {/* fixed + button on right */}
          {addingTag ? (
            <input
              autoFocus
              value={newTagName}
              onChange={e=>setNewTagName(e.target.value)}
              onKeyDown={e=>{
                if(e.key==="Enter"){
                  if(newTagName.trim()) setTags(prev=>[...prev,{id:`custom_${Date.now()}`,label:newTagName.trim().slice(0,16)}]);
                  setNewTagName("");setAddingTag(false);
                }
                if(e.key==="Escape"){setNewTagName("");setAddingTag(false);}
              }}
              onBlur={()=>{
                if(newTagName.trim()) setTags(prev=>[...prev,{id:`custom_${Date.now()}`,label:newTagName.trim().slice(0,16)}]);
                setNewTagName("");setAddingTag(false);
              }}
              placeholder="新标签" maxLength={16}
              style={{flexShrink:0,width:72,padding:"5px 10px",borderRadius:20,border:"1.5px solid #3a3530",fontSize:16,fontFamily:F,background:"transparent",color:"#3a3530",outline:"none"}}
            />
          ) : (
            <button onClick={()=>setAddingTag(true)}
              style={{flexShrink:0,width:32,height:32,borderRadius:16,border:"1.5px dashed #d8d0c4",background:"transparent",color:"#b0a898",fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          )}
        </div>
        <style>{`@keyframes wobble { from { transform: rotate(-1deg); } to { transform: rotate(1deg); } }`}</style>
      </div>

      {/* bottom: start button only */}
      <div style={{flexShrink:0,paddingBottom:80}}>
        <div style={{padding:"20px 20px 0"}}>
          <button onClick={startFocus}
            style={W.btn("#3a3530","#faf6ee")}>{isStopwatch ? "开始正计时" : "开始专注"}</button>
        </div>
      </div>
      <style>{`.no-sb::-webkit-scrollbar{display:none}`}</style>

      {/* confirm delete modal */}
      {confirmDelete && (
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,53,48,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}
          onClick={()=>{setConfirmDelete(null);setDeleteMode(false);}}>
          <div onClick={e=>e.stopPropagation()}>
            <PixelCloud width={260}>
              <div style={{fontSize:13,color:"#3a3530",fontFamily:F,marginBottom:4}}>删除标签</div>
              <div style={{fontSize:15,color:"#3a3530",fontWeight:600,fontFamily:F,marginBottom:4}}>「{confirmDelete.label}」</div>
              <div style={{fontSize:11,color:"#b0a898",fontFamily:F,marginBottom:14}}>删除后无法恢复</div>
              <div style={{display:"flex",gap:8,width:"90%"}}>
                <button onClick={()=>{setConfirmDelete(null);setDeleteMode(false);}}
                  style={{flex:1,padding:"8px 0",borderRadius:8,background:"transparent",border:"1.5px solid #d8d0c4",color:"#8a8078",fontSize:12,fontFamily:F,cursor:"pointer"}}>取消</button>
                <button onClick={()=>{
                  const idx = confirmDelete.index;
                  setTags(prev=>prev.filter((_,j)=>j!==idx));
                  if(selTag>=idx && selTag>0) setSelTag(selTag-1);
                  setDeleteMode(false);
                  setConfirmDelete(null);
                }}
                  style={{flex:1,padding:"8px 0",borderRadius:8,background:"#e04040",border:"none",color:"#fff",fontSize:12,fontFamily:F,fontWeight:600,cursor:"pointer"}}>确认删除</button>
              </div>
            </PixelCloud>
          </div>
        </div>
      )}
    </div>
  );

  // ---- FOCUS ----
  if(screen==="focus"){
    const isStopwatchMode = totalTime === 0;
    return (
      <div style={{...W.wrap,alignItems:"center",justifyContent:"center"}}>
        <div style={{position:"absolute",top:16,right:20,fontSize:11,color:"#b0a898"}}>{tags[selTag].label}</div>
        <TreeRing treeId={TREES[selTree].id} stage={treeStage} duration={duration}
          onDurationChange={()=>{}} ringSize={ringSize}
          isFocus={fmt(isStopwatchMode ? timeLeft : timeLeft)}
          timeLeft={timeLeft} totalTime={totalTime}
          stopwatch={isStopwatchMode} />
        <div style={{padding:"28px 40px 28px",width:"100%",boxSizing:"border-box"}}>
          <button onClick={giveUp} style={W.btn("transparent","#c4a882")}>{isStopwatchMode ? "结束专注" : "结束"}</button>
        </div>
      </div>
    );
  }

  // ---- DONE ----
  if(screen==="done"){
    const elapsedMin = totalTime===0 ? Math.floor(timeLeft/60) : duration;
    return (
    <div style={{...W.wrap,alignItems:"center",justifyContent:"center"}}>
      <TreeRing treeId={TREES[selTree].id} stage={treeStage} duration={duration}
        onDurationChange={()=>{}} ringSize={ringSize} isFocus={`${elapsedMin} 分钟`}
        timeLeft={totalTime===0?timeLeft:0} totalTime={totalTime} stopwatch={totalTime===0} focusLabel="" />
      <div style={{fontSize:15,fontWeight:500,marginTop:8}}>种好了 🎉</div>
      <div style={{fontSize:13,color:"#8a8078",marginTop:4}}>{tags[selTag].label}</div>
      <div style={{padding:"24px 40px 28px",width:"100%",boxSizing:"border-box"}}>
        <button onClick={()=>setScreen("home")} style={W.btn("#3a3530","#faf6ee")}>回到主页</button>
      </div>
    </div>
    );
  }

  // ---- STATS ----
  return <Stats records={records} tags={tags} setTags={setTags} importRecords={importRecords}
    userName={userName} setUserName={setUserName} userAvatar={userAvatar} setUserAvatar={setUserAvatar}
    onBack={()=>setScreen("home")} />;
}
