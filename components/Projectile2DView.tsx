'use client';
import { useEffect, useRef, useState } from 'react';
import { TrajectoryPoint } from '@/utils/physics';

interface Props {
  trajectory: TrajectoryPoint[];
  progressIndex: number;
}

export default function Projectile2DView({ trajectory, progressIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 800, h: 400 });

  // Handle Resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          w: containerRef.current.clientWidth,
          h: containerRef.current.clientHeight,
        });
      }
    };
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { w, h } = dimensions;
    
    // Support high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    // Current point
    const safeIndex = Math.min(progressIndex, Math.max(0, trajectory.length - 1));
    const currentPoint = trajectory[safeIndex] || trajectory[0];
    if (!currentPoint) return;

    // Clear background
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, w, h);

    // Camera settings
    // Scale: pixels per meter. Let's make the view cover a certain window size around the projectile.
    // e.g., view window is 1000m wide initially, but let's make it auto-scale or fixed scale?
    // User wants "camera mengikuti", so camera centers on projectile, but maybe zoomed out enough to see the ground?
    // Actually, fixed scale is good, maybe 5000m width?
    const viewWidthMeters = 3000; 
    let scale = w / viewWidthMeters;
    
    // We want the current point to be at the center of the screen
    const cx = w / 2;
    const cy = h / 2;

    // Calculate camera target in meters
    const camX = currentPoint.x;
    const camY = currentPoint.y;

    ctx.save();
    // Move origin to center of screen
    ctx.translate(cx, cy);
    // Scale (Y is flipped in canvas, so scale Y by -1)
    ctx.scale(scale, -scale);
    // Translate by negative camera position to move the world around the camera
    ctx.translate(-camX, -camY);

    // --- DRAW WORLD ---
    
    // Draw Dynamic Ground Polygon
    ctx.fillStyle = '#171717';
    ctx.beginPath();
    
    // Start way below
    ctx.moveTo(trajectory[0].x - viewWidthMeters * 2, -5000);
    
    // First point of ground
    const firstGround = trajectory[0].groundElev || 0;
    ctx.lineTo(trajectory[0].x - viewWidthMeters * 2, firstGround);
    
    // Walk trajectory points
    for (let i = 0; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x, trajectory[i].groundElev || 0);
    }
    
    // End point of ground
    const lastX = trajectory[trajectory.length - 1].x;
    const lastGround = trajectory[trajectory.length - 1].groundElev || 0;
    ctx.lineTo(lastX + viewWidthMeters * 2, lastGround);
    ctx.lineTo(lastX + viewWidthMeters * 2, -5000);
    ctx.closePath();
    ctx.fill();

    // Draw Topographic Surface Line
    ctx.strokeStyle = '#4ade80'; // Greenish for ground outline
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(trajectory[0].x - viewWidthMeters * 2, firstGround);
    for (let i = 0; i < trajectory.length; i++) {
      ctx.lineTo(trajectory[i].x, trajectory[i].groundElev || 0);
    }
    ctx.lineTo(lastX + viewWidthMeters * 2, lastGround);
    ctx.stroke();

    // Draw grid lines (every 1000m)
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1 / scale;
    const gridStart = Math.floor((camX - viewWidthMeters) / 1000) * 1000;
    const gridEnd = Math.ceil((camX + viewWidthMeters) / 1000) * 1000;
    for (let x = gridStart; x <= gridEnd; x += 1000) {
      ctx.beginPath();
      ctx.moveTo(x, -100);
      ctx.lineTo(x, Math.max(camY + 2000, 10000));
      ctx.stroke();
      
      // Draw distance labels
      ctx.save();
      ctx.scale(1, -1);
      ctx.fillStyle = '#555';
      ctx.font = `${10 / scale}px monospace`;
      ctx.fillText(`${x/1000}km`, x + 10, -10);
      ctx.restore();
    }

    // Draw Trajectory Trail
    if (safeIndex > 0) {
      ctx.strokeStyle = '#f97316'; // orange-500
      ctx.lineWidth = 3 / scale;
      ctx.beginPath();
      ctx.moveTo(trajectory[0].x, trajectory[0].y);
      for (let i = 1; i <= safeIndex; i++) {
        if (trajectory[i]) {
          ctx.lineTo(trajectory[i].x, trajectory[i].y);
        }
      }
      ctx.stroke();
    }

    // Draw Projectile
    ctx.fillStyle = '#ef4444'; // red-500
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, 8 / scale, 0, Math.PI * 2);
    ctx.fill();
    // Glow
    ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
    ctx.beginPath();
    ctx.arc(currentPoint.x, currentPoint.y, 20 / scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Reset transforms for HUD text (so text isn't flipped or scaled)

    // --- DRAW HUD NUMBERS (Real-time tracking next to projectile) ---
    // Projectile screen coordinates
    const projScreenX = cx; // Since camera centers on it
    const projScreenY = cy; 
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(projScreenX + 20, projScreenY - 60, 160, 80, 8);
    ctx.fill();
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`T: ${currentPoint.t.toFixed(1)} s`, projScreenX + 30, projScreenY - 40);
    
    ctx.fillStyle = '#a3a3a3';
    ctx.font = '11px monospace';
    ctx.fillText(`Alt : ${(currentPoint.y).toFixed(0)} m`, projScreenX + 30, projScreenY - 20);
    ctx.fillText(`Dist: ${(currentPoint.x).toFixed(0)} m`, projScreenX + 30, projScreenY - 5);
    ctx.fillText(`Vel : ${currentPoint.v.toFixed(0)} m/s`, projScreenX + 30, projScreenY + 10);

  }, [trajectory, progressIndex, dimensions]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#0a0a0a] rounded-lg">
      {/* Decorative Grid Overlay could be CSS, but we did it in canvas */}
      <canvas 
        ref={canvasRef} 
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
      <div className="absolute top-4 left-4 flex flex-col gap-1 pointer-events-none">
        <span className="text-orange-500 font-bold tracking-wider text-xs uppercase drop-shadow-md">
          Live Tracker Camera
        </span>
        <span className="text-neutral-400 text-[10px]">
          Fokus: Auto-Tracking Proyektil Utama
        </span>
      </div>
    </div>
  );
}
