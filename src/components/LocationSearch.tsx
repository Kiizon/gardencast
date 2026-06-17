import { useState } from 'react';
import { useLocationSearch } from '../hooks/useLocationSearch';
import { SearchIcon, LocationOnIcon } from '../icons';
import type { Location } from '../types';

interface Props {
  onSelect: (loc: Location) => void;
  selected: Location | null;
  isNight?: boolean;
}

export function LocationSearch({ onSelect, selected, isNight = false }: Props) {
  const [query, setQuery] = useState(
    selected ? `${selected.name}, ${selected.admin1 ?? selected.country}` : ''
  );
  const [open, setOpen] = useState(false);
  const { results, loading, search } = useLocationSearch();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setQuery(e.target.value);
    search(e.target.value);
    setOpen(true);
  }

  function handleSelect(loc: Location) {
    onSelect(loc);
    setQuery(`${loc.name}, ${loc.admin1 ?? loc.country}`);
    setOpen(false);
  }

  return (
    <div className="relative w-full">
      <div
        className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-all duration-300 focus-within:ring-2 focus-within:ring-[#a0c49d]/40
          ${isNight
            ? 'bg-slate-900/60 border-slate-700/80 text-white'
            : 'bg-white/60 border-white/80 text-slate-800'
          }
        `}
      >
        <SearchIcon sx={{ fontSize: 16, opacity: 0.5 }} />
        <input
          type="text"
          placeholder="Search city..."
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          className={`flex-1 outline-none bg-transparent text-sm font-medium
            ${isNight ? 'placeholder-slate-600 text-slate-100' : 'placeholder-slate-400 text-slate-800'}
          `}
        />
        {loading && (
          <span className="text-xs opacity-40 animate-pulse">
            ...
          </span>
        )}
      </div>

      {open && results.length > 0 && (
        <ul
          className={`absolute z-20 w-full mt-1.5 rounded-xl shadow-2xl border overflow-hidden max-h-56 overflow-y-auto
            ${isNight ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100'}
          `}
        >
          {results.map((loc, i) => (
            <li key={i}>
              <button
                onClick={() => handleSelect(loc)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2.5
                  ${isNight
                    ? 'hover:bg-slate-800/80 border-b border-slate-800/50 last:border-b-0 text-slate-200'
                    : 'hover:bg-[#a0c49d]/10 border-b border-slate-100 last:border-b-0 text-slate-800'
                  }
                `}
              >
                <LocationOnIcon sx={{ fontSize: 14, opacity: 0.4, flexShrink: 0 }} />
                <span className="font-semibold">{loc.name}</span>
                <span className="text-[10px] opacity-50 truncate">
                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
