// « 2 minutes », « 1 minute 30 », « 45 secondes ».
export const formatDuree = (secondes) => {
  const s = Math.max(0, Math.round(Number(secondes) || 0))
  const m = Math.floor(s / 60)
  const r = s % 60
  if (!m) return `${r} seconde${r > 1 ? 's' : ''}`
  return `${m} minute${m > 1 ? 's' : ''}${r ? ` ${String(r).padStart(2, '0')}` : ''}`
}
