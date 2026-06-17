import { getWeatherIcon, getWeatherLabel, WaterDropIcon } from '../icons';
import type { DailyWeather } from '../types';
import { displayTempShort } from '../utils/temp';

interface DayData {
  date: string;
  tempMax: number;
  tempMin: number;
  precipSum: number;
  precipProbability: number;
  windMax: number;
  code: number;
  uvMax: number;
}

interface Props {
  day: DayData;
  isToday?: boolean;
  selected?: boolean;
  isNight?: boolean;
  useFahrenheit?: boolean;
  onClick?: () => void;
}

export function WeatherCard({ day, isToday, selected, isNight = false, useFahrenheit = false, onClick }: Props) {
  const label = new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' });
  const WeatherIcon = getWeatherIcon(day.code);

  const selectedStyle = 'bg-[#a0c49d] border-[#a0c49d] text-slate-900 shadow-md shadow-[#a0c49d]/20';
  const nightStyle = 'bg-slate-900/30 border-slate-700/50 hover:bg-slate-800/40 text-slate-200';
  const dayStyle = 'bg-white/30 border-white/50 hover:bg-white/50 text-slate-800';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border transition-all duration-300 text-center w-full cursor-pointer hover:-translate-y-0.5
        ${selected ? selectedStyle : isNight ? nightStyle : dayStyle}
      `}
    >
      <span className={`text-[10px] font-bold uppercase tracking-wider ${selected ? 'text-slate-700' : 'opacity-50'}`}>
        {isToday ? 'Today' : label}
      </span>

      <WeatherIcon sx={{
        fontSize: 22,
        color: selected ? '#2d5a3d' : isNight ? '#a0c49d' : '#5c9ead',
      }} />

      <span className="text-xs font-bold leading-none">
        {displayTempShort(day.tempMax, useFahrenheit)}
        <span className="opacity-40 font-normal">/{displayTempShort(day.tempMin, useFahrenheit)}</span>
      </span>

      <span className={`text-[9px] leading-tight line-clamp-1 ${selected ? 'text-slate-700' : 'opacity-50'}`}>
        {getWeatherLabel(day.code)}
      </span>

      {day.precipProbability > 20 && (
        <span className={`text-[9px] font-semibold flex items-center gap-0.5
          ${selected ? 'text-slate-700' : isNight ? 'text-blue-300' : 'text-blue-500'}
        `}>
          <WaterDropIcon sx={{ fontSize: 10 }} />
          {Math.round(day.precipProbability)}%
        </span>
      )}
    </button>
  );
}

export function buildDayData(daily: DailyWeather, index: number): DayData {
  return {
    date: daily.time[index],
    tempMax: daily.temperature_2m_max[index],
    tempMin: daily.temperature_2m_min[index],
    precipSum: daily.precipitation_sum[index],
    precipProbability: daily.precipitation_probability_max[index],
    windMax: daily.windspeed_10m_max[index],
    code: daily.weathercode[index],
    uvMax: daily.uv_index_max[index] ?? 0,
  };
}
