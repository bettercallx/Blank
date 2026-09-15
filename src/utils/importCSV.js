const TREE_MAP = {
  "雪松":"pine","绿色橡树":"pine","柳树":"pine","银杏":"pine","猴面包树":"pine","守星木":"pine","太空树":"pine","星空树":"pine",
  "樱花":"sakura","山茶花":"sakura","桔梗":"sakura","波斯菊":"sakura","卷瓣菊花":"sakura",
  "梅花":"plum","杜鹃花":"plum","一棵开花的树":"plum","仙树":"plum",
  "达达石像":"cactus","星星珊瑚":"cactus","章鱼":"cactus",
  "圣诞树":"christmas","月亮树":"christmas","咕咕钟":"christmas","树屋":"christmas","森林之心":"christmas",
  "橘子树":"palm","黄金风铃木":"palm","桂花":"palm","白雪木":"palm","独角兽树":"palm","龟背竹":"palm",
  "女巫魔菇":"fumeshroom","蘑菇":"fumeshroom","大王花":"fumeshroom","黑森林蛋糕":"fumeshroom","提拉米苏":"fumeshroom",
  "枫树":"maple","紫藤":"maple","蓝花楹":"maple",
  "小树丛":"bamboo","幸运草":"bamboo","羽翼精灵":"bamboo","猫咪":"bamboo",
  "向日葵":"sunflower","郁金香":"sunflower","天竺葵":"sunflower","薰衣草":"sunflower","熊童子":"sunflower",
};

// Forest's own "no tag" values → our protected blank tag; everything else is kept
// verbatim as its original Forest label (the importer creates a tag per name).
const UNSET_TAGS = new Set(["", "未设置", "blank", "未分类"]);

export function parseForestCSV(text) {
  const lines = text.split("\n").slice(1);
  const records = [];
  const tagNames = new Set(); // distinct original Forest tag names to create

  lines.forEach((line, i) => {
    if (!line.trim()) return;
    const parts = line.split(",");
    if (parts.length < 6) return;
    const startStr = parts[0], endStr = parts[1], tag = parts[2], treeType = parts[4], success = parts[5].trim();
    if (success !== "True") return;
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (isNaN(start) || isNaN(end)) return;
    const dur = Math.floor((end - start) / 60000);
    if (dur <= 0) return;
    // any Forest tree we haven't mapped yet falls back to 大喷菇 (fumeshroom) so it stands out
    const mappedTree = TREE_MAP[treeType] || "fumeshroom";
    const rawTag = (tag || "").trim();
    // tagName is the original Forest label, or null for "no tag" → resolved to blank by the importer
    const tagName = UNSET_TAGS.has(rawTag) ? null : rawTag;
    if (tagName) tagNames.add(tagName);
    records.push({
      id: 100000 + i,
      tagName,
      tree: mappedTree,
      duration: dur,
      date: start,
      completed: true,
    });
  });

  return { records, tagNames: [...tagNames] };
}
