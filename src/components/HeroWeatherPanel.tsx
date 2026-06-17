import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  getWeatherIcon,
  getWeatherLabel,
  WaterDropIcon,
  AirIcon,
  ThermostatIcon,
  WaterIcon,
  LightModeIcon,
} from '../icons';
import type { HourlyWeather } from '../types';
import { displayTempShort, toF } from '../utils/temp';

interface Props {
  code: number;
  tempMax: number;
  tempMin: number;
  currentTemp: number;
  precipProbability: number;
  windMax: number;
  humidity: number;
  uvMax: number;
  hourly: HourlyWeather;
  dayIndex: number;
  isNight: boolean;
  useFahrenheit: boolean;
}

interface ChartDatum {
  time: string;
  temp: number;
  rain: number;
  code: number;
}

// Custom minimal recharts tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
  isNight,
  useFahrenheit,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string }>;
  label?: string;
  isNight: boolean;
  useFahrenheit: boolean;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const temp = payload.find((p) => p.dataKey === 'temp');
  const rain = payload.find((p) => p.dataKey === 'rain');
  const displayVal = temp ? (useFahrenheit ? Math.round(toF(temp.value)) : Math.round(temp.value)) : null;
  const unit = useFahrenheit ? '°F' : '°C';
  return (
    <div
      className={`rounded-xl px-3 py-2 text-xs shadow-xl border
        ${isNight ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}
      `}
    >
      <div className="font-semibold mb-1">{label}</div>
      {displayVal !== null && <div className="flex items-center gap-1"><ThermostatIcon sx={{ fontSize: 12 }} /> {displayVal}{unit}</div>}
      {rain && <div className="flex items-center gap-1"><WaterDropIcon sx={{ fontSize: 12 }} /> {Math.round(rain.value)}% rain</div>}
    </div>
  );
};

export function HeroWeatherPanel({
  code,
  tempMax,
  tempMin,
  currentTemp,
  precipProbability,
  windMax,
  humidity,
  uvMax,
  hourly,
  dayIndex,
  isNight,
  useFahrenheit,
}: Props) {
  const WeatherIcon = getWeatherIcon(code);
  const weatherLabel = getWeatherLabel(code);

  // Build 12-slot chart data for the selected day (every 2 hours, 0–22)
  const chartData: ChartDatum[] = [];
  const startIndex = dayIndex * 24;
  for (let h = 0; h < 24; h += 2) {
    const idx = startIndex + h;
    if (idx >= hourly.time.length) break;
    const timeStr = hourly.time[idx];
    const date = new Date(timeStr);
    const hour = date.getHours();
    const label = `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? 'pm' : 'am'}`;
    const rawC = hourly.temperature_2m[idx];
    chartData.push({
      time: label,
      temp: useFahrenheit ? Math.round(toF(rawC)) : Math.round(rawC),
      rain: hourly.precipitation_probability[idx] ?? 0,
      code: hourly.weathercode[idx] ?? 0,
    });
  }

  const toneText = isNight ? 'text-slate-200' : 'text-slate-800';
  const toneMuted = isNight ? 'text-slate-400' : 'text-slate-500';
  const chipClass = isNight
    ? 'bg-slate-800/70 border border-slate-700/60 text-slate-300'
    : 'bg-white/60 border border-white/70 text-slate-700 shadow-sm';

  const chartStroke = isNight ? '#a0c49d' : '#5c9ead';
  const gridColor = isNight ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const axisColor = isNight ? '#64748b' : '#94a3b8';

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
      {/* LEFT — Big weather hero */}
      <div className="flex flex-col justify-between sm:min-w-[180px]">
        {/* Icon + condition */}
        <div className="flex items-center gap-3 mb-3">
          <WeatherIcon
            sx={{
              fontSize: 52,
              color: isNight ? '#a0c49d' : '#5c9ead',
              filter: isNight
                ? 'drop-shadow(0 0 10px rgba(160,196,157,0.4))'
                : 'drop-shadow(0 2px 6px rgba(92,158,173,0.3))',
            }}
          />
          <div>
            <div className={`text-4xl font-black leading-none tracking-tight ${toneText}`}>
              {displayTempShort(currentTemp, useFahrenheit)}
            </div>
            <div className={`text-xs font-medium mt-1 ${toneMuted}`}>{weatherLabel}</div>
          </div>
        </div>

        {/* Hi / Lo */}
        <div className={`text-xs font-medium ${toneMuted} mb-4`}>
          H: {displayTempShort(tempMax, useFahrenheit)} · L: {displayTempShort(tempMin, useFahrenheit)}
        </div>

        {/* Stat pills */}
        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2">
          <StatPill icon={<WaterDropIcon sx={{ fontSize: 14 }} />} label="Rain" value={`${Math.round(precipProbability)}%`} chipClass={chipClass} />
          <StatPill icon={<AirIcon sx={{ fontSize: 14 }} />} label="Wind" value={`${Math.round(windMax)} km/h`} chipClass={chipClass} />
          <StatPill icon={<WaterIcon sx={{ fontSize: 14 }} />} label="Humid" value={`${Math.round(humidity)}%`} chipClass={chipClass} />
          <StatPill icon={<LightModeIcon sx={{ fontSize: 14 }} />} label="UV" value={`${Math.round(uvMax)}`} chipClass={chipClass} />
        </div>
      </div>

      {/* RIGHT — Hourly temperature chart + icon strip */}
      <div className="flex-1 min-w-0 flex flex-col gap-2">
        <div className={`text-[10px] font-bold uppercase tracking-wider ${toneMuted}`}>
          24-Hour Temperature
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={120}>
          <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartStroke} stopOpacity={0.35} />
                <stop offset="95%" stopColor={chartStroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: axisColor }}
              tickLine={false}
              axisLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 9, fill: axisColor }}
              tickLine={false}
              axisLine={false}
              domain={['auto', 'auto']}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip isNight={isNight} useFahrenheit={useFahrenheit} />} />
            <Area
              type="monotone"
              dataKey="temp"
              stroke={chartStroke}
              strokeWidth={2}
              fill="url(#tempGrad)"
              dot={false}
              activeDot={{ r: 4, fill: chartStroke, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Hourly icon strip — scrollable row of small cards */}
        <div className="overflow-x-auto custom-scrollbar pb-1">
          <div className="flex gap-1.5 min-w-max">
            {chartData.map((slot, i) => {
              const SlotIcon = getWeatherIcon(slot.code);
              const isRainy = slot.rain > 50;
              return (
                <div
                  key={i}
                  className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg border min-w-[44px] transition-colors
                    ${isNight
                      ? 'bg-slate-800/50 border-slate-700/40 text-slate-300'
                      : 'bg-white/50 border-white/60 text-slate-700'}
                  `}
                >
                  <span className={`text-[9px] font-bold opacity-60`}>{slot.time}</span>
                  <SlotIcon sx={{
                    fontSize: 16,
                    color: isNight ? '#a0c49d' : '#5c9ead',
                  }} />
                  <span className="text-[9px] font-semibold leading-none">{slot.temp}°</span>
                  {isRainy && (
                    <span className={`text-[8px] font-bold ${isNight ? 'text-blue-400' : 'text-blue-500'}`}>
                      {slot.rain}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  label,
  value,
  chipClass,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  chipClass: string;
}) {
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs ${chipClass}`}>
      <span className="shrink-0 opacity-70">{icon}</span>
      <div className="min-w-0">
        <div className="font-semibold truncate">{value}</div>
        <div className="text-[9px] uppercase tracking-wide opacity-50 leading-none">{label}</div>
      </div>
    </div>
  );
}
