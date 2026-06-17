import type { GardenTask } from '../types';
import {
  AcUnitIcon,
  GrassIcon,
  WaterDropIcon,
  AirIcon,
  NatureIcon,
  FilterVintageIcon,
  EnergySavingsLeafIcon,
  UmbrellaIcon,
  WarningAmberIcon,
  ThermostatIcon,
  TaskAltIcon,
} from '../icons';
import type { SvgIconProps } from '@mui/material';

// Map emoji/string keys to MUI icon components
// The recommend.ts still passes emoji but we map them to real icons here
type IconMap = Record<string, React.ComponentType<SvgIconProps>>;
const ICON_MAP: IconMap = {
  '❄️': AcUnitIcon,
  '🪴': FilterVintageIcon,
  '💨': AirIcon,
  '🧹': GrassIcon,
  '☂️': UmbrellaIcon,
  '🚫': TaskAltIcon,
  '📐': GrassIcon,
  '🔍': EnergySavingsLeafIcon,
  '✂️': NatureIcon,
  '🚿': WaterDropIcon,
  '🪵': NatureIcon,
  '🌧️': UmbrellaIcon,
  '🧴': FilterVintageIcon,
  '🌬️': AirIcon,
  '🩺': EnergySavingsLeafIcon,
  '🌱': GrassIcon,
  '🥄': NatureIcon,
  '🧺': TaskAltIcon,
  '🧑‍🌾': GrassIcon,
  '🏡': FilterVintageIcon,
  '🌿': EnergySavingsLeafIcon,
  '💧': WaterDropIcon,
  '🌡️': ThermostatIcon,
  '⚠️': WarningAmberIcon,
};

function TaskIcon({ icon }: { icon: string }) {
  const Comp = ICON_MAP[icon] ?? TaskAltIcon;
  return <Comp sx={{ fontSize: 20 }} />;
}

interface Props {
  tasks: GardenTask[];
  isNight?: boolean;
}

export function TaskGrid({ tasks, isNight = false }: Props) {
  if (tasks.length === 0) {
    return (
      <div className={`text-center py-6 text-sm ${isNight ? 'text-slate-400' : 'text-slate-400'}`}>
        No immediate tasks for today. Relax and enjoy your garden!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {tasks.map((task, i) => (
        <div
          key={i}
          className={`group flex items-start gap-3.5 p-4 rounded-xl border transition-all duration-300 hover:-translate-y-0.5
            ${isNight
              ? 'bg-slate-900/50 border-slate-700/50 hover:border-[#a0c49d]/40'
              : 'bg-white/50 border-white/50 hover:border-[#a0c49d]/60 hover:shadow-sm'
            }
          `}
        >
          {/* Icon badge */}
          <div
            className={`flex items-center justify-center w-9 h-9 rounded-xl shrink-0 transition-transform group-hover:scale-110
              ${isNight ? 'bg-slate-800/80 text-[#a0c49d]' : 'bg-[#a0c49d]/15 text-[#4a8a6a]'}
            `}
          >
            <TaskIcon icon={task.icon} />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-sm leading-snug transition-colors group-hover:text-[#5c9ead]
              ${isNight ? 'text-slate-200' : 'text-slate-800'}
            `}>
              {task.title}
            </h4>
            <p className={`text-xs mt-0.5 leading-relaxed
              ${isNight ? 'text-slate-400' : 'text-slate-500'}
            `}>
              {task.context}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
