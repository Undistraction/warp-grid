// -----------------------------------------------------------------------------
// Const
// -----------------------------------------------------------------------------

const binomialCoefficients = [[1], [1, 1]]

// -----------------------------------------------------------------------------
// Utils
// -----------------------------------------------------------------------------

const roundToN = (n: number, value: number): number => Number(value.toFixed(n))

// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const roundTo5 = (value: number) => roundToN(5, value)

export const binomial = (n: number, k: number): number => {
  if (n === 0) {
    return 1
  }

  const lut = binomialCoefficients

  while (n >= lut.length) {
    const lutLength = lut.length
    const nextRow = [1]
    for (let i = 1, prev = lutLength - 1; i < lutLength; i++) {
      nextRow[i] = lut[prev][i - 1] + lut[prev][i]
    }
    nextRow[lutLength] = 1
    lut.push(nextRow)
  }

  return lut[n][k]
}
