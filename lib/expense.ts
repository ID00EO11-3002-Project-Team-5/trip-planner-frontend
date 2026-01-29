import Decimal from 'decimal.js-light'

export type Share = { name: string; share: string }

export function equalSplit(total: string | number, participants: string[]): Share[] {
  const people = participants.filter(Boolean)
  if (!people.length) return []
  const t = new Decimal(total || 0)
  const n = new Decimal(people.length)
  // Round to cents
  const base = t.div(n).toDecimalPlaces(2, Decimal.ROUND_FLOOR)
  const remainder = t.minus(base.times(n))
  const cents = remainder.times(100).toNumber() // 0..(n-1)
  return people.map((name, i) => {
    const bonus = i < cents ? new Decimal(0.01) : new Decimal(0)
    return { name, share: base.plus(bonus).toFixed(2) }
  })
}
