export function toF(c: number): number {
  return c * 9 / 5 + 32;
}

export function displayTemp(c: number, useFahrenheit: boolean): string {
  return useFahrenheit ? `${Math.round(toF(c))}°F` : `${Math.round(c)}°C`;
}

export function displayTempShort(c: number, useFahrenheit: boolean): string {
  return useFahrenheit ? `${Math.round(toF(c))}°` : `${Math.round(c)}°`;
}
