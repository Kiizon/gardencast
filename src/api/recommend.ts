import type { Recommendation, RecommendationLevel, GardenTask } from '../types';

export interface DaySnapshot {
  date: string;
  tempMax: number;
  tempMin: number;
  precipSum: number;
  precipProbability: number;
  windMax: number;
  code: number;
  uvMax: number;
}

export function recommendDay(day: DaySnapshot): Recommendation {
  const { tempMax, tempMin, precipProbability, precipSum, windMax, code, uvMax } = day;

  // Weather condition flags
  const isFrost = tempMin <= 2;
  const isExtremeHeat = tempMax >= 30;
  const isStorm = code >= 95 || windMax > 40;
  const isTorrentialRain = precipSum >= 20 || (precipProbability >= 90 && precipSum > 12);
  const isModerateRain = precipProbability > 50 || precipSum > 2;
  const isWindy = windMax > 25;
  const isFungalRisk = tempMax >= 22 && (code >= 3 || precipProbability > 40);
  const isDryStretch = tempMax > 20 && precipProbability < 25 && precipSum === 0;
  const isTransplantWindow = code === 3 && tempMax >= 12 && tempMax <= 22;
  const isHarvestWindow = code <= 1 && tempMax >= 15 && tempMax <= 28;

  let level: RecommendationLevel;
  let headline: string;
  let reason: string;
  const tips: string[] = [];
  const tasks: GardenTask[] = [];

  // 1. ACTION REQUIRED (Critical events)
  if (isFrost) {
    level = 'action_required';
    headline = 'Frost Warning! Protect Plants';
    reason = `Overnight low of ${Math.round(tempMin)}°C will cause frost. Tender and tropical plants are at high risk.`;
    tips.push(
      'Cover vulnerable plants before sunset',
      'Move small container plants inside',
      'Water the soil lightly in the afternoon (wet soil retains heat better than dry)'
    );
    tasks.push(
      {
        icon: '❄️',
        title: 'Cover tender plants',
        context: `Frost tonight — cover before temps drop close to ${Math.round(tempMin)}°C`
      },
      {
        icon: '🪴',
        title: 'Move pots indoors',
        context: 'Bring container vegetables, herbs, and flowers into the garage or house'
      }
    );
  } else if (isStorm) {
    level = 'action_required';
    headline = 'Severe Weather Alert';
    reason = `High winds up to ${Math.round(windMax)} km/h or thunderstorms will threaten plant structures.`;
    tips.push(
      'Move potted plants to a sheltered spot',
      'Check that support stakes are secure',
      'Clear gutters and runoff paths'
    );
    tasks.push(
      {
        icon: '💨',
        title: 'Stake tall plants',
        context: 'Tie up tomatoes, sunflowers, and climbing vines to prevent snap'
      },
      {
        icon: '🧹',
        title: 'Secure garden items',
        context: 'Put away lightweight plastic pots, tools, and garden decor'
      }
    );
  } else if (isExtremeHeat) {
    level = 'action_required';
    headline = 'Extreme Heat Warning';
    reason = `Temperatures reaching ${Math.round(tempMax)}°C with a high UV index of ${Math.round(uvMax)}. Sunburn and drought stress are high risks.`;
    tips.push(
      'Water deeply early in the morning to reach roots before heat rises',
      'Avoid fertilizing or pruning during heatwaves',
      'Apply temporary shade cloth over sensitive greens'
    );
    tasks.push(
      {
        icon: '💧',
        title: 'Deep morning watering',
        context: `High of ${Math.round(tempMax)}°C — water roots thoroughly before 9am`
      },
      {
        icon: '☂️',
        title: 'Shade sensitive crops',
        context: 'Cover lettuce, spinach, and young seedlings with shade netting'
      }
    );
  } else if (isTorrentialRain) {
    level = 'action_required';
    headline = 'Heavy Rain Alert';
    reason = `Over ${Math.round(precipSum)}mm of rain is expected. Flooding and root suffocation are potential issues.`;
    tips.push(
      'Ensure drainage pathways are clear of debris',
      'Pause all manual irrigation',
      'Watch for soil erosion around new plantings'
    );
    tasks.push(
      {
        icon: '🚫',
        title: 'Turn off irrigation',
        context: 'Let nature water your plants; save water and avoid root rot'
      },
      {
        icon: '📐',
        title: 'Clear drain pathways',
        context: 'Clear leaves and dirt from gutters, downspouts, and path grates'
      }
    );
  }
  // 2. ATTENTION NEEDED (Moderate actions/risks)
  else if (isFungalRisk) {
    level = 'attention_needed';
    headline = 'Warm & Humid: Fungal Risk';
    reason = `High humidity and warm temps (${Math.round(tempMax)}°C) favor mildew and spot diseases.`;
    tips.push(
      'Water plants at the soil level, not the foliage',
      'Prune lower leaves to improve air circulation',
      'Spray organic copper fungicide if you see early spots'
    );
    tasks.push(
      {
        icon: '🔍',
        title: 'Inspect leaves',
        context: 'Check squash, tomatoes, and roses for fuzzy white spots or black dots'
      },
      {
        icon: '✂️',
        title: 'Improve airflow',
        context: 'Prune dense suckers and crowded stems to allow wind to dry leaves'
      }
    );
  } else if (isDryStretch) {
    level = 'attention_needed';
    headline = 'Extended Dry Stretch';
    reason = `Warm temperatures around ${Math.round(tempMax)}°C with no rain in the forecast. Soil is drying quickly.`;
    tips.push(
      'Mulch garden beds to conserve moisture',
      'Check containers daily; they dry out faster than ground soil',
      'Use a drip line or soaker hose for efficient watering'
    );
    tasks.push(
      {
        icon: '🚿',
        title: 'Deep soak garden beds',
        context: `Dry and warm (${Math.round(tempMax)}°C) — ensure roots get at least 2cm of water`
      },
      {
        icon: '🪵',
        title: 'Apply mulch layer',
        context: 'Add 5cm of straw or wood chips to lock in soil moisture'
      }
    );
  } else if (isModerateRain) {
    level = 'attention_needed';
    headline = 'Rainy Conditions Expected';
    reason = `Rain probability is ${Math.round(precipProbability)}% with total rain around ${Math.round(precipSum)}mm.`;
    tips.push(
      'Skip scheduled watering today',
      'Perfect time to weed since wet soil releases roots easily',
      'Apply solid organic fertilizer before the rain to soak it in'
    );
    tasks.push(
      {
        icon: '🌧️',
        title: 'Easy weeding session',
        context: 'Rain softens soil — pull deep taproots like dandelions easily'
      },
      {
        icon: '🧴',
        title: 'Apply granular feed',
        context: 'Spread slow-release fertilizer before rain carries it to roots'
      }
    );
  } else if (isWindy) {
    level = 'attention_needed';
    headline = 'Windy Conditions';
    reason = `Wind speeds up to ${Math.round(windMax)} km/h. Soil dries faster, and fragile plants might lean.`;
    tips.push(
      'Check if delicate container plants need support',
      'Water slightly more as wind increases transpiration rates',
      'Secure protective mesh and row covers'
    );
    tasks.push(
      {
        icon: '🌬️',
        title: 'Check row covers',
        context: 'Make sure insect netting and fleece are weighed down securely'
      },
      {
        icon: '🩺',
        title: 'Tether leaning stems',
        context: 'Check peas, beans, and young dahlias; tie to support stakes'
      }
    );
  }
  // 3. ALL GOOD (Perfect gardening windows)
  else if (isTransplantWindow) {
    level = 'all_good';
    headline = 'Ideal Transplanting Day!';
    reason = `Overcast conditions and mild temperatures (${Math.round(tempMax)}°C) minimize transplant shock.`;
    tips.push(
      'Water seedlings thoroughly before and after moving them',
      'Plant late in the day to give them a night of cool rest',
      'Add compost to the planting holes for a nutrient boost'
    );
    tasks.push(
      {
        icon: '🌱',
        title: 'Transplant seedlings',
        context: 'Overcast skies prevent tender roots and leaves from sunburn/wilting'
      },
      {
        icon: '🥄',
        title: 'Feed newly planted crops',
        context: 'Add root-booster fertilizer or liquid seaweed to new transplants'
      }
    );
  } else if (isHarvestWindow) {
    level = 'all_good';
    headline = 'Perfect Gardening Day';
    reason = `Beautiful dry conditions, high of ${Math.round(tempMax)}°C, and moderate UV. Excellent for all tasks.`;
    tips.push(
      'Harvest tomatoes, herbs, and beans in the dry morning',
      'Turn and water the compost pile',
      'Prune off yellowing foliage'
    );
    tasks.push(
      {
        icon: '🧺',
        title: 'Harvest ripe crops',
        context: 'Harvesting in dry weather prevents mold and extends crop shelf-life'
      },
      {
        icon: '🧑‍🌾',
        title: 'Weed and tidy beds',
        context: 'Clear out weeds and dead foliage to keep garden beds clean'
      }
    );
  } else {
    // Default fallback (Decent conditions)
    level = 'all_good';
    headline = 'Stable Garden Weather';
    reason = `Acceptable temperatures (${Math.round(tempMin)}°C - ${Math.round(tempMax)}°C) and no immediate hazards.`;
    tips.push(
      'Keep up with your regular watering schedule',
      'Take a walk and check for pests or leaf health',
      'Keep an eye on the hourly forecast for the best garden window'
    );
    tasks.push(
      {
        icon: '🏡',
        title: 'Routine garden check',
        context: 'Walk around, inspect soil moisture, and check under leaves for bugs'
      },
      {
        icon: '🌿',
        title: 'Light weeding',
        context: 'Pull any tiny weeds before they establish deep root systems'
      }
    );
  }

  return { level, headline, reason, tips, tasks };
}
