export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function dateKeyFromOffset(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
}
