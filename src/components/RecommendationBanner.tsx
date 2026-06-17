import { TaskAltIcon, WarningAmberIcon, InfoOutlinedIcon } from '../icons';
import type { Recommendation } from '../types';

interface Props {
  recommendation: Recommendation;
  isNight?: boolean;
}

const levelConfig = {
  all_good: {
    Icon: TaskAltIcon,
    iconColor: '#a0c49d',
    badgeDay: 'bg-emerald-100/80 text-emerald-800',
    badgeNight: 'bg-emerald-500/20 text-emerald-300',
    border: 'border-[#a0c49d]/30',
    bg: 'bg-[#a0c49d]/8',
    label: 'All Good',
  },
  attention_needed: {
    Icon: InfoOutlinedIcon,
    iconColor: '#fb923c',
    badgeDay: 'bg-orange-100/80 text-orange-700',
    badgeNight: 'bg-orange-500/25 text-orange-300',
    border: 'border-orange-400/30',
    bg: 'bg-orange-500/8',
    label: 'Attention Needed',
  },
  action_required: {
    Icon: WarningAmberIcon,
    iconColor: '#f87171',
    badgeDay: 'bg-rose-100/80 text-rose-700',
    badgeNight: 'bg-rose-500/25 text-rose-300',
    border: 'border-rose-400/30',
    bg: 'bg-rose-500/8',
    label: 'Action Required',
  },
};

export function RecommendationBanner({ recommendation, isNight = false }: Props) {
  const cfg = levelConfig[recommendation.level] ?? levelConfig.all_good;
  const { Icon } = cfg;

  const toneText = isNight ? 'text-slate-100' : 'text-slate-900';
  const toneBody = isNight ? 'text-slate-300' : 'text-slate-600';
  const toneDivider = isNight ? 'border-slate-700/60' : 'border-slate-200/70';
  const toneTip = isNight ? 'text-slate-300' : 'text-slate-600';

  return (
    <div className={`rounded-2xl border p-5 transition-all duration-500 backdrop-blur-sm ${cfg.bg} ${cfg.border}`}>
      {/* Badge row */}
      <div className="flex items-center gap-2.5 mb-3">
        <Icon sx={{ fontSize: 20, color: cfg.iconColor }} />
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${isNight ? cfg.badgeNight : cfg.badgeDay}`}>
          {cfg.label}
        </span>
        <span className={`text-[10px] uppercase tracking-wider ml-auto font-medium opacity-40 ${toneBody}`}>
          Garden Advice
        </span>
      </div>

      {/* Headline */}
      <h3 className={`text-lg font-bold leading-snug mb-1.5 ${toneText}`}>
        {recommendation.headline}
      </h3>

      {/* Reason */}
      <p className={`text-sm leading-relaxed ${toneBody}`}>
        {recommendation.reason}
      </p>

      {/* Tips */}
      {recommendation.tips && recommendation.tips.length > 0 && (
        <div className={`mt-4 pt-3 border-t ${toneDivider}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-2">
            Care Instructions
          </p>
          <ul className="space-y-1.5">
            {recommendation.tips.map((tip, i) => (
              <li key={i} className="text-xs flex items-start gap-2 leading-relaxed">
                <span className="text-[10px] mt-0.5 shrink-0 font-bold" style={{ color: cfg.iconColor }}>-</span>
                <span className={toneTip}>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
