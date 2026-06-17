import type { SvgIconProps } from '@mui/material';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import WbCloudyIcon from '@mui/icons-material/WbCloudy';
import CloudIcon from '@mui/icons-material/Cloud';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import GrainIcon from '@mui/icons-material/Grain';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';
import DehazeIcon from '@mui/icons-material/Dehaze';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import UmbrellaIcon from '@mui/icons-material/Umbrella';
import SevereColdIcon from '@mui/icons-material/SevereCold';
import GrassIcon from '@mui/icons-material/Grass';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NatureIcon from '@mui/icons-material/Nature';
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';
import WaterIcon from '@mui/icons-material/Water';
import LightModeIcon from '@mui/icons-material/LightMode';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import ShowerIcon from '@mui/icons-material/Shower';
import Brightness3Icon from '@mui/icons-material/Brightness3';
import WbTwilightIcon from '@mui/icons-material/WbTwilight';
import OpacityIcon from '@mui/icons-material/Opacity';
import FlareIcon from '@mui/icons-material/Flare';
import ParkIcon from '@mui/icons-material/Park';

// Re-export everything for use across components
export {
  WbSunnyIcon,
  WbCloudyIcon,
  CloudIcon,
  ThunderstormIcon,
  GrainIcon,
  AcUnitIcon,
  FilterDramaIcon,
  DehazeIcon,
  WaterDropIcon,
  AirIcon,
  ThermostatIcon,
  UmbrellaIcon,
  SevereColdIcon,
  GrassIcon,
  WarningAmberIcon,
  InfoOutlinedIcon,
  TaskAltIcon,
  SearchIcon,
  LocationOnIcon,
  NatureIcon,
  FilterVintageIcon,
  EnergySavingsLeafIcon,
  WaterIcon,
  LightModeIcon,
  NightsStayIcon,
  ShowerIcon,
  Brightness3Icon,
  WbTwilightIcon,
  OpacityIcon,
  FlareIcon,
  ParkIcon,
};

type IconComponent = React.ComponentType<SvgIconProps>;

// ─── WMO Code → MUI Icon ─────────────────────────────────────────────────────
// https://open-meteo.com/en/docs#weathervariables
export function getWeatherIcon(code: number): IconComponent {
  if (code === 0) return WbSunnyIcon;        // Clear sky
  if (code <= 2)  return WbCloudyIcon;       // Mainly clear / Partly cloudy
  if (code === 3) return CloudIcon;          // Overcast
  if (code <= 49) return DehazeIcon;         // Fog / Rime fog
  if (code <= 59) return GrainIcon;          // Drizzle (light)
  if (code <= 69) return UmbrellaIcon;       // Rain
  if (code <= 79) return AcUnitIcon;         // Snow
  if (code <= 82) return ShowerIcon;         // Rain showers
  if (code <= 86) return SevereColdIcon;     // Snow showers
  if (code <= 99) return ThunderstormIcon;   // Thunderstorm
  return WbSunnyIcon;
}

// WMO Code → human label
export function getWeatherLabel(code: number): string {
  if (code === 0) return 'Clear Sky';
  if (code <= 2)  return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code <= 49) return 'Foggy';
  if (code <= 59) return 'Drizzle';
  if (code <= 69) return 'Rain';
  if (code <= 79) return 'Snow';
  if (code <= 82) return 'Rain Showers';
  if (code <= 86) return 'Snow Showers';
  if (code <= 99) return 'Thunderstorm';
  return 'Unknown';
}

// ─── Weather + Time → Backdrop Theme ─────────────────────────────────────────

export type BackdropCondition =
  | 'clear'         // WMO 0
  | 'partly-cloudy' // WMO 1–2
  | 'overcast'      // WMO 3
  | 'foggy'         // WMO 45, 48
  | 'drizzle'       // WMO 51–57
  | 'rainy'         // WMO 61–67
  | 'snowy'         // WMO 71–77
  | 'showers'       // WMO 80–82
  | 'snow-showers'  // WMO 85–86
  | 'thunderstorm'; // WMO 95–99

export interface BackdropTheme {
  condition: BackdropCondition;
  isNight: boolean;
  label: string;
}

export function resolveBackdropTheme(
  code: number,
  sunriseIso: string | undefined,
  sunsetIso: string | undefined,
  nowHour?: number
): BackdropTheme {
  const hour = nowHour ?? new Date().getHours();
  const sunriseHour = sunriseIso ? new Date(sunriseIso).getHours() : 6;
  const sunsetHour  = sunsetIso  ? new Date(sunsetIso).getHours()  : 20;
  const isNight = hour < sunriseHour || hour >= sunsetHour;

  if (code === 0)            return { condition: 'clear',        isNight, label: isNight ? 'Starry Night'         : 'Clear Sky'       };
  if (code <= 2)             return { condition: 'partly-cloudy',isNight, label: isNight ? 'Partly Cloudy Night'  : 'Partly Cloudy'   };
  if (code === 3)            return { condition: 'overcast',     isNight, label: isNight ? 'Overcast Night'       : 'Overcast'        };
  if (code <= 48)            return { condition: 'foggy',        isNight, label: isNight ? 'Foggy Night'          : 'Foggy'           };
  if (code <= 57)            return { condition: 'drizzle',      isNight, label: isNight ? 'Drizzle Night'        : 'Drizzle'         };
  if (code <= 67)            return { condition: 'rainy',        isNight, label: isNight ? 'Rainy Night'          : 'Rain'            };
  if (code <= 77)            return { condition: 'snowy',        isNight, label: isNight ? 'Snowy Night'          : 'Snowy Day'       };
  if (code <= 82)            return { condition: 'showers',      isNight, label: isNight ? 'Showers Night'        : 'Rain Showers'    };
  if (code <= 86)            return { condition: 'snow-showers', isNight, label: isNight ? 'Snow Showers Night'   : 'Snow Showers'    };
  return                            { condition: 'thunderstorm', isNight: true, label: code >= 96 ? 'Thunderstorm + Hail' : 'Thunderstorm' };
}
