import { useEffect, useRef, useState } from 'react';
import type { BackdropCondition } from '../icons';

interface Props {
  condition: BackdropCondition;
  isNight: boolean;
}

// ── Gradient per condition × time-of-day ────────────────────────────────────
function getGradient(condition: BackdropCondition, isNight: boolean): string {
  if (condition === 'thunderstorm') return 'from-zinc-950 via-[#05050a] to-zinc-950';
  if (isNight) {
    switch (condition) {
      case 'clear':         return 'from-slate-950 via-[#0d1b3e] to-indigo-950';
      case 'partly-cloudy': return 'from-slate-900 via-[#141f38] to-slate-900';
      case 'overcast':      return 'from-zinc-950 via-slate-900 to-zinc-950';
      case 'foggy':         return 'from-slate-800 via-zinc-800 to-slate-900';
      case 'drizzle':       return 'from-slate-900 via-zinc-900 to-slate-950';
      case 'rainy':         return 'from-slate-950 via-zinc-950 to-slate-950';
      case 'snowy':         return 'from-slate-950 via-[#0d1b3e] to-zinc-950';
      case 'showers':       return 'from-slate-900 via-zinc-900 to-slate-950';
      case 'snow-showers':  return 'from-slate-950 via-[#0f1a30] to-zinc-950';
    }
  } else {
    switch (condition) {
      case 'clear':         return 'from-sky-400 via-sky-300 to-amber-100';
      case 'partly-cloudy': return 'from-sky-300 via-sky-200 to-zinc-200';
      case 'overcast':      return 'from-zinc-500 via-slate-400 to-zinc-400';
      case 'foggy':         return 'from-zinc-200 via-slate-100 to-zinc-200';
      case 'drizzle':       return 'from-slate-400 via-zinc-300 to-slate-400';
      case 'rainy':         return 'from-slate-600 via-zinc-600 to-slate-600';
      case 'snowy':         return 'from-sky-200 via-blue-100 to-slate-100';
      case 'showers':       return 'from-slate-400 via-sky-200 to-zinc-300';
      case 'snow-showers':  return 'from-sky-200 via-slate-200 to-blue-100';
    }
  }
  return 'from-slate-900 to-slate-800';
}

// ── Canvas particle config ───────────────────────────────────────────────────
type RainIntensity = 'none' | 'light' | 'medium' | 'heavy' | 'violent';

function getRainIntensity(condition: BackdropCondition): RainIntensity {
  if (condition === 'drizzle')      return 'light';
  if (condition === 'showers')      return 'medium';
  if (condition === 'rainy')        return 'heavy';
  if (condition === 'thunderstorm') return 'violent';
  return 'none';
}

function getSnowIntensity(condition: BackdropCondition): 'none' | 'light' | 'heavy' {
  if (condition === 'snow-showers') return 'light';
  if (condition === 'snowy')        return 'heavy';
  return 'none';
}

