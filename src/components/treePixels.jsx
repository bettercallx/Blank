import { TC } from "../data/trees";

// ---- Pixel Tree (returns just the pixel rects, no wrapping SVG) ----
export function treePixels(treeId, stage, px) {
  const c = TC[treeId]||TC.pine;
  const els = [];
  let k = 0;
  const P = (x,y,color) => { els.push(<rect key={k++} x={x*px} y={y*px} width={px+.5} height={px+.5} fill={color}/>); };

  // ground
  for(let x=0;x<16;x++) P(x,15,x%2===0?"#c4a882":"#b89e76");

  if(treeId==="bamboo"){
    // stalk shades from TC.bamboo.l; the joint/node color lives in the trunk slot
    const dark=c.l[0], mid=c.l[1], light=c.l[2], node=c.trunk;
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
  } else if(treeId==="plum"){
    const bark=c.trunk, branch=c.branch;    // TC.plum.trunk / .branch drive the two wood tones
    const f1=c.l[0], f2=c.l[1], f3=c.l[2];  // TC.plum.l drives the three blossom shades
    if(stage===0){
      P(7,14,bark);P(8,14,bark);P(7,13,branch);P(8,13,f2);
    } else if(stage===1){
      P(7,14,bark);P(8,14,bark);P(7,13,bark);P(8,13,bark);
      P(7,12,branch);P(7,11,branch);
      P(6,11,f1);P(8,11,f2);
    } else if(stage===2){
      P(7,14,bark);P(8,14,bark);P(7,13,bark);P(8,13,bark);
      P(7,12,bark);P(7,11,bark);
      P(6,10,branch);P(5,9,branch);P(4,8,branch);P(3,7,branch);
      P(4,7,f1);P(3,6,f2);P(5,8,f3);
      P(8,11,branch);P(9,10,branch);P(10,9,branch);
      P(10,8,f2);P(11,9,f1);
    } else {
      P(7,14,bark);P(8,14,bark);P(7,13,bark);P(8,13,bark);
      P(7,12,bark);P(8,12,bark);P(7,11,bark);
      P(6,10,branch);P(5,9,branch);P(4,8,branch);P(3,7,branch);P(2,6,branch);P(2,5,branch);P(2,4,branch);
      P(3,8,branch);P(2,8,branch);P(1,7,branch);
      P(8,10,branch);P(9,9,branch);P(10,8,branch);P(11,7,branch);P(12,6,branch);P(12,5,branch);
      P(11,8,branch);P(12,8,branch);P(13,7,branch);
      P(7,10,branch);P(7,9,branch);P(7,8,branch);P(8,7,branch);P(8,6,branch);
      P(1,4,f1);P(2,3,f2);P(3,5,f1);
      P(1,6,f2);P(1,8,f1);
      P(4,7,f3);P(5,8,f2);
      P(13,4,f1);P(12,4,f2);P(13,6,f1);
      P(11,6,f3);P(13,8,f2);
      P(8,5,f1);P(9,6,f2);P(7,7,f3);
    }
  } else {
    if(stage===0){ P(7,13,c.trunk);P(8,13,c.trunk);P(7,12,c.l[1]);P(8,12,c.l[0]);P(6,14,"#9e8c7a");P(7,14,"#a09080");P(8,14,"#9e8c7a");P(9,14,"#a09080"); }
    else if(stage===1){ P(7,14,c.trunk);P(8,14,c.trunk);P(7,13,c.trunk);P(8,13,c.trunk);P(6,12,c.l[0]);P(7,12,c.l[1]);P(8,12,c.l[0]);P(9,12,c.l[1]);P(7,11,c.l[2]);P(8,11,c.l[0]); }
    else if(stage===2){ for(let y=13;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}P(7,12,c.trunk);P(8,12,c.trunk);for(let x=5;x<=10;x++)P(x,11,c.l[x%3]);for(let x=6;x<=9;x++)P(x,10,c.l[(x+1)%3]);for(let x=6;x<=9;x++)P(x,9,c.l[(x+2)%3]);P(7,8,c.l[2]);P(8,8,c.l[0]); }
    else{ for(let y=12;y<=14;y++){P(7,y,c.trunk);P(8,y,c.trunk);}for(let x=4;x<=11;x++)P(x,11,c.l[x%3]);for(let x=3;x<=12;x++)P(x,10,c.l[(x+1)%3]);for(let x=4;x<=11;x++)P(x,9,c.l[(x+2)%3]);for(let x=4;x<=11;x++)P(x,8,c.l[x%3]);for(let x=5;x<=10;x++)P(x,7,c.l[(x+1)%3]);for(let x=5;x<=10;x++)P(x,6,c.l[(x+2)%3]);for(let x=6;x<=9;x++)P(x,5,c.l[x%3]);P(7,4,c.l[1]);P(8,4,c.l[2]); }
  }
  return els;
}
