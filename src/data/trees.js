export const TREES = [
  { id: "pine", name: "松树", emoji: "🌲" },
  { id: "sakura", name: "樱花", emoji: "🌸" },
  { id: "cactus", name: "仙人掌", emoji: "🌵" },
  { id: "christmas", name: "圣诞树", emoji: "🎄" },
  { id: "palm", name: "椰子树", emoji: "🌴" },
  { id: "fumeshroom", name: "大喷菇", emoji: "🍄" },
  { id: "maple", name: "枫树", emoji: "🍁" },
  { id: "bamboo", name: "竹子", emoji: "🎋" },
  { id: "sunflower", name: "向日葵", emoji: "🌻" },
  { id: "plum", name: "梅花", emoji: "🌺" },
];

export const TC = {
  pine:      { trunk:"#8B5E3C", l:["#1a472a","#2d6b30","#3e8c3a"] },
  sakura:    { trunk:"#9e7c5c", l:["#f5c6d0","#e8a0bf","#d87caa"] },
  christmas: { trunk:"#7a5230", l:["#1a5c2a","#2a7a3a","#1e6830"] },
  cactus:    { trunk:"#5b8c3e", l:["#4a7c2e","#5b8c3e","#6c9c4e"] },
  palm:      { trunk:"#a0784a", l:["#4a8c2e","#6b9e4a","#8cb06a"] },
  maple:     { trunk:"#7a5230", l:["#c7522a","#e06030","#d44a20"] },
  bamboo:    { trunk:"#4d8844", l:["#3a7d3a","#5aad50","#7bc26e"] }, // trunk slot = bamboo joint/node color
  sunflower: { trunk:"#6b8c3e", l:["#f7d02c","#e8a817","#c47e10"] },
  fumeshroom:{ trunk:"#c8b0d8", l:["#7b3fa0","#9b5fc0","#b880d8"] },
  plum:      { trunk:"#5a3a28", branch:"#7a5040", l:["#e05070","#f0a0b8","#c83050"] }, // branch = lighter twig tone
};
