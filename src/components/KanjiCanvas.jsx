'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

export default function KanjiCanvas({
  targetKanji = '',
  expectedStrokes = 0,
  onStrokeChange,
  showGhostDefault = false,
  size = 280,
  className = '',
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState([]); // Array of strokes, each stroke is [{x, y}]
  const [currentStroke, setCurrentStroke] = useState([]);
  const [showGhost, setShowGhost] = useState(showGhostDefault);

  // Redraw canvas whenever strokes or showGhost changes
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);

    // Draw Japanese Genko Yoshi Guideline Grid (米字格)
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);

    // Horizontal & Vertical Center Crosshairs
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.stroke();

    // Diagonals (X-cross)
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width, height);
    ctx.moveTo(width, 0);
    ctx.lineTo(0, height);
    ctx.stroke();
    ctx.restore();

    // Draw Ghost Reference Character if enabled
    if (showGhost && targetKanji) {
      ctx.save();
      ctx.fillStyle = '#cbd5e1';
      ctx.font = `900 ${Math.round(width * 0.72)}px "Noto Sans JP", "Hiragino Sans", "Meiryo", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(targetKanji, width / 2, height / 2 + width * 0.05);
      ctx.restore();
    }

    // Draw Completed Strokes (Calligraphy Ink style)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(7, Math.round(width * 0.035));

    const allStrokesToRender = [...strokes];
    if (currentStroke.length > 0) {
      allStrokesToRender.push(currentStroke);
    }

    allStrokesToRender.forEach((stroke) => {
      if (stroke.length < 2) {
        if (stroke.length === 1) {
          ctx.beginPath();
          ctx.arc(stroke[0].x, stroke[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
        return;
      }

      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);

      // Smooth bezier curves between points
      for (let i = 1; i < stroke.length - 1; i++) {
        const xc = (stroke[i].x + stroke[i + 1].x) / 2;
        const yc = (stroke[i].y + stroke[i + 1].y) / 2;
        ctx.quadraticCurveTo(stroke[i].x, stroke[i].y, xc, yc);
      }

      const lastPoint = stroke[stroke.length - 1];
      const secondLastPoint = stroke[stroke.length - 2];
      ctx.quadraticCurveTo(
        secondLastPoint.x,
        secondLastPoint.y,
        lastPoint.x,
        lastPoint.y
      );
      ctx.stroke();
    });

    ctx.restore();
  }, [strokes, currentStroke, showGhost, targetKanji]);

  // Adjust canvas for display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = size;
    canvas.height = size;
    redraw();
  }, [size, redraw]);

  // Notify parent of stroke count changes
  useEffect(() => {
    if (onStrokeChange) {
      onStrokeChange(strokes.length);
    }
  }, [strokes.length, onStrokeChange]);

  const getCanvasCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (e) => {
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const point = getCanvasCoordinates(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getCanvasCoordinates(e);
    setCurrentStroke((prev) => [...prev, point]);
  };

  const handlePointerUp = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    if (currentStroke.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke([]);
    }
  };

  const handleUndo = () => {
    setStrokes((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
  };

  const isStrokeMatched = expectedStrokes > 0 && strokes.length === expectedStrokes;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Canvas Box */}
      <div className="relative rounded-3xl border-2 border-slate-300/80 bg-white shadow-md overflow-hidden p-1.5 transition-all">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            touchAction: 'none',
          }}
          className="cursor-crosshair block rounded-2xl bg-[#FCFCFA]"
        />

        {/* Top-right Stroke Count Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 pointer-events-none">
          <span
            className={`text-xs font-black px-2.5 py-1 rounded-xl border shadow-2xs transition-all ${
              isStrokeMatched
                ? 'bg-emerald-500 text-white border-emerald-600 ring-2 ring-emerald-300'
                : strokes.length > expectedStrokes && expectedStrokes > 0
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-white/90 backdrop-blur-xs text-slate-700 border-slate-200'
            }`}
          >
            {strokes.length} {expectedStrokes > 0 ? `/ ${expectedStrokes} 画` : '画'}
          </span>
        </div>
      </div>

      {/* Action Controls Bar */}
      <div className="flex items-center gap-2 mt-3 flex-wrap justify-center text-xs">
        {/* Undo Button */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="最後の1画を取り消す"
        >
          ↩ 1画戻る
        </button>

        {/* Clear Button */}
        <button
          type="button"
          onClick={handleClear}
          disabled={strokes.length === 0}
          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold transition-all shadow-xs disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
          title="すべて消去"
        >
          🗑️ 消去
        </button>

        {/* Ghost Guide Toggle */}
        {targetKanji && (
          <button
            type="button"
            onClick={() => setShowGhost(!showGhost)}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all border shadow-xs cursor-pointer ${
              showGhost
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="お手本の表示/非表示を切り替え"
          >
            お手本 {showGhost ? 'ON' : 'OFF'}
          </button>
        )}
      </div>
    </div>
  );
}

