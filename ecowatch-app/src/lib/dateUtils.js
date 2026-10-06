// src/lib/dateUtils.js
// -------------------------------------------------------------------
// safeTimestamp – always returns a valid Date instance.
// If the input is falsy or not a real date, it falls back to `new Date()`.
// -------------------------------------------------------------------
export const safeTimestamp = (ts) => {
  const d = ts ? new Date(ts) : new Date();
  return isNaN(d.getTime()) ? new Date() : d;
};
