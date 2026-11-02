export function isDeviceOn(actionState: string): boolean {
  const s = actionState.toUpperCase();
  if (s.includes("OFF")) return false;
  return s.includes("ON") || s.startsWith("SPEED");
}