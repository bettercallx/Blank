export const F = "'SF Mono','Menlo','Courier New',monospace";

export const W = {
  wrap: { width:"100%", maxWidth:390, minHeight:"100dvh", margin:"0 auto", background:"#faf6ee", fontFamily:F, display:"flex", flexDirection:"column", color:"#3a3530", overflowX:"hidden", position:"relative" },
  top: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px 0", fontSize:13, color:"#8a8078" },
  tag: (on) => ({ flexShrink:0, padding:"6px 14px", borderRadius:20, fontSize:13, border:on?"1.5px solid #3a3530":"1.5px solid #d8d0c4", background:on?"#3a3530":"transparent", color:on?"#faf6ee":"#6a6258", cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap", userSelect:"none" }),
  dot: (on) => ({ width:6, height:6, borderRadius:3, background:on?"#3a3530":"#d8d0c4", transition:"all .15s" }),
  btn: (bg,fg) => ({ padding:"14px 0", borderRadius:14, background:bg, color:fg, fontSize:14, fontFamily:F, fontWeight:600, border:bg==="transparent"?"1.5px solid #d8d0c4":"none", cursor:"pointer", letterSpacing:2, width:"100%" }),
  card: { background:"#f0ebe2", borderRadius:12, padding:"16px 18px", marginBottom:12 },
  lbl: { fontSize:11, color:"#8a8078", letterSpacing:1 },
  val: { fontSize:28, fontWeight:300, color:"#3a3530", marginTop:2 },
  unit: { fontSize:13, fontWeight:400, color:"#8a8078" },
};
