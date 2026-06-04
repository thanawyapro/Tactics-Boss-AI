import React, { useState, useEffect, useRef } from 'react';
import { Pencil, Eraser, RotateCcw, Shield, Swords, MousePointerClick } from 'lucide-react';

interface PlayerNode {
  id: string;
  role: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  isOpponent: boolean;
}

interface TacticalBoardProps {
  formation: string;
  opponentFormation: string;
  lang: 'ar' | 'en' | 'es' | 'fr';
}

export default function TacticalBoard({ formation, opponentFormation, lang }: TacticalBoardProps) {
  const [players, setPlayers] = useState<PlayerNode[]>([]);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawMode, setDrawMode] = useState<'drag' | 'draw'>('drag');
  const [drawColor, setDrawColor] = useState<string>('#facc15'); // default yellow ink
  const [teamColor, setTeamColor] = useState<string>('#8b5cf6'); // violet
  const [oppTeamColor, setOppTeamColor] = useState<string>('#ef4444'); // red

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isScribbling = useRef(false);

  // Default coordinate helpers
  const getFormationCoordinates = (formStr: string, isOpp: boolean): { role: string; x: number; y: number }[] => {
    const cleanForm = formStr.replace(/\s+/g, '').split('(')[0] || '4-3-3';

    let positions = [
      { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
      { role: 'CB1', x: 35, y: isOpp ? 26 : 74 },
      { role: 'CB2', x: 65, y: isOpp ? 26 : 74 },
      { role: 'LB', x: 15, y: isOpp ? 32 : 68 },
      { role: 'RB', x: 85, y: isOpp ? 32 : 68 },
      { role: 'DMF', x: 50, y: isOpp ? 50 : 50 },
      { role: 'CM1', x: 30, y: isOpp ? 58 : 42 },
      { role: 'CM2', x: 70, y: isOpp ? 58 : 42 },
      { role: 'LW', x: 15, y: isOpp ? 80 : 20 },
      { role: 'RW', x: 85, y: isOpp ? 80 : 20 },
      { role: 'ST', x: 50, y: isOpp ? 85 : 15 },
    ];

    if (cleanForm.includes('4-2-3-1')) {
      positions = [
        { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
        { role: 'CB1', x: 35, y: isOpp ? 26 : 74 },
        { role: 'CB2', x: 65, y: isOpp ? 26 : 74 },
        { role: 'LB', x: 15, y: isOpp ? 32 : 68 },
        { role: 'RB', x: 85, y: isOpp ? 32 : 68 },
        { role: 'LDM', x: 35, y: isOpp ? 44 : 56 },
        { role: 'RDM', x: 65, y: isOpp ? 44 : 56 },
        { role: 'LM', x: 15, y: isOpp ? 65 : 35 },
        { role: 'RM', x: 85, y: isOpp ? 65 : 35 },
        { role: 'AM', x: 50, y: isOpp ? 68 : 32 },
        { role: 'ST', x: 50, y: isOpp ? 85 : 15 },
      ];
    } else if (cleanForm.includes('4-4-2')) {
      positions = [
        { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
        { role: 'CB1', x: 35, y: isOpp ? 26 : 74 },
        { role: 'CB2', x: 65, y: isOpp ? 26 : 74 },
        { role: 'LB', x: 15, y: isOpp ? 32 : 68 },
        { role: 'RB', x: 85, y: isOpp ? 32 : 68 },
        { role: 'LCM', x: 35, y: isOpp ? 52 : 48 },
        { role: 'RCM', x: 65, y: isOpp ? 52 : 48 },
        { role: 'LM', x: 15, y: isOpp ? 62 : 38 },
        { role: 'RM', x: 85, y: isOpp ? 62 : 38 },
        { role: 'ST1', x: 35, y: isOpp ? 82 : 18 },
        { role: 'ST2', x: 65, y: isOpp ? 82 : 18 },
      ];
    } else if (cleanForm.includes('3-5-2') || cleanForm.includes('352')) {
      positions = [
        { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
        { role: 'CB1', x: 30, y: isOpp ? 26 : 74 },
        { role: 'CB', x: 50, y: isOpp ? 24 : 76 },
        { role: 'CB2', x: 70, y: isOpp ? 26 : 74 },
        { role: 'LDM', x: 35, y: isOpp ? 48 : 52 },
        { role: 'RDM', x: 65, y: isOpp ? 48 : 52 },
        { role: 'LM', x: 12, y: isOpp ? 56 : 44 },
        { role: 'RM', x: 88, y: isOpp ? 56 : 44 },
        { role: 'CAM', x: 50, y: isOpp ? 66 : 34 },
        { role: 'ST1', x: 35, y: isOpp ? 82 : 18 },
        { role: 'ST2', x: 65, y: isOpp ? 82 : 18 },
      ];
    } else if (cleanForm.includes('5-3-2')) {
      positions = [
        { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
        { role: 'CB1', x: 35, y: isOpp ? 26 : 74 },
        { role: 'CB2', x: 50, y: isOpp ? 25 : 75 },
        { role: 'CB3', x: 65, y: isOpp ? 26 : 74 },
        { role: 'LWB', x: 12, y: isOpp ? 36 : 64 },
        { role: 'RWB', x: 88, y: isOpp ? 36 : 64 },
        { role: 'LCM', x: 33, y: isOpp ? 54 : 46 },
        { role: 'RCM', x: 67, y: isOpp ? 54 : 46 },
        { role: 'AM', x: 50, y: isOpp ? 67 : 33 },
        { role: 'ST1', x: 35, y: isOpp ? 82 : 18 },
        { role: 'ST2', x: 65, y: isOpp ? 82 : 18 },
      ];
    } else if (cleanForm.includes('4-2-4') || cleanForm.includes('424')) {
      positions = [
        { role: 'GK', x: 50, y: isOpp ? 12 : 88 },
        { role: 'CB1', x: 35, y: isOpp ? 26 : 74 },
        { role: 'CB2', x: 65, y: isOpp ? 26 : 74 },
        { role: 'LB', x: 15, y: isOpp ? 32 : 68 },
        { role: 'RB', x: 85, y: isOpp ? 32 : 68 },
        { role: 'LCM', x: 35, y: isOpp ? 52 : 48 },
        { role: 'RCM', x: 65, y: isOpp ? 52 : 48 },
        { role: 'LW', x: 15, y: isOpp ? 78 : 22 },
        { role: 'RW', x: 85, y: isOpp ? 78 : 22 },
        { role: 'ST1', x: 35, y: isOpp ? 84 : 16 },
        { role: 'ST2', x: 65, y: isOpp ? 84 : 16 },
      ];
    }

    return positions;
  };

  // Setup/Reset players state
  const resetBoard = () => {
    const homeCoords = getFormationCoordinates(formation, false);
    const oppCoords = getFormationCoordinates(opponentFormation || '4-4-2', true);

    const initialNodes: PlayerNode[] = [
      ...homeCoords.map((c, i) => ({
        id: `home-${i}`,
        role: c.role,
        x: c.x,
        y: c.y,
        isOpponent: false
      })),
      ...oppCoords.map((c, i) => ({
        id: `opp-${i}`,
        role: c.role,
        x: c.x,
        y: c.y,
        isOpponent: true
      }))
    ];

    setPlayers(initialNodes);
    clearBoardLines();
  };

  useEffect(() => {
    resetBoard();
  }, [formation, opponentFormation]);

  // Adjust canvas size on mount
  useEffect(() => {
    if (canvasRef.current && containerRef.current) {
      const canvas = canvasRef.current;
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;
    }
  }, [canvasRef, containerRef]);

  // Handle Drag Move logic (mouse + touch interface)
  const handleStartDrag = (id: string) => {
    if (drawMode !== 'drag') return;
    setActiveDragId(id);
  };

  const handleDragUpdate = (clientX: number, clientY: number) => {
    if (!activeDragId || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    let newX = ((clientX - rect.left) / rect.width) * 100;
    let newY = ((clientY - rect.top) / rect.height) * 100;

    // Bounds checking to keep players on the soccer field safely
    newX = Math.max(4, Math.min(96, newX));
    newY = Math.max(4, Math.min(96, newY));

    setPlayers((prev) =>
      prev.map((player) => (player.id === activeDragId ? { ...player, x: newX, y: newY } : player))
    );
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (activeDragId) {
      handleDragUpdate(e.clientX, e.clientY);
    }
  };

  const handlePointerUp = () => {
    setActiveDragId(null);
  };

  // Chalkboard Scribbling Controls
  const startDrawingLine = (clientX: number, clientY: number) => {
    if (drawMode !== 'draw' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = drawColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    isScribbling.current = true;
  };

  const drawLineStep = (clientX: number, clientY: number) => {
    if (!isScribbling.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endLineDrawing = (clientX: number, clientY: number) => {
    if (!isScribbling.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      isScribbling.current = false;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Optionally draw a futuristic soccer run arrow head at the tip!
    drawArrowHead(ctx, x, y);
    isScribbling.current = false;
  };

  const drawArrowHead = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Basic arrow markup
    ctx.fillStyle = drawColor;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
  };

  const clearBoardLines = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Control Tools Header */}
      <div className="flex items-center justify-between bg-slate-900/80 p-2.5 rounded-xl border border-white/5 text-xs text-slate-300">
        <div className="flex items-center gap-2">
          {/* Mode switch */}
          <button
            type="button"
            onClick={() => setDrawMode('drag')}
            className={`flex items-center gap-1.5 p-1.5 px-3 rounded-lg transition ${drawMode === 'drag' ? 'bg-violet-600 font-extrabold text-white shadow' : 'bg-white/5'}`}
          >
            <MousePointerClick size={13} />
            <span>{lang === 'ar' ? 'تحريك اللاعبين' : 'Drag Players'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setDrawMode('draw')}
            className={`flex items-center gap-1.5 p-1.5 px-3 rounded-lg transition ${drawMode === 'draw' ? 'bg-amber-600 font-extrabold text-white shadow' : 'bg-white/5'}`}
          >
            <Pencil size={13} />
            <span>{lang === 'ar' ? 'رسم تكتيك' : 'Draw Paths'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {drawMode === 'draw' && (
            <div className="flex items-center gap-1.5">
              {['#facc15', '#ef4444', '#38bdf8', '#ffffff'].map((color) => (
                <button
                  key={color}
                  type="button"
                  style={{ backgroundColor: color }}
                  onClick={() => setDrawColor(color)}
                  className={`w-4 h-4 rounded-full border-2 transition ${drawColor === color ? 'border-indigo-400 scale-125' : 'border-slate-950/80'}`}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={clearBoardLines}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white"
            title={lang === 'ar' ? 'مسح الرسم' : 'Clear drawing'}
          >
            <Eraser size={13} />
          </button>

          <button
            type="button"
            onClick={resetBoard}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 hover:text-white flex items-center gap-1 text-[10px]"
            title={lang === 'ar' ? 'إعادة تعيين كاملة' : 'Realign pitch'}
          >
            <RotateCcw size={13} />
            <span>{lang === 'ar' ? 'تهيئة' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Field container */}
      <div 
        ref={containerRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-[400px] rounded-2xl pitch-container relative overflow-hidden shadow-inner select-none"
        style={{ touchAction: 'none' }} // Crucial to disable standard browser scrolling on mobile while dragging players
      >
        {/* Pitch line metrics overlay */}
        <div className="absolute inset-x-0 inset-y-0 opacity-15 pointer-events-none">
          {/* stripes */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_50%,transparent_50%)] bg-[size:100%_40px]" />
          {/* Halfway line marker */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white -translate-y-1/2" />
          {/* center circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full border-2 border-white" />
          {/* Penalty box home */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-20 border-t-2 border-x-2 border-white rounded-t" />
          {/* Penalty box opponent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 border-b-2 border-x-2 border-white rounded-b" />
          {/* penalty spot */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full" />
        </div>

        {/* Tactical board drawing canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => startDrawingLine(e.clientX, e.clientY)}
          onMouseMove={(e) => drawLineStep(e.clientX, e.clientY)}
          onMouseUp={(e) => endLineDrawing(e.clientX, e.clientY)}
          onTouchStart={(e) => startDrawingLine(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchMove={(e) => drawLineStep(e.touches[0].clientX, e.touches[0].clientY)}
          onTouchEnd={(e) => endLineDrawing(e.changedTouches[0].clientX, e.changedTouches[0].clientY)}
          className={`absolute inset-0 w-full h-full ${drawMode === 'draw' ? 'cursor-crosshair z-20' : 'pointer-events-none z-10'}`}
        />

        {/* Drag-and-drop Player Node elements */}
        {players.map((p) => {
          const colorBg = p.isOpponent ? oppTeamColor : teamColor;
          const colorText = '#ffffff';

          return (
            <div
              key={p.id}
              onPointerDown={() => handleStartDrag(p.id)}
              className="absolute -translate-x-1/2 -translate-y-1/2 active:scale-110 select-none z-30 transition-transform cursor-pointer"
              style={{ 
                top: `${p.y}%`, 
                left: `${p.x}%`,
                touchAction: 'none'
              }}
            >
              {/* Outer pulsing glow */}
              <div 
                className="absolute -inset-1.5 rounded-full filter blur-sm opacity-40 animate-pulse pointer-events-none" 
                style={{ backgroundColor: colorBg }}
              />

              <div 
                className="w-8 h-8 rounded-full border-2 border-slate-950/90 shadow-2xl flex flex-col items-center justify-center font-mono font-black scale-90 md:scale-100 hover:scale-[1.05]"
                style={{ 
                  backgroundColor: colorBg, 
                  color: colorText,
                }}
              >
                <span className="text-[8px] leading-tight font-extrabold">{p.role}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Color Controls */}
      <div className="flex gap-2 items-center justify-between text-[10px] bg-slate-900/40 p-2 rounded-xl text-slate-300">
        <div className="flex items-center gap-1.5">
          <Shield size={10} className="text-violet-400" />
          <span>{lang === 'ar' ? 'لون فريقك:' : 'Your Team Color:'}</span>
          {['#8b5cf6', '#3b82f6', '#10b981', '#ffffff', '#eab308'].map((c) => (
            <button
              key={c}
              type="button"
              style={{ backgroundColor: c }}
              onClick={() => setTeamColor(c)}
              className={`w-3 h-3 rounded-full border border-slate-950/80 ${teamColor === c ? 'ring-2 ring-indigo-500' : ''}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <Swords size={10} className="text-red-400" />
          <span>{lang === 'ar' ? 'لون خصمك:' : 'Opponent Color:'}</span>
          {['#ef4444', '#f97316', '#ec4899', '#1e293b', '#a855f7'].map((c) => (
            <button
              key={c}
              type="button"
              style={{ backgroundColor: c }}
              onClick={() => setOppTeamColor(c)}
              className={`w-3 h-3 rounded-full border border-slate-950/80 ${oppTeamColor === c ? 'ring-2 ring-red-500' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
