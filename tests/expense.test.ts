import { describe, it, expect } from 'vitest'
import { equalSplit } from '../lib/expense'

describe('equalSplit', () => {
  it('splits evenly with no rounding issues', () => {
    const res = equalSplit(90, ['A', 'B', 'C'])
    expect(res.map(r => r.share)).toEqual(['30.00', '30.00', '30.00'])
  })

  it('distributes cents fairly', () => {
    const res = equalSplit(100, ['A','B','C'])
    // 100/3 = 33.33 each with one cent remainder; two will get +0.01
    expect(res.length).toBe(3)
    const sums = res.reduce((acc, r) => acc + Number(r.share), 0)
    expect(Number(sums.toFixed(2))).toBe(100)
  })
})
