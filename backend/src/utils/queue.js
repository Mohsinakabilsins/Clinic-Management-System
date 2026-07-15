export function canTransition(from, to) {
  const map = {
    waiting: ["called", "skipped", "cancelled", "no_show"],
    called: ["in_consultation", "skipped", "cancelled", "no_show"],
    in_consultation: ["completed", "cancelled"],
    completed: [],
    skipped: [],
    cancelled: [],
    no_show: []
  };
  return map[from]?.includes(to);
}

export function estimateMinutes(patientsBefore, averageDuration = 15, delay = 0) {
  return Math.max(0, patientsBefore * averageDuration + delay);
}
