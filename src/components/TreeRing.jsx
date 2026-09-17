import { useState, useEffect, useRef } from "react";
import { treePixels } from "./treePixels";

// ---- Combined Ring: tree inside + dial outside ----
// 360° = 60 min. Delta-based drag accumulates time, clamped 5–120.
export function TreeRing({ treeId, stage, duration, onDurationChange, ringSize, isFocus, timeLeft, totalTime, stopwatch, focusLabel="专注中" }) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const justDragged = useRef(false);
  const prevDeg = useRef(null);
  const rawValue = useRef(duration);
  const [dragActive, setDragActive] = useState(false);
  const [dragRaw, setDragRaw] = useState(null); // continuous value while dragging
  const [numBounce, setNumBounce] = useState(false);
  const prevDuration = useRef(duration);

  // don't clobber the continuous drag value when duration snaps mid-drag
  useEffect(() => { if (!dragging.current) rawValue.current = duration; }, [duration]);

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

  // while dragging, handle/arc follow the finger continuously (dragRaw);
  // when idle they use the snapped duration. Committed value still snaps to 5-min.
  const shown = (dragActive && dragRaw !== null) ? dragRaw : duration;
  const lapMin = shown === 0 ? 0 : (shown % 60 || 60);
  const arcAngle = (lapMin / 60) * 360;
  const isSecondLap = shown > 60;
  const isFullCircle = arcAngle >= 359.9;

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
    setDragRaw(rawValue.current); // handle/arc track the finger smoothly
    const snapped = Math.max(0, Math.min(120, Math.round(rawValue.current / 5) * 5));
    onDurationChange(snapped);
  };

  const onPD = (e) => {
    if (isFocus) return;
    dragging.current = true;
    setDragActive(true);
    prevDeg.current = null;
    rawValue.current = duration;
    setDragRaw(duration);
    e.target.setPointerCapture(e.pointerId);
  };
  const onPM = (e) => { if (dragging.current) handleDrag(e.clientX, e.clientY); };
  const onPU = () => {
    dragging.current = false;
    justDragged.current = true;
    setDragActive(false);
    setDragRaw(null); // settle onto the snapped duration
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

        {/* large transparent touch target — easy to grab on mobile (~48px) */}
        <circle cx={hx} cy={hy} r={24} fill="transparent"
          style={{ cursor: "grab" }}
          onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} />
        {/* visible handle — snaps to grid, grows on drag */}
        <circle cx={hx} cy={hy} r={handleR} fill="#3a3530" stroke="#faf6ee" strokeWidth={2.5}
          style={{ pointerEvents: "none", transition: "r 0.12s ease-out" }} />
        {/* second lap indicator ring on handle */}
        {isSecondLap &&
          <circle cx={hx} cy={hy} r={handleR - 4} fill="none" stroke="#faf6ee" strokeWidth={1.5}
            style={{ pointerEvents: "none" }} />}
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