export function WeatherBackdrop({ condition, isNight }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [lightning, setLightning] = useState(false);

  // Lightning flash for thunderstorm
  useEffect(() => {
    if (condition !== 'thunderstorm') return;
    let timer: ReturnType<typeof setTimeout>;
    const scheduleFlash = () => {
      timer = setTimeout(() => {
        setLightning(true);
        setTimeout(() => {
          setLightning(false);
          setTimeout(() => {
            setLightning(true);
            setTimeout(() => { setLightning(false); scheduleFlash(); }, 60 + Math.random() * 80);
          }, 80);
        }, 70 + Math.random() * 100);
      }, 2500 + Math.random() * 6000);
    };
    scheduleFlash();
    return () => clearTimeout(timer);
  }, [condition]);

  // Canvas particles: stars, rain, snow
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const onResize = () => { if (!canvas) return; w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
    window.addEventListener('resize', onResize);

    // Stars — clear+night, partly-cloudy+night (sparser)
    type Star = { x: number; y: number; r: number; speed: number; phase: number };
    const stars: Star[] = [];
    if (isNight && (condition === 'clear' || condition === 'partly-cloudy')) {
      const density = condition === 'clear' ? 7000 : 14000;
      const count = Math.floor((w * h) / density);
      for (let i = 0; i < count; i++) {
        stars.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.5 + 0.4, speed: Math.random() * 0.04 + 0.01, phase: Math.random() * Math.PI * 2 });
      }
    }

    // Rain
    type Drop = { x: number; y: number; len: number; speed: number; opacity: number; w: number };
    const drops: Drop[] = [];
    const rainIntensity = getRainIntensity(condition);
    if (rainIntensity !== 'none') {
      const cfg = {
        light:   { count: 140, len: [6,  12], speed: [3,  6],  opacity: [0.22, 0.40] },
        medium:  { count: 220, len: [12, 20], speed: [7,  11], opacity: [0.32, 0.50] },
        heavy:   { count: 300, len: [15, 28], speed: [10, 16], opacity: [0.38, 0.60] },
        violent: { count: 360, len: [18, 32], speed: [14, 22], opacity: [0.42, 0.65] },
      }[rainIntensity];
      const maxCount = Math.min(cfg.count, Math.floor((w * h) / 1800));
      for (let i = 0; i < maxCount; i++) {
        drops.push({
          x: Math.random() * w,
          y: Math.random() * h,
          len: cfg.len[0] + Math.random() * (cfg.len[1] - cfg.len[0]),
          speed: cfg.speed[0] + Math.random() * (cfg.speed[1] - cfg.speed[0]),
          opacity: cfg.opacity[0] + Math.random() * (cfg.opacity[1] - cfg.opacity[0]),
          w: Math.random() < 0.25 ? 1.5 : 1,
        });
      }
    }

    // Snow
    type Flake = { x: number; y: number; r: number; speed: number; opacity: number; drift: number };
    const flakes: Flake[] = [];
    const snowIntensity = getSnowIntensity(condition);
    if (snowIntensity !== 'none') {
      const count = Math.min(snowIntensity === 'heavy' ? 90 : 50, Math.floor((w * h) / 7000));
      for (let i = 0; i < count; i++) {
        flakes.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 3 + 1, speed: Math.random() * 1.2 + 0.4, opacity: Math.random() * 0.7 + 0.2, drift: (Math.random() - 0.5) * 0.8 });
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Stars
      if (stars.length) {
        ctx.fillStyle = 'white';
        for (const s of stars) {
          s.phase += s.speed;
          ctx.globalAlpha = Math.max(0.05, Math.min(0.3 + Math.sin(s.phase) * 0.6, 1));
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      // Rain
      if (drops.length) {
        ctx.lineCap = 'round';
        for (const d of drops) {
          ctx.globalAlpha = d.opacity;
          ctx.lineWidth = d.w;
          ctx.strokeStyle = isNight ? 'rgba(180, 210, 255, 0.9)' : 'rgba(90, 130, 170, 0.8)';
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x - 2.5, d.y + d.len);
          ctx.stroke();
          d.y += d.speed;
          d.x -= 1.5;
          if (d.y > h || d.x < -20) { d.y = -d.len; d.x = Math.random() * (w + 60); }
        }
        ctx.globalAlpha = 1;
      }

      // Snow
      if (flakes.length) {
        ctx.fillStyle = isNight ? 'white' : 'rgba(100, 130, 170, 0.85)';
        for (const f of flakes) {
          ctx.globalAlpha = f.opacity;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();
          f.y += f.speed;
          f.x += f.drift + Math.sin(f.y / 40) * 0.4;
          if (f.y > h) { f.y = -10; f.x = Math.random() * w; }
        }
        ctx.globalAlpha = 1;
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); };
  }, [condition, isNight]);

  const needsCanvas =
    (isNight && (condition === 'clear' || condition === 'partly-cloudy')) ||
    ['drizzle', 'rainy', 'showers', 'thunderstorm', 'snowy', 'snow-showers'].includes(condition);

  // Cloud fill colours per condition
  const cloudFill = (opacity: number) => {
    if (condition === 'thunderstorm') return `rgba(30,30,40,${opacity})`;
    if (condition === 'rainy')        return isNight ? `rgba(40,50,70,${opacity})` : `rgba(70,80,100,${opacity})`;
    if (condition === 'drizzle')      return isNight ? `rgba(60,70,90,${opacity})` : `rgba(110,120,140,${opacity})`;
    if (condition === 'showers')      return isNight ? `rgba(50,60,80,${opacity})` : `rgba(90,100,120,${opacity})`;
    if (condition === 'overcast')     return isNight ? `rgba(50,50,60,${opacity})` : `rgba(130,135,145,${opacity})`;
    if (condition === 'snowy' || condition === 'snow-showers') return isNight ? `rgba(40,55,80,${opacity})` : `rgba(180,210,240,${opacity})`;
    // partly-cloudy, clear
    return isNight ? `rgba(255,255,255,${opacity * 0.4})` : `rgba(255,255,255,${opacity})`;
  };

  const showClouds = condition !== 'clear' && condition !== 'foggy';
  const cloudDensity: Record<BackdropCondition, number> = {
    'clear': 0, 'partly-cloudy': 0.35, 'overcast': 0.75,
    'foggy': 0, 'drizzle': 0.65, 'rainy': 0.8,
    'snowy': 0.55, 'showers': 0.65, 'snow-showers': 0.5, 'thunderstorm': 0.9,
  };
  const opacity = cloudDensity[condition];

  return (
    <div className={`fixed inset-0 w-full h-full -z-10 transition-all duration-1000 bg-gradient-to-b ${getGradient(condition, isNight)} overflow-hidden`}>

      {/* Sun glow — clear/partly-cloudy day */}
      {!isNight && (condition === 'clear' || condition === 'partly-cloudy') && (
        <div className="absolute top-0 right-0 w-[55vw] h-[55vw] pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-radial from-amber-300/30 via-yellow-100/5 to-transparent blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Moon glow — clear/partly-cloudy night */}
      {isNight && (condition === 'clear' || condition === 'partly-cloudy') && (
        <div className="absolute top-[7%] right-[12%] w-20 h-20 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-yellow-100/10 blur-2xl animate-[pulse_6s_ease-in-out_infinite]" />
        </div>
      )}

      {/* Fog layers */}
      {condition === 'foggy' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute inset-0 ${isNight ? 'bg-zinc-800/40' : 'bg-white/30'}`} />
          <div className={`absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t ${isNight ? 'from-zinc-700/30' : 'from-white/40'} to-transparent`} />
          <div className={`absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b ${isNight ? 'from-zinc-800/20' : 'from-white/20'} to-transparent`} />
        </div>
      )}

      {/* Cloud layers */}
      {showClouds && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[6%] left-[-200px] animate-cloud-slow" style={{ opacity }}>
            <svg width="320" height="100" viewBox="0 0 320 100" fill={cloudFill(0.9)}>
              <path d="M55 70A28 28 0 0 1 100 42A42 42 0 0 1 188 36A36 36 0 0 1 256 56A24 24 0 0 1 278 70A20 20 0 0 1 256 90H76A20 20 0 0 1 55 70Z" />
            </svg>
          </div>
          <div className="absolute top-[28%] left-[-240px] animate-cloud-medium" style={{ opacity: opacity * 0.85 }}>
            <svg width="380" height="110" viewBox="0 0 380 110" fill={cloudFill(0.85)}>
              <path d="M60 78A30 30 0 0 1 108 48A46 46 0 0 1 200 42A40 40 0 0 1 276 62A28 28 0 0 1 300 78A24 24 0 0 1 276 102H84A24 24 0 0 1 60 78Z" />
            </svg>
          </div>
          <div className="absolute top-[58%] left-[-160px] animate-cloud-fast" style={{ opacity: opacity * 0.7 }}>
            <svg width="220" height="70" viewBox="0 0 220 70" fill={cloudFill(0.8)}>
              <path d="M34 50A18 18 0 0 1 62 30A26 26 0 0 1 116 26A22 22 0 0 1 156 40A18 18 0 0 1 170 50A14 14 0 0 1 154 64H50A14 14 0 0 1 34 50Z" />
            </svg>
          </div>
          {/* Extra cloud for dense conditions */}
          {(condition === 'rainy' || condition === 'thunderstorm' || condition === 'overcast') && (
            <div className="absolute top-[16%] left-[-180px] animate-cloud-medium" style={{ opacity, animationDelay: '-14s' }}>
              <svg width="280" height="88" viewBox="0 0 280 88" fill={cloudFill(0.95)}>
                <path d="M44 62A22 22 0 0 1 80 36A38 38 0 0 1 158 32A32 32 0 0 1 222 50A22 22 0 0 1 240 62A18 18 0 0 1 222 80H62A18 18 0 0 1 44 62Z" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Lightning flash overlay */}
      {lightning && (
        <div className="absolute inset-0 bg-white/20 pointer-events-none transition-opacity duration-75" />
      )}

      {/* Canvas particles */}
      {needsCanvas && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
      )}
    </div>
  );
}
