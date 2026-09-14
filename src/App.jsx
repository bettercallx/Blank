import { useState, useEffect, useRef, useCallback } from "react";
import { TREES, TC, MAX_MIN } from "./data/trees";
import { DEFAULT_TAGS } from "./data/tags";
import { createSampleRecords } from "./data/sampleData";
import { useHistory } from "./hooks/useHistory";
import { fmt, fmtDuration, fmtDurationShort } from "./utils/format";
import { parseForestCSV } from "./utils/importCSV";
import { F, W } from "./styles";
import PixelCloud from "./components/PixelCloud";






// ---- Pixel Tree (returns just the pixel rects, no wrapping SVG) ----
function treePixels(treeId, stage, px) {
  const c = TC[treeId]||TC.pine;
  const els = [];
  let k = 0;
  const P = (x,y,color) => { els.push(<rect key={k++} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={color}/>); };

  // ground
  for(let x=0;x<16;x++) P(x,15,x%2===0?"#c4a882":"#b89e76");

  if(treeId==="bamboo"){
    const dark="#3a7d3a", mid="#5aad50", light="#7bc26e", node="#4d8844";
    if(stage===0){
      P(7,14,mid);P(8,14,mid);P(7,13,light);P(8,13,dark);
    } else if(stage===1){
      // single young stalk
      for(let y=11;y<=14;y++) P(7,y,dark);
      P(7,12,node); // node
      P(6,10,light);P(7,10,mid);P(8,10,light);
      P(6,9,mid);P(8,9,mid); // small leaves
    } else if(stage===2){
      // main stalk + one short
      for(let y=7;y<=14;y++) P(7,y,dark);
      P(7,10,node);P(7,7,node);
      // leaves on main
      P(6,6,mid);P(5,5,light);P(8,6,mid);P(9,5,light);
      P(6,5,mid);P(9,6,mid);
      // short stalk right
      for(let y=10;y<=14;y++) P(10,y,mid);
      P(10,11,node);
      P(9,9,light);P(11,9,light);P(10,9,mid);
    } else {
      // === bamboo grove (4 stalks) ===
      // main tall stalk (darkest, center)
      for(let y=2;y<=14;y++) P(7,y,dark);
      P(7,5,node);P(7,9,node);P(7,13,node);
      // main stalk leaves — drooping down from top
      P(6,2,mid);P(5,3,mid);P(4,4,light);
      P(6,3,light);
      P(8,2,mid);P(9,3,mid);P(10,4,light);
      P(8,3,light);

      // left medium stalk
      for(let y=6;y<=14;y++) P(4,y,mid);
      P(4,9,node);
      // left stalk leaves — drooping down
      P(3,6,mid);P(2,7,light);P(3,7,light);
      P(5,6,mid);P(5,7,light);

      // right medium stalk (no leaves)
      for(let y=5;y<=14;y++) P(12,y,mid);
      P(12,8,node);

      // short background stalk
      for(let y=8;y<=14;y++) P(9,y,light);
      P(9,10,node);
    }
  } else if(treeId==="cactus"){
    if(stage===0){
      P(7,14,c.l[1]);P(8,14,c.l[1]);P(7,13,c.l[2]);P(8,13,c.l[0]);
    } else if(stage===1){
      // small single column
      P(7,14,c.l[1]);P(8,14,c.l[1]);
      P(7,13,c.l[0]);P(8,13,c.l[2]);
      P(7,12,c.l[1]);P(8,12,c.l[0]);
      P(7,11,c.l[2]);P(8,11,c.l[1]); // rounded top
    } else if(stage===2){
      // tall column + short bump
      for(let y=9;y<=14;y++){P(6,y,c.l[0]);P(7,y,c.l[1]);P(8,y,c.l[2]);}
      P(7,8,c.l[1]);P(6,8,c.l[0]); // rounded top
      // short one
      P(9,14,c.l[1]);P(10,14,c.l[0]);
      P(9,13,c.l[2]);P(10,13,c.l[1]);
      P(9,12,c.l[0]);P(10,12,c.l[2]);
      P(9,11,c.l[1]); // rounded top
    } else {
      // tall column (left): x=5-7, y=5-14
      for(let y=6;y<=14;y++){P(5,y,c.l[0]);P(6,y,c.l[1]);P(7,y,c.l[2]);}
      P(5,5,c.l[0]);P(6,5,c.l[1]);P(7,5,c.l[2]); // rounded top
      P(6,4,c.l[1]); // tip
      // flower on top
      P(5,3,"#f5a0b8");P(6,3,"#e87ca0");P(7,3,"#f5a0b8");
      P(6,2,"#f5c6d0");
      // short column (right): x=9-11, y=9-14
      for(let y=10;y<=14;y++){P(9,y,c.l[2]);P(10,y,c.l[0]);P(11,y,c.l[1]);}
      P(9,9,c.l[2]);P(10,9,c.l[0]);P(11,9,c.l[1]); // rounded top
      P(10,8,c.l[0]); // tip
      // connector at base
      P(8,14,c.l[1]);P(8,13,c.l[2]);
    }
  } else if(treeId==="sunflower"){
    const pC=c.l[0],cC=c.l[2],sC=c.trunk,lC="#5a9e44";
    if(stage===0){ P(7,14,sC);P(8,14,sC);P(7,13,"#7bc26e");P(8,13,"#5aad50"); }
    else if(stage===1){ P(7,14,sC);P(8,14,sC);P(7,13,sC);P(8,13,sC);P(7,12,lC);P(8,12,lC);P(6,11,pC);P(7,11,c.l[1]);P(8,11,c.l[1]);P(9,11,pC);P(7,10,pC);P(8,10,pC); }
    else if(stage===2){ for(let y=10;y<=14;y++){P(7,y,sC);P(8,y,sC);}P(6,12,lC);P(9,12,lC);P(5,11,lC);P(10,11,lC);P(7,8,pC);P(8,8,pC);P(6,9,pC);P(7,9,cC);P(8,9,cC);P(9,9,pC);P(7,7,pC);P(8,7,pC);P(6,8,pC);P(9,8,pC); }
    else{ for(let y=9;y<=14;y++){P(7,y,sC);P(8,y,sC);}P(5,12,lC);P(6,12,lC);P(6,11,lC);P(10,12,lC);P(9,12,lC);P(9,11,lC);P(6,4,pC);P(7,4,pC);P(8,4,pC);P(9,4,pC);P(5,5,pC);P(6,5,c.l[1]);P(9,5,c.l[1]);P(10,5,pC);P(5,6,pC);P(6,6,cC);P(7,6,cC);P(8,6,cC);P(9,6,cC);P(10,6,pC);P(5,7,pC);P(6,7,cC);P(7,7,cC);P(8,7,cC);P(9,7,cC);P(10,7,pC);P(5,8,pC);P(6,8,c.l[1]);P(9,8,c.l[1]);P(10,8,pC);P(6,9,pC);P(7,5,cC);P(8,5,cC);P(9,9,pC);P(7,9,pC);P(8,9,pC); }
  } else if(treeId==="sakura"){
    // round fluffy cherry blossom tree
    if(stage===0){ P(7,13,c.trunk);P(8,13,c.trunk);P(7,12,c.l[1]);P(8,12,c.l[0]);P(6,14,"#9e8c7a");P(7,14,"#a09080");P(8,14,"#9e8c7a");P(9,14,"#a09080"); }
    else if(stage===1){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);
      P(6,12,c.l[0]);P(7,12,c.l[1]);P(8,12,c.l[0]);P(9,12,c.l[1]);
      P(6,11,c.l[1]);P(7,11,c.l[2]);P(8,11,c.l[0]);P(9,11,c.l[1]);
    }
    else if(stage===2){
      for(let y=12;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}
      // round blob
      for(let x=5;x<=10;x++) P(x,11,c.l[x%3]);
      for(let x=4;x<=11;x++) P(x,10,c.l[(x+1)%3]);
      for(let x=5;x<=10;x++) P(x,9,c.l[(x+2)%3]);
      for(let x=6;x<=9;x++) P(x,8,c.l[x%3]);
    }
    else{
      // trunk with slight branch
      for(let y=12;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}
      P(6,12,c.trunk);P(9,12,c.trunk);
      // round fluffy canopy
      P(7,3,c.l[1]);P(8,3,c.l[2]);
      for(let x=5;x<=10;x++) P(x,4,c.l[(x+2)%3]);
      for(let x=4;x<=11;x++) P(x,5,c.l[x%3]);
      for(let x=3;x<=12;x++) P(x,6,c.l[(x+1)%3]);
      for(let x=3;x<=12;x++) P(x,7,c.l[(x+2)%3]);
      for(let x=3;x<=12;x++) P(x,8,c.l[x%3]);
      for(let x=3;x<=12;x++) P(x,9,c.l[(x+1)%3]);
      for(let x=4;x<=11;x++) P(x,10,c.l[(x+2)%3]);
      for(let x=5;x<=10;x++) P(x,11,c.l[x%3]);
    }
  } else if(treeId==="christmas"){
    const g=c.l; // greens
    const star="#f0d020", ornR="#e04040", ornG="#4090e0", ornY="#f0a020";
    if(stage===0){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,"#2a7a3a");P(8,13,"#1a5c2a");
    } else if(stage===1){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);
      P(7,12,g[0]);P(8,12,g[1]);
      P(6,11,g[1]);P(7,11,g[2]);P(8,11,g[0]);P(9,11,g[1]);
      P(7,10,g[0]);P(8,10,g[2]);
      P(7,9,star); // tiny star
    } else if(stage===2){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);
      // tier 1
      for(let x=6;x<=9;x++) P(x,12,g[x%3]);
      for(let x=5;x<=10;x++) P(x,11,g[(x+1)%3]);
      // tier 2
      P(7,10,g[0]);P(8,10,g[1]);
      for(let x=6;x<=9;x++) P(x,9,g[(x+2)%3]);
      P(7,8,g[1]);P(8,8,g[0]);
      P(7,7,star);P(8,7,star);
    } else {
      // trunk
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);
      // star on top
      P(7,3,star);P(8,3,star);P(7,2,star);P(8,2,star);
      // tier 1 (top, narrow)
      P(7,4,g[0]);P(8,4,g[1]);
      for(let x=6;x<=9;x++) P(x,5,g[x%3]);
      for(let x=5;x<=10;x++) P(x,6,g[(x+1)%3]);
      // tier 2 (middle)
      for(let x=6;x<=9;x++) P(x,7,g[(x+2)%3]);
      for(let x=5;x<=10;x++) P(x,8,g[x%3]);
      for(let x=4;x<=11;x++) P(x,9,g[(x+1)%3]);
      // tier 3 (bottom, widest)
      for(let x=5;x<=10;x++) P(x,10,g[(x+2)%3]);
      for(let x=4;x<=11;x++) P(x,11,g[x%3]);
      for(let x=3;x<=12;x++) P(x,12,g[(x+1)%3]);
      // ornaments
      P(6,6,ornR);P(9,9,ornR);
      P(5,9,ornG);P(8,5,ornG);
      P(5,11,ornY);P(10,11,ornY);P(7,8,ornY);
    }
  } else if(treeId==="palm"){
    if(stage===0){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.l[1]);P(8,13,c.l[0]);
    } else if(stage===1){
      P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);
      P(7,12,c.trunk);P(8,12,c.trunk);
      P(6,11,c.l[1]);P(7,11,c.l[0]);P(8,11,c.l[1]);P(9,11,c.l[0]);
      P(7,10,c.l[2]);P(8,10,c.l[1]);
    } else if(stage===2){
      for(let y=10;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}
      P(7,9,c.l[0]);P(8,9,c.l[1]);
      P(5,8,c.l[1]);P(6,8,c.l[0]);P(7,8,c.l[2]);P(8,8,c.l[0]);P(9,8,c.l[1]);P(10,8,c.l[2]);
      P(4,9,c.l[0]);P(5,9,c.l[2]);P(10,9,c.l[0]);P(11,9,c.l[1]);
      P(6,7,c.l[1]);P(7,7,c.l[2]);P(8,7,c.l[0]);P(9,7,c.l[1]);
    } else {
      // tall trunk
      for(let y=8;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}
      // coconut cluster
      P(6,7,"#8c6438");P(7,7,"#a0784a");P(8,7,"#8c6438");P(9,7,"#a0784a");
      P(7,8,"#c4a87a");P(8,8,"#a0784a"); // peek below, trunk overlaps but these are to the highlight side
      // frond base
      P(7,6,c.l[0]);P(8,6,c.l[1]);
      // left frond — thick near base, thin at tip
      P(6,5,c.l[1]);P(6,6,c.l[2]);P(5,5,c.l[0]);P(5,6,c.l[1]);
      P(4,6,c.l[2]);P(4,7,c.l[0]);P(3,7,c.l[1]);P(3,8,c.l[2]);
      P(2,8,c.l[0]);P(2,9,c.l[2]); // thin tip
      // upper-left frond — thick base, thin tip
      P(6,4,c.l[2]);P(6,3,c.l[0]);P(5,3,c.l[1]);P(5,4,c.l[2]);
      P(4,3,c.l[0]);P(4,4,c.l[1]);
      P(3,4,c.l[2]); // thin tip
      // right frond — thick near base, thin at tip
      P(9,5,c.l[0]);P(9,6,c.l[1]);P(10,5,c.l[2]);P(10,6,c.l[0]);
      P(11,6,c.l[1]);P(11,7,c.l[2]);P(12,7,c.l[0]);P(12,8,c.l[1]);
      P(13,8,c.l[2]);P(13,9,c.l[0]); // thin tip
      // upper-right frond — thick base, thin tip
      P(9,4,c.l[1]);P(9,3,c.l[2]);P(10,3,c.l[0]);P(10,4,c.l[1]);
      P(11,3,c.l[2]);P(11,4,c.l[0]);
      P(12,4,c.l[1]); // thin tip
      // top fronds
      P(7,5,c.l[2]);P(8,5,c.l[0]);P(7,4,c.l[1]);P(8,4,c.l[2]);
      // coconut on ground
      P(11,13,"#a0784a");P(12,13,"#8c6438");
      P(11,14,"#8c6438");P(12,14,"#a0784a");
      P(12,12,"#c4a87a"); // tiny highlight
    }
  } else if(treeId==="fumeshroom"){
    const cap=c.l, stem=c.trunk, spot="#d8a0f0";
    if(stage===0){
      P(7,14,stem);P(8,14,stem);P(7,13,cap[2]);P(8,13,cap[1]);
    } else if(stage===1){
      // stubby stem + small round cap
      for(let x=6;x<=9;x++) P(x,14,stem);
      for(let x=5;x<=10;x++) P(x,13,cap[x%3]);
      for(let x=6;x<=9;x++) P(x,12,cap[(x+1)%3]);
    } else if(stage===2){
      // stem
      for(let x=6;x<=9;x++) P(x,14,stem);
      // round cap
      for(let x=5;x<=10;x++) P(x,13,cap[x%3]);
      for(let x=4;x<=11;x++) P(x,12,cap[(x+1)%3]);
      for(let x=4;x<=11;x++) P(x,11,cap[(x+2)%3]);
      for(let x=5;x<=10;x++) P(x,10,cap[x%3]);
      for(let x=6;x<=9;x++) P(x,9,cap[(x+1)%3]);
      P(5,11,spot);P(9,11,spot);
    } else {
      // one-row stubby stem
      for(let x=6;x<=9;x++) P(x,14,stem);
      // big round dome cap
      for(let x=5;x<=10;x++) P(x,13,cap[x%3]);
      for(let x=3;x<=12;x++) P(x,12,cap[(x+1)%3]);
      for(let x=3;x<=12;x++) P(x,11,cap[(x+2)%3]);
      for(let x=3;x<=12;x++) P(x,10,cap[x%3]);
      for(let x=3;x<=12;x++) P(x,9,cap[(x+1)%3]);
      for(let x=4;x<=11;x++) P(x,8,cap[(x+2)%3]);
      for(let x=5;x<=10;x++) P(x,7,cap[x%3]);
      for(let x=6;x<=9;x++) P(x,6,cap[(x+1)%3]);
      // light spots
      P(5,10,spot);P(10,10,spot);P(7,7,spot);P(9,8,spot);
      // angry eyes (PvZ style)
      P(6,10,"#ffffff");P(7,10,"#1a1a1a");
      P(9,10,"#ffffff");P(10,10,"#1a1a1a");
    }
  } else {
    if(stage===0){ P(7,13,c.trunk);P(8,13,c.trunk);P(7,12,c.l[1]);P(8,12,c.l[0]);P(6,14,"#9e8c7a");P(7,14,"#a09080");P(8,14,"#9e8c7a");P(9,14,"#a09080"); }
    else if(stage===1){ P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);P(6,12,c.l[0]);P(7,12,c.l[1]);P(8,12,c.l[0]);P(9,12,c.l[1]);P(7,11,c.l[2]);P(8,11,c.l[0]); }
    else if(stage===2){ for(let y=13;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}P(7,12,c.trunk);P(8,12,c.trunk);for(let x=5;x<=10;x++)P(x,11,c.l[x%3]);for(let x=6;x<=9;x++)P(x,10,c.l[(x+1)%3]);for(let x=6;x<=9;x++)P(x,9,c.l[(x+2)%3]);P(7,8,c.l[2]);P(8,8,c.l[0]); }
    else{ for(let y=12;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}for(let x=4;x<=11;x++)P(x,11,c.l[x%3]);for(let x=3;x<=12;x++)P(x,10,c.l[(x+1)%3]);for(let x=4;x<=11;x++)P(x,9,c.l[(x+2)%3]);for(let x=4;x<=11;x++)P(x,8,c.l[x%3]);for(let x=5;x<=10;x++)P(x,7,c.l[(x+1)%3]);for(let x=5;x<=10;x++)P(x,6,c.l[(x+2)%3]);for(let x=6;x<=9;x++)P(x,5,c.l[x%3]);P(7,4,c.l[1]);P(8,4,c.l[2]); }
  }
  return els;
}

