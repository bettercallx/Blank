const TREE_MAP = {
  "雪松":"pine","绿色橡树":"pine","柳树":"pine","银杏":"pine","猴面包树":"pine","守星木":"pine","太空树":"pine","星空树":"pine",
  "樱花":"sakura","山茶花":"sakura","梅花":"sakura","杜鹃花":"sakura","桔梗":"sakura","波斯菊":"sakura","卷瓣菊花":"sakura","一棵开花的树":"sakura",
  "仙树":"cactus","达达石像":"cactus","星星珊瑚":"cactus","章鱼":"cactus",
  "圣诞树":"christmas","月亮树":"christmas","咕咕钟":"christmas","树屋":"christmas","森林之心":"christmas",
  "橘子树":"palm","黄金风铃木":"palm","桂花":"palm","白雪木":"palm","独角兽树":"palm","龟背竹":"palm",
  "女巫魔菇":"fumeshroom","蘑菇":"fumeshroom","大王花":"fumeshroom","黑森林蛋糕":"fumeshroom","提拉米苏":"fumeshroom",
  "枫树":"maple","紫藤":"maple","蓝花楹":"maple",
  "小树丛":"bamboo","幸运草":"bamboo","羽翼精灵":"bamboo","猫咪":"bamboo",
  "向日葵":"sunflower","郁金香":"sunflower","天竺葵":"sunflower","薰衣草":"sunflower","熊童子":"sunflower",
};

const TAG_MAP = {
  "未设置":"uncategorized","blank":"uncategorized",
  "systems":"study","algorithms":"study","deeplearning":"study","distributed system":"study",
  "leetcode":"code","C++":"code",
  "reading":"read",
  "ai":"create","agent":"create",
  "DB":"study","找工作":"work","game":"uncategorized",
};

export function parseForestCSV(text) {
  const lines = text.split("\n").slice(1);
  const records = [];
  const newTags = new Set();

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
    const mappedTree = TREE_MAP[treeType] || "pine";
    const mappedTag = TAG_MAP[tag] || tag.toLowerCase().replace(/\s+/g, "_") || "uncategorized";
    if (!TAG_MAP[tag] && tag !== "未设置" && tag !== "blank") newTags.add(tag);
    records.push({
      id: 100000 + i,
      tag: mappedTag,
      tree: mappedTree,
      duration: dur,
      date: start,
      completed: true,
    });
  });

  return { records, newTags: [...newTags] };
}
