import { isPixelNumberString } from '../../src/utils/is'

// -----------------------------------------------------------------------------
// Tests
// -----------------------------------------------------------------------------

describe(`is`, () => {
  test(`isPixelNumberString`, () => {
    expect(isPixelNumberString(`100px`)).toBeTrue()
    expect(isPixelNumberString(`0.5px`)).toBeTrue()
    expect(isPixelNumberString(``)).toBeFalse()
    expect(isPixelNumberString(`abc`)).toBeFalse()
    expect(isPixelNumberString(`100`)).toBeFalse()
    expect(isPixelNumberString(`0.5`)).toBeFalse()
    expect(isPixelNumberString(`0.5mm`)).toBeFalse()
  })
})