// ---- Combined Ring: tree inside + dial outside ----
// 360° = 60 min. Delta-based drag accumulates time, clamped 5–120.
function TreeRing({ treeId, stage, duration, onDurationChange, ringSize, isFocus, timeLeft, totalTime, stopwatch, focusLabel="专注中" }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const justDragged = useRef(false);
  const prevDeg = useRef(null);
  const rawValue = useRef(duration);
  const [dragActive, setDragActive] = useState(false);
  const [numBounce, setNumBounce] = useState(false);
  const prevDuration = useRef(duration);

  useEffect(() => { rawValue.current = duration; }, [duration]);

  // bounce when snapped value changes
  useEffect(() => {
    if (prevDuration.current !== duration) {
      prevDuration.current = duration;
      setNumBounce(true);
      const t = setTimeout(() => setNumBounce(false), 120);
      return () => clearTimeout(t);
    }
  }, [duration]);

  const s = ringSize;
  const cx = s/2, cy = s/2;
  const rOuter = s/2 - 18;
  const treePx = Math.floor(s * 0.42 / 16);
  const treeSize = treePx * 16;
  const treeOff = cx - treeSize/2;

  // handle snaps to 5-min grid (every 30°)
  const lapMin = duration === 0 ? 0 : (duration % 60 || 60);
  const arcAngle = (lapMin / 60) * 360;
  const isSecondLap = duration > 60;
  const isFullCircle = duration === 60 || duration === 120;

  const handleRad = ((arcAngle - 90) * Math.PI) / 180;
  const hx = cx + rOuter * Math.cos(handleRad);
  const hy = cy + rOuter * Math.sin(handleRad);

  // nearest tick for highlight
  const nearestTick = duration === 0 ? 0 : Math.round((duration % 60 || 60) / 5) * 5;

  const arcD = (deg) => {
    const s1 = (-90 * Math.PI) / 180;
    const s2 = ((deg - 90) * Math.PI) / 180;
    const x1 = cx + rOuter * Math.cos(s1), y1 = cy + rOuter * Math.sin(s1);
    const x2 = cx + rOuter * Math.cos(s2), y2 = cy + rOuter * Math.sin(s2);
    return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${deg > 180 ? 1 : 0} 1 ${x2} ${y2}`;
  };

  const tickData = [];
  for (let m = 5; m <= 60; m += 5) tickData.push({ m, major: m % 15 === 0 });

  const pointerToDeg = (clientX, clientY) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = clientX - rect.left - cx, y = clientY - rect.top - cy;
    let deg = Math.atan2(y, x) * 180 / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
  };

  const handleDrag = (clientX, clientY) => {
    const deg = pointerToDeg(clientX, clientY);
    const prev = prevDeg.current;
    prevDeg.current = deg;
    if (prev === null) return;

    let delta = deg - prev;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;

    const minDelta = (delta / 360) * 60;
    rawValue.current = Math.max(0, Math.min(120, rawValue.current + minDelta));
    const snapped = Math.max(0, Math.min(120, Math.round(rawValue.current / 5) * 5));
    onDurationChange(snapped);
  };

  const onPD = (e) => {
    if (isFocus) return;
    dragging.current = true;
    setDragActive(true);
    prevDeg.current = null;
    rawValue.current = duration;
    e.target.setPointerCapture(e.pointerId);
  };
  const onPM = (e) => { if (dragging.current) handleDrag(e.clientX, e.clientY); };
  const onPU = () => {
    dragging.current = false;
    justDragged.current = true;
    setDragActive(false);
    prevDeg.current = null;
    setTimeout(() => { justDragged.current = false; }, 50);
  };

  const onClick = (e) => {
    if (isFocus || dragging.current || justDragged.current) return;
    const deg = pointerToDeg(e.clientX, e.clientY);
    const rawMin = Math.round((deg / 360) * 60);
    const snapped = Math.max(0, Math.round(rawMin / 5) * 5);
    const base = isSecondLap ? 60 : 0;
    const total = Math.max(0, Math.min(120, base + snapped));
    onDurationChange(total);
    rawValue.current = total;
  };

  // focus mode arc
  let focusArcAngle = 0;
  let focusIsSecondLap = false;
  let focusIsFullCircle = false;
  if(isFocus) {
    if(stopwatch) {
      // stopwatch: filling up based on elapsed time, 5-min jumps
      const elapsedMin = Math.floor((timeLeft || 0) / 300) * 5;
      focusIsSecondLap = elapsedMin > 60;
      const lapMin = elapsedMin % 60 || (elapsedMin >= 60 ? 60 : 0);
      focusArcAngle = (lapMin / 60) * 360;
      focusIsFullCircle = elapsedMin === 60 || elapsedMin === 120 || (elapsedMin > 0 && lapMin === 0 && elapsedMin >= 60);
    } else {
      // countdown: depleting, 5-min jumps
      const remainingMin = Math.ceil((timeLeft || 0) / 300) * 5;
      focusArcAngle = (remainingMin / 60) * 360;
      focusIsFullCircle = remainingMin >= 60;
    }
  }
  const displayMin = isFocus ? null : duration;
  const timeLabel = isFocus ? null : "分钟";
  const handleR = dragActive ? 13 : 10;

  return (
    <svg ref={svgRef} width={s} height={s} viewBox={`0 0 ${s} ${s}`}
      style={{ touchAction: "none", cursor: isFocus ? "default" : "pointer", userSelect: "none", overflow: "visible" }}
      onClick={onClick}
    >
      {/* bg ring */}
      <circle cx={cx} cy={cy} r={rOuter} fill="none"
        stroke={isSecondLap && !isFocus ? "#d0c8b8" : "#e8e0d6"} strokeWidth={8} />

      {/* ticks — highlight nearest during drag */}
      {tickData.map(({ m, major }) => {
        const a = ((m / 60) * 360 - 90) * Math.PI / 180;
        const ri = rOuter - (major ? 7 : 4), ro = rOuter + (major ? 3 : 1);
        const isNearest = dragActive && m === nearestTick;
        return <g key={m}>
          <line x1={cx + ri * Math.cos(a)} y1={cy + ri * Math.sin(a)}
            x2={cx + ro * Math.cos(a)} y2={cy + ro * Math.sin(a)}
            stroke={isNearest ? "#3a3530" : major ? "#a09888" : "#d8d0c4"}
            strokeWidth={isNearest ? 2.5 : major ? 1.5 : 0.8}
            style={{ transition: "stroke 0.08s, stroke-width 0.08s" }} />
          {major && <text x={cx + (rOuter + 18) * Math.cos(a)} y={cy + (rOuter + 18) * Math.sin(a)}
            textAnchor="middle" dominantBaseline="central"
            fill={isNearest ? "#3a3530" : "#a09888"}
            fontSize={isNearest ? 13 : 11} fontWeight={isNearest ? 700 : 500}
            style={{ transition: "fill 0.08s, font-size 0.08s" }}
            fontFamily="'SF Mono','Menlo',monospace">{m}</text>}
        </g>;
      })}

      {/* ---- home mode ---- */}
      {!isFocus && <>
        {/* lap 1 complete: full circle in medium tone underneath */}
        {isSecondLap &&
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#8a8078" strokeWidth={8} />}

        {/* current arc */}
        {!isFullCircle && arcAngle > 0 &&
          <path d={arcD(arcAngle)} fill="none" stroke="#3a3530" strokeWidth={8} strokeLinecap="butt" />}
        {isFullCircle &&
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#3a3530" strokeWidth={8} />}

        {/* handle — snaps to grid, grows on drag */}
        <circle cx={hx} cy={hy} r={handleR} fill="#3a3530" stroke="#faf6ee" strokeWidth={2.5}
          style={{ cursor: "grab", transition: "r 0.12s ease-out" }}
          onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} />
        {/* second lap indicator ring on handle */}
        {isSecondLap &&
          <circle cx={hx} cy={hy} r={handleR - 4} fill="none" stroke="#faf6ee" strokeWidth={1.5} />}
      </>}

      {/* ---- focus mode: arc with lap 2 support ---- */}
      {isFocus && <>
        {/* lap 1 complete circle for stopwatch second lap */}
        {focusIsSecondLap &&
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#8a8078" strokeWidth={8} />}

        {!focusIsFullCircle && focusArcAngle > 0 &&
          <path d={arcD(focusArcAngle)} fill="none" stroke="#3a3530" strokeWidth={8} strokeLinecap="butt" />}
        {focusIsFullCircle &&
          <circle cx={cx} cy={cy} r={rOuter} fill="none" stroke="#3a3530" strokeWidth={8} />}

        {/* stopwatch handle showing current position — always visible, starts at 12 o'clock */}
        {stopwatch && (() => {
          const hAngle = focusArcAngle > 0 ? ((focusArcAngle - 90) * Math.PI) / 180 : ((-90) * Math.PI / 180);
          const shx = cx + rOuter * Math.cos(hAngle);
          const shy = cy + rOuter * Math.sin(hAngle);
          return <>
            <circle cx={shx} cy={shy} r={10} fill="#3a3530" stroke="#faf6ee" strokeWidth={2.5} />
            {focusIsSecondLap &&
              <circle cx={shx} cy={shy} r={6} fill="none" stroke="#faf6ee" strokeWidth={1.5} />}
          </>;
        })()}
      </>}

      {/* tree + time centered */}
      {(() => {
        const textBlockH = 38;
        const gap = 2;
        const totalH = treeSize + gap + textBlockH;
        const groupTop = cy - totalH / 2;
        const treeY = groupTop;
        const numY = groupTop + treeSize + gap + 14;
        const lblY = numY + 20;
        const numScale = numBounce ? 1.08 : 1;
        return <>
          <g transform={`translate(${treeOff},${treeY})`}>
            {treePixels(treeId, stage, treePx)}
          </g>
          {!isFocus && <>
            <text x={cx} y={numY} textAnchor="middle" dominantBaseline="central"
              fill="#3a3530" fontSize={30} fontWeight={200}
              fontFamily="'SF Mono','Menlo',monospace"
              style={{ transform: `scale(${numScale})`, transformOrigin: `${cx}px ${numY}px`, transition: "transform 0.1s ease-out" }}
            >{displayMin}</text>
            <text x={cx} y={lblY} textAnchor="middle" dominantBaseline="central"
              fill="#b0a898" fontSize={11}
              fontFamily="'SF Mono','Menlo',monospace">{timeLabel}</text>
          </>}
          {isFocus && <>
            <text x={cx} y={numY} textAnchor="middle" dominantBaseline="central"
              fill="#3a3530" fontSize={28} fontWeight={200}
              fontFamily="'SF Mono','Menlo',monospace">{isFocus}</text>
            {focusLabel && <text x={cx} y={lblY} textAnchor="middle" dominantBaseline="central"
              fill="#b0a898" fontSize={11}
              fontFamily="'SF Mono','Menlo',monospace">{focusLabel}</text>}
          </>}
        </>;
      })()}
    </svg>
  );
}



// ======= MAIN =======
export default function App() {
  const [screen,setScreen] = useState("home");
  const [selTree,setSelTree] = useState(0);
  const [selTag,setSelTag] = useState(0);
  const [tags,setTags] = useState(DEFAULT_TAGS);
  const [addingTag,setAddingTag] = useState(false);
  const [newTagName,setNewTagName] = useState("");
  const [renamingTag,setRenamingTag] = useState(-1);
  const [renameText,setRenameText] = useState("");
  const [deleteMode,setDeleteMode] = useState(false);
  const [confirmDelete,setConfirmDelete] = useState(null); // {index, label} or null
  const [userName,setUserName] = useState("园长");
  const [userAvatar,setUserAvatar] = useState("pine");
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
  const [duration,setDuration] = useState(0);
  const [timeLeft,setTimeLeft] = useState(0);
  const [totalTime,setTotalTime] = useState(0);
  const [treeStage,setTreeStage] = useState(0);
  const timerRef = useRef(null);
  const {records,addRecord,importRecords} = useHistory();
  const importRef = useRef(null);

  const handleImportCSV = (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { records: imported, newTags } = parseForestCSV(ev.target.result);
      newTags.forEach(t => {
        const tid = t.toLowerCase().replace(/\s+/g,"_");
        if(!tags.find(x=>x.id===tid)) {
          setTags(prev=>[...prev,{id:tid,label:t,icon:"🏷️"}]);
        }
      });
      importRecords(imported);
      alert(`导入成功！${imported.length} 条记录`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const isStopwatch = duration === 0;

  const startFocus = () => {
    if(isStopwatch) {
      setTimeLeft(0); setTotalTime(0); // stopwatch: count up from 0
    } else {
      const d=duration*60; setTimeLeft(d); setTotalTime(d); // countdown
    }
    setTreeStage(0); setScreen("focus");
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
    timerRef.current=setInterval(()=>{
      setTimeLeft(t=>{
        if(totalTime===0) {
          // stopwatch: count up, no auto-end
          return t+1;
        }
        // countdown
        if(t<=1){ clearInterval(timerRef.current); setTreeStage(3); setScreen("done");
          addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration,completed:true});
          bumpTag(selTag);
          return 0; }
        return t-1;
      });
    },1000);
    return ()=>clearInterval(timerRef.current);
  },[screen]);

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

  const giveUp = ()=>{
    clearInterval(timerRef.current);
    if(totalTime===0) {
      // stopwatch: record elapsed time
      const elapsedMin = Math.floor(timeLeft/60);
      addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration:elapsedMin,completed:true});
      bumpTag(selTag);
      setScreen("done");
    } else {
      addRecord({tag:tags[selTag].id,tree:TREES[selTree].id,duration,completed:false});
      setScreen("home");
    }
  };

  const todayRecs = records.filter(r=>r.date.toDateString()===new Date().toDateString()&&r.completed);
  const todayMin = todayRecs.reduce((s,r)=>s+r.duration,0);
  const weekRecs = records.filter(r=>Date.now()-r.date.getTime()<7*86400000&&r.completed);
  const tagStats = {}; weekRecs.forEach(r=>{tagStats[r.tag]=(tagStats[r.tag]||0)+r.duration;});
  const weekTotal = weekRecs.reduce((s,r)=>s+r.duration,0);


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
          今日已专注 {todayMin>=60?`${Math.floor(todayMin/60)}小时${todayMin%60>0?`${todayMin%60}分钟`:""}`:(`${todayMin}分钟`)}
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
                  if(newTagName.trim()) setTags(prev=>[...prev,{id:`custom_${Date.now()}`,label:newTagName.trim().slice(0,16),icon:"🏷️"}]);
                  setNewTagName("");setAddingTag(false);
                }
                if(e.key==="Escape"){setNewTagName("");setAddingTag(false);}
              }}
              onBlur={()=>{
                if(newTagName.trim()) setTags(prev=>[...prev,{id:`custom_${Date.now()}`,label:newTagName.trim().slice(0,16),icon:"🏷️"}]);
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
        <div style={{position:"absolute",top:16,right:20,fontSize:11,color:"#b0a898"}}>{tags[selTag].icon} {tags[selTag].label}</div>
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
      <div style={{fontSize:13,color:"#8a8078",marginTop:4}}>{tags[selTag].icon} {tags[selTag].label}</div>
      <div style={{padding:"24px 40px 28px",width:"100%",boxSizing:"border-box"}}>
        <button onClick={()=>setScreen("home")} style={W.btn("#3a3530","#faf6ee")}>回到主页</button>
      </div>
    </div>
    );
  }

  // ---- STATS ----
  const dayL=["日","一","二","三","四","五","六"];
  const last7=Array.from({length:7},(_,i)=>{
    const d=new Date();d.setDate(d.getDate()-(6-i));
    const dr=records.filter(r=>r.date.toDateString()===d.toDateString()&&r.completed);
    return{label:dayL[d.getDay()],minutes:dr.reduce((s,r)=>s+r.duration,0),isToday:i===6};
  });
  const maxM=Math.max(...last7.map(d=>d.minutes),1);

  return (
    <div style={W.wrap}>
      <div style={W.top}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",fontSize:13,color:"#8a8078",cursor:"pointer",fontFamily:F}}>← 返回</button>
        <span>统计</span>
      </div>
      <div style={{flex:1,padding:"0 20px 32px",overflowY:"auto"}}>
        <div style={{...W.card,marginTop:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={W.lbl}>今日专注</div>
              <div style={W.val}>{todayMin>=60?<>{Math.floor(todayMin/60)}<span style={W.unit}>小时</span>{todayMin%60>0&&<>{todayMin%60}<span style={W.unit}>分钟</span></>}</>:<>{todayMin}<span style={W.unit}>分钟</span></>}</div>
              <div style={{fontSize:12,color:"#8a8078",marginTop:4}}>{todayRecs.length} 次专注</div>
            </div>
            <button onClick={()=>{setShowSettings(true);setSettingsName(userName);}}
              style={{background:"none",border:"none",cursor:"pointer",padding:4,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
              <svg width={48} height={48} viewBox="0 0 48 48" style={{imageRendering:"pixelated"}}>
                {treePixels(userAvatar, 3, 3)}
              </svg>
              <span style={{fontSize:12,color:"#8a8078",fontFamily:F}}>{userName||"guest"}</span>
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
                  style={{marginTop:8,padding:"8px 0",width:"90%",borderRadius:8,background:"transparent",border:"1.5px solid #d8d0c4",color:"#8a8078",fontSize:12,fontFamily:F,cursor:"pointer"}}>📂 导入 Forest 数据</button>
                <input ref={importRef} type="file" accept=".csv" onChange={handleImportCSV} style={{display:"none"}} />
              </PixelCloud>
            </div>
          </div>
        )}

        {/* period tabs */}
        <div style={{display:"flex",gap:0,marginTop:8,background:"#f0ebe2",borderRadius:10,padding:3}}>
          {[["day","日"],["week","周"],["month","月"],["year","年"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setStatsPeriod(k);setStatsDate(new Date());}}
              style={{flex:1,padding:"6px 0",borderRadius:8,fontSize:12,fontFamily:F,border:"none",cursor:"pointer",
                background:statsPeriod===k?"#faf6ee":"transparent",color:statsPeriod===k?"#3a3530":"#b0a898",fontWeight:statsPeriod===k?600:400}}>{l}</button>
          ))}
        </div>

        {/* date navigation */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,padding:"10px 0"}}>
          <button onClick={()=>{
            const d=new Date(statsDate);
            if(statsPeriod==="day") d.setDate(d.getDate()-1);
            else if(statsPeriod==="week") d.setDate(d.getDate()-7);
            else if(statsPeriod==="month") d.setMonth(d.getMonth()-1);
            else d.setFullYear(d.getFullYear()-1);
            const earliest=new Date(2026,8,6); // 2026.9.6
            const atLimit = (statsPeriod==="day" && statsDate<=earliest)
              || (statsPeriod==="week" && statsDate.getTime()<earliest.getTime()+7*86400000)
              || (statsPeriod==="month" && statsDate.getMonth()===8&&statsDate.getFullYear()===2026)
              || (statsPeriod==="year" && statsDate.getFullYear()===2026);
            if(!atLimit) setStatsDate(d);
          }} style={{background:"none",border:"none",fontSize:16,color:(()=>{
            const earliest=new Date(2026,8,6);
            const atLimit = (statsPeriod==="day" && statsDate<=earliest)
              || (statsPeriod==="week" && statsDate.getTime()<earliest.getTime()+7*86400000)
              || (statsPeriod==="month" && statsDate.getMonth()===8&&statsDate.getFullYear()===2026)
              || (statsPeriod==="year" && statsDate.getFullYear()===2026);
            return atLimit ? "#e8e0d6" : "#c4a882";
          })(),cursor:"pointer"}}>‹</button>
          <span style={{fontSize:13,color:"#3a3530",fontFamily:F,minWidth:140,textAlign:"center"}}>
            {statsPeriod==="day" && `${statsDate.getFullYear()}年${statsDate.getMonth()+1}月${statsDate.getDate()}日`}
            {statsPeriod==="week" && (()=>{ const s=new Date(statsDate);s.setDate(s.getDate()-s.getDay());return `${s.getMonth()+1}月${s.getDate()}日 - ${s.getMonth()+1}月${s.getDate()+6}日`; })()}
            {statsPeriod==="month" && `${statsDate.getFullYear()}年${statsDate.getMonth()+1}月`}
            {statsPeriod==="year" && `${statsDate.getFullYear()}年`}
          </span>
          <button onClick={()=>{
            const d=new Date(statsDate);
            if(statsPeriod==="day") d.setDate(d.getDate()+1);
            else if(statsPeriod==="week") d.setDate(d.getDate()+7);
            else if(statsPeriod==="month") d.setMonth(d.getMonth()+1);
            else d.setFullYear(d.getFullYear()+1);
            const now=new Date();
            // don't go past today
            const atLimit = (statsPeriod==="day" && statsDate.toDateString()===now.toDateString())
              || (statsPeriod==="week" && statsDate.getTime()>now.getTime()-7*86400000)
              || (statsPeriod==="month" && statsDate.getMonth()===now.getMonth()&&statsDate.getFullYear()===now.getFullYear())
              || (statsPeriod==="year" && statsDate.getFullYear()===now.getFullYear());
            if(!atLimit) setStatsDate(d);
          }} style={{background:"none",border:"none",fontSize:16,color:(()=>{
            const now=new Date();
            const atLimit = (statsPeriod==="day" && statsDate.toDateString()===now.toDateString())
              || (statsPeriod==="week" && statsDate.getTime()>now.getTime()-7*86400000)
              || (statsPeriod==="month" && statsDate.getMonth()===now.getMonth()&&statsDate.getFullYear()===now.getFullYear())
              || (statsPeriod==="year" && statsDate.getFullYear()===now.getFullYear());
            return atLimit ? "#e8e0d6" : "#c4a882";
          })(),cursor:"pointer"}}>›</button>
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
          const treeEmojis = [];
          filtered.forEach(r=>{
            const emoji = TREES.find(t=>t.id===r.tree)?.emoji||"🌱";
            const count = Math.max(1,Math.ceil(r.duration/60));
            for(let j=0;j<count;j++) treeEmojis.push(emoji);
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

          const fmtTrend = (m) => {
            const abs = Math.abs(m);
            if(abs>=60) return `${Math.floor(abs/60)}小时${abs%60>0?`${abs%60}分钟`:""}`;
            return `${abs}分钟`;
          };
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
              <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#8a8078",fontFamily:F}}>🌲 {treeCount}</span>
              </div>
              <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:8,maxHeight:52,overflow:"hidden",alignItems:"center"}}
                onClick={()=>{if(treeEmojis.length>20) setShowForest(true);}}>
                {treeEmojis.length>0 ? treeEmojis.map((e,i)=><span key={i} style={{fontSize:18}}>{e}</span>) :
                  <span style={{fontSize:12,color:"#d8d0c4"}}>还没有种树</span>}
                {treeEmojis.length>20 && <span style={{fontSize:14,color:"#b0a898",cursor:"pointer",letterSpacing:2}}>···</span>}
              </div>
            </div>

            {/* forest full view modal */}
            {showForest && (
              <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(58,53,48,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}}
                onClick={()=>setShowForest(false)}>
                <div onClick={e=>e.stopPropagation()}>
                  <PixelCloud width={300}>
                    <div style={{fontSize:14,fontWeight:600,color:"#3a3530",fontFamily:F,marginBottom:4}}>🌿 {treeCount}</div>
                    <div style={{fontSize:11,color:"#b0a898",fontFamily:F,marginBottom:12}}>
                      {statsPeriod==="day"?"今日":""}
                      {statsPeriod==="week"?"本周":""}
                      {statsPeriod==="month"?"本月":""}
                      {statsPeriod==="year"?"今年":""}
                      种下的树
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:4,justifyContent:"center",maxHeight:240,overflowY:"auto"}}>
                      {treeEmojis.map((e,i)=><span key={i} style={{fontSize:20}}>{e}</span>)}
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
                      const tipText = v>=60?`${Math.floor(v/60)}时${v%60>0?`${v%60}分`:""}`:(`${v}分`);
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
                <span style={{fontSize:12,color:"#8a8078",fontFamily:F}}>累计 {totalMin>=60?`${Math.floor(totalMin/60)}小时${totalMin%60>0?`${totalMin%60}分钟`:""}`:(`${totalMin}分钟`)}</span>
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
                          {b.value>=60?`${Math.floor(b.value/60)}时${b.value%60>0?`${b.value%60}分`:""}`:(`${b.value}分钟`)}
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
                    const timeStr = mins>=60?`${Math.floor(mins/60)}时${mins%60>0?`${mins%60}分`:""}`:(`${mins}分`);
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
