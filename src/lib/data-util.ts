export function timeToDate(time: number) {
  const out = new Date()
  out.setTime(time)
  return out
}
