import { treePixels } from "./treePixels";

// A shrunk pixel tree for any of the 10 species — reuse anywhere an emoji-sized
// icon is wanted (forest dots, buttons, labels). Renders the 16×16 pixel grid
// scaled to `size`px; stage 3 = fully grown.
export default function MiniTree({ treeId, size = 16, stage = 3 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16"
      style={{ imageRendering: "pixelated", display: "block", flexShrink: 0 }}>
      {treePixels(treeId, stage, 1)}
    </svg>
  );
}
