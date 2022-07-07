export function timeToDate(time: number) {
  const out = new Date()
  out.setTime(time)
  return out
}

export function randomCharacter(chars: string, random?: number) {
  return chars.charAt(Math.floor((random ?? Math.random()) * chars.length))
}
