import { useState } from 'react';
import { LocationSearch } from './components/LocationSearch';
import { WeatherCard, buildDayData } from './components/WeatherCard';
import { RecommendationBanner } from './components/RecommendationBanner';
import { TaskGrid } from './components/TaskGrid';
import { HeroWeatherPanel } from './components/HeroWeatherPanel';
import { WeatherBackdrop } from './components/WeatherBackdrop';
import { useWeather } from './hooks/useWeather';
import { recommendDay } from './api/recommend';
import { getWeatherIcon, resolveBackdropTheme } from './icons';
import type { Location } from './types';

const TORONTO: Location = {
  name: 'Toronto',
  latitude: 43.6532,
  longitude: -79.3832,
  country: 'Canada',
  admin1: 'Ontario',
};

async function reverseGeocode(lat: number, lon: number): Promise<Location> {
  const res = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
  );
  const d = await res.json();
  return {
    name: d.city || d.locality || d.principalSubdivision || 'Your Location',
    latitude: lat,
    longitude: lon,
    country: d.countryName || '',
    admin1: d.principalSubdivision || undefined,
  };
}

export default function App() {
  const [location, setLocation] = useState<Location>(TORONTO);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [useFahrenheit, setUseFahrenheit] = useState(false);
  const [simulatedState, setSimulatedState] = useState<
    'live' | 'clear-day' | 'clear-night' | 'partly-cloudy' | 'overcast' |
    'foggy' | 'drizzle' | 'rainy' | 'snowy-day' | 'snowy-night' |
    'showers' | 'snow-showers' | 'thunderstorm'
  >('live');

  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function handleLocateMe() {
    if (!navigator.geolocation) { setLocateError('Geolocation not supported'); return; }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const loc = await reverseGeocode(coords.latitude, coords.longitude);
          setLocation(loc);
          setSelectedDayIndex(0);
        } catch {
          setLocation({ ...TORONTO, latitude: coords.latitude, longitude: coords.longitude, name: 'Your Location' });
          setSelectedDayIndex(0);
        } finally {
          setLocating(false);
        }
      },
      () => { setLocateError('Location access denied'); setLocating(false); },
      { timeout: 8000, maximumAge: 300_000 }
    );
  }

  const { data, loading, error } = useWeather(location);

  const selectedDay = data ? buildDayData(data.daily, selectedDayIndex) : null;
  const recommendation = selectedDay ? recommendDay(selectedDay) : null;

  const liveTheme = selectedDay && data
    ? resolveBackdropTheme(
      selectedDay.code,
      data.daily.sunrise[selectedDayIndex],
      data.daily.sunset[selectedDayIndex],
    )
    : { condition: 'clear' as const, isNight: false, label: 'Clear Sky' };

  const simulatorTheme = (() => {
    if (simulatedState === 'live') return liveTheme;
    if (simulatedState === 'clear-day') return { condition: 'clear' as const, isNight: false, label: 'Clear Sky' };
    if (simulatedState === 'clear-night') return { condition: 'clear' as const, isNight: true, label: 'Starry Night' };
    if (simulatedState === 'partly-cloudy') return { condition: 'partly-cloudy' as const, isNight: false, label: 'Partly Cloudy' };
    if (simulatedState === 'overcast') return { condition: 'overcast' as const, isNight: false, label: 'Overcast' };
    if (simulatedState === 'foggy') return { condition: 'foggy' as const, isNight: false, label: 'Foggy' };
    if (simulatedState === 'drizzle') return { condition: 'drizzle' as const, isNight: false, label: 'Drizzle' };
    if (simulatedState === 'rainy') return { condition: 'rainy' as const, isNight: false, label: 'Rain' };
    if (simulatedState === 'snowy-day') return { condition: 'snowy' as const, isNight: false, label: 'Snowy Day' };
    if (simulatedState === 'snowy-night') return { condition: 'snowy' as const, isNight: true, label: 'Snowy Night' };
    if (simulatedState === 'showers') return { condition: 'showers' as const, isNight: false, label: 'Rain Showers' };
    if (simulatedState === 'snow-showers') return { condition: 'snow-showers' as const, isNight: false, label: 'Snow Showers' };
    if (simulatedState === 'thunderstorm') return { condition: 'thunderstorm' as const, isNight: true, label: 'Thunderstorm' };
    return liveTheme;
  })();

  const activeCondition = simulatorTheme.condition;
  const activeIsNight = simulatorTheme.isNight;


  // Current temp / code from hourly data for today
  const currentHour = new Date().getHours();
  const currentTemp = data
    ? Math.round(data.hourly.temperature_2m[currentHour] ?? data.daily.temperature_2m_max[0])
    : null;
  const currentCode = data
    ? (data.hourly.weathercode[currentHour] ?? data.daily.weathercode[0])
    : 0;

  const avgHumidity = (() => {
    if (!data) return 60;
    const start = selectedDayIndex * 24;
    const slice = data.hourly.relative_humidity_2m.slice(start, start + 24);
    return slice.length ? slice.reduce((a, b) => a + b, 0) / slice.length : 60;
  })();

  const panelClass = activeIsNight ? 'glass-panel-dark' : 'glass-panel-light';
  const toneText = activeIsNight ? 'text-slate-200' : 'text-slate-800';
  const toneMuted = activeIsNight ? 'text-slate-400' : 'text-slate-500';
  const dividerClass = activeIsNight ? 'border-slate-700/40' : 'border-slate-300/30';

  // MUI icon for current weather in header
  const CurrentWeatherIcon = getWeatherIcon(currentCode);

  const simThemes = [
    { id: 'live' as const, label: 'Live' },
    { id: 'clear-day' as const, label: 'Sunny' },
    { id: 'clear-night' as const, label: 'Stars' },
    { id: 'partly-cloudy' as const, label: 'P. Cloudy' },
    { id: 'overcast' as const, label: 'Overcast' },
    { id: 'foggy' as const, label: 'Fog' },
    { id: 'drizzle' as const, label: 'Drizzle' },
    { id: 'rainy' as const, label: 'Rain' },
    { id: 'showers' as const, label: 'Showers' },
    { id: 'snowy-day' as const, label: 'Snow Day' },
    { id: 'snowy-night' as const, label: 'Snow Night' },
    { id: 'snow-showers' as const, label: 'Snow Shower' },
    { id: 'thunderstorm' as const, label: 'Thunder' },
  ];

  return (
    <div className="fixed inset-0 w-full h-[100dvh] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
      <WeatherBackdrop condition={activeCondition} isNight={activeIsNight} />

      <main
        className={`w-full max-w-2xl h-full max-h-[calc(100dvh-1rem)] sm:max-h-[calc(100dvh-2rem)] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col transition-all duration-500 ${panelClass} overflow-hidden`}
      >
        {/* ── HEADER — 2-row layout works at all sizes ── */}
        <header className={`px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b shrink-0 ${dividerClass}`}>
          {/* Row 1: brand + city (left) | unit toggle + temp badge (right) */}
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2 min-w-0 mr-3">
              <img src="/gardencast.png" alt="" className="w-24 h-24 rounded-xl shrink-0" />
              <div className="min-w-0">
                <h1 className={`font-pixel text-sm leading-none ${toneText}`}>GardenCast</h1>
                {location && (
                  <p className={`text-[11px] font-medium mt-1 truncate ${toneMuted}`}>
                    {location.name}{location.admin1 ? `, ${location.admin1}` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* °C / °F toggle */}
              <button
                onClick={() => setUseFahrenheit((f) => !f)}
                title={useFahrenheit ? 'Switch to Celsius' : 'Switch to Fahrenheit'}
                className={`px-2 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer
                  ${activeIsNight
                    ? 'bg-slate-800/70 border-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                    : 'bg-white/70 border-white/60 text-slate-700 shadow-sm hover:bg-white/90'}`}
              >
                {useFahrenheit ? '°F' : '°C'}
              </button>
              {/* Current temp badge */}
              {currentTemp !== null && (
                <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-bold text-nowrap border
                  ${activeIsNight ? 'bg-slate-800/70 border-slate-700/50 text-slate-100' : 'bg-white/70 border-white/60 text-slate-800 shadow-sm'}`}>
                  <CurrentWeatherIcon sx={{ fontSize: 14, color: activeIsNight ? '#a0c49d' : '#5c9ead' }} />
                  <span>{useFahrenheit ? `${Math.round(currentTemp * 9 / 5 + 32)}°` : `${currentTemp}°`}</span>
                </div>
              )}
            </div>
          </div>
          {/* Row 2: search + locate me button */}
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <LocationSearch
                onSelect={(loc) => { setLocation(loc); setSelectedDayIndex(0); }}
                selected={location}
                isNight={activeIsNight}
              />
            </div>
            <button
              onClick={handleLocateMe}
              disabled={locating}
              title="Use my location"
              className={`shrink-0 flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer
                ${locating ? 'opacity-50 cursor-not-allowed' : ''}
                ${activeIsNight
                  ? 'bg-slate-800/70 border-slate-700/50 text-slate-300 hover:bg-slate-700/70'
                  : 'bg-white/70 border-white/60 text-slate-700 shadow-sm hover:bg-white/90'}
              `}
            >
              {locating ? (
                <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
              ) : (
                <svg aria-hidden="true" width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="6.5" cy="6.5" r="5"/><circle cx="6.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
              )}
              <span className="hidden sm:inline">{locating ? 'Locating…' : 'Locate me'}</span>
            </button>
          </div>
          {locateError && (
            <p className={`text-[10px] mt-1.5 ${activeIsNight ? 'text-red-400' : 'text-red-500'}`}>
              {locateError}
            </p>
          )}
        </header>

        {/* ── SCROLLABLE BODY ─────────────────────────── */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-4 sm:px-6 py-4">

          {/* ── LOADING SKELETON ────────────────────────── */}
          {loading && <SkeletonLoader isNight={activeIsNight} />}

          {/* ── ERROR ───────────────────────────────────── */}
          {error && !loading && (
            <section className="text-center py-10 flex flex-col items-center gap-4 pt-8">
              <div className={`text-4xl font-thin ${toneText}`}>!</div>
              <div>
                <h3 className={`font-bold text-lg ${toneText}`}>Unable to load weather</h3>
                <p className={`text-sm mt-1 max-w-sm mx-auto ${toneMuted}`}>{error}</p>
              </div>
              <button
                onClick={() => setLocation({ ...location })}
                className="px-4 py-2 bg-[#a0c49d] text-slate-900 rounded-xl text-sm font-bold shadow hover:opacity-90 transition-all"
              >
                Retry
              </button>
            </section>
          )}

          {/* ── MAIN CONTENT ────────────────────────────── */}
          {data && !loading && !error && selectedDay && recommendation && (
            <div className="flex flex-col gap-6 pt-6">

              {/* 1. HERO — weather icon + temp + stats + hourly chart */}
              <section>
                <HeroWeatherPanel
                  code={selectedDay.code}
                  tempMax={selectedDay.tempMax}
                  tempMin={selectedDay.tempMin}
                  currentTemp={currentTemp ?? Math.round(selectedDay.tempMax)}
                  precipProbability={selectedDay.precipProbability}
                  windMax={selectedDay.windMax}
                  humidity={avgHumidity}
                  uvMax={selectedDay.uvMax ?? 0}
                  hourly={data.hourly}
                  dayIndex={selectedDayIndex}
                  isNight={activeIsNight}
                  useFahrenheit={useFahrenheit}
                />
              </section>

              {/* Divider */}
              <div className={`border-t ${dividerClass}`} />

              {/* 2. RECOMMENDATION BANNER */}
              <section>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${toneMuted}`}>
                  Garden Recommendation
                </p>
                <RecommendationBanner recommendation={recommendation} isNight={activeIsNight} />
              </section>

              {/* 3. TASK GRID */}
              {recommendation.tasks.length > 0 && (
                <section>
                  <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${toneMuted}`}>
                    Action Tasks
                  </p>
                  <TaskGrid tasks={recommendation.tasks} isNight={activeIsNight} />
                </section>
              )}

              {/* Disclaimer */}
              <p className={`text-[10px] leading-relaxed ${toneMuted} opacity-60 flex gap-1.5 items-start`}>
                <span className="shrink-0 font-bold">!</span>
                You know your garden best. These suggestions are based on forecast data — factor in your soil, your plants, and your own care history before acting.
              </p>

              {/* Divider */}
              <div className={`border-t ${dividerClass}`} />

              {/* 4. 7-DAY FORECAST */}
              <section>
                <p className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 ${toneMuted}`}>
                  7-Day Forecast
                </p>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {data.daily.time.map((_, i) => (
                    <WeatherCard
                      key={i}
                      day={buildDayData(data.daily, i)}
                      isToday={i === 0}
                      selected={i === selectedDayIndex}
                      isNight={activeIsNight}
                      useFahrenheit={useFahrenheit}
                      onClick={() => setSelectedDayIndex(i)}
                    />
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ── EMPTY STATE ─────────────────────────────── */}
          {!location && !loading && !error && (
            <section className="text-center py-16 flex flex-col items-center gap-4">
              <div className={`opacity-20 ${toneText}`}>
                <svg aria-hidden="true" width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="24" cy="24" r="20"/><circle cx="24" cy="24" r="6" fill="currentColor" stroke="none"/></svg>
              </div>
              <div>
                <h3 className={`font-bold text-lg ${toneText}`}>No location selected</h3>
                <p className={`text-sm mt-1 max-w-xs ${toneMuted}`}>
                  Search for a city above to get personalised garden advice.
                </p>
              </div>
            </section>
          )}

        </div> {/* end scrollable body */}

        {/* ── THEME SIMULATOR — pinned footer ─────────── */}
        <footer className={`shrink-0 px-4 sm:px-6 py-3 border-t ${dividerClass} flex flex-wrap items-center justify-center gap-2`}>
          <span className={`text-[9px] uppercase tracking-widest font-bold opacity-30 ${toneText} w-full text-center`}>
            Theme Simulator{simulatedState === 'live' ? ` — Live: ${liveTheme.label}` : ''}
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {simThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setSimulatedState(t.id)}
                className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all border cursor-pointer
                  ${simulatedState === t.id
                    ? 'bg-[#a0c49d] text-slate-900 border-[#a0c49d]'
                    : activeIsNight
                      ? 'bg-slate-900/50 border-slate-700 text-slate-400 hover:bg-slate-800'
                      : 'bg-white/60 border-white text-slate-600 hover:bg-white/90'
                  }
                `}
              >
                {t.label}
              </button>
            ))}
          </div>
        </footer>
      </main>
    </div>
  );
}

// ── SKELETON ──────────────────────────────────────────────────────────────────
function SkeletonLoader({ isNight }: { isNight: boolean }) {
  const bar = `animate-pulse rounded-xl ${isNight ? 'bg-slate-800' : 'bg-slate-200/80'}`;
  return (
    <div className="flex flex-col gap-6 w-full pt-6">
      {/* Hero */}
      <div className="flex gap-5">
        <div className="flex flex-col gap-3 min-w-[160px]">
          <div className={`h-16 w-16 rounded-2xl ${bar}`} />
          <div className={`h-4 w-28 ${bar}`} />
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => <div key={i} className={`h-10 ${bar}`} />)}
          </div>
        </div>
        <div className={`flex-1 h-40 ${bar}`} />
      </div>
      {/* Rec */}
      <div className={`h-32 ${bar} w-full`} />
      {/* Tasks */}
      <div className="grid grid-cols-2 gap-3">
        <div className={`h-16 ${bar}`} />
        <div className={`h-16 ${bar}`} />
      </div>
      {/* Forecast */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {[...Array(7)].map((_, i) => <div key={i} className={`h-20 ${bar}`} />)}
      </div>
    </div>
  );
}
