// -----------------------------------------------------------------------------
// Enums
// -----------------------------------------------------------------------------

export enum InterpolationStrategy {
  LINEAR = `linear`,
  EVEN = `even`,
}

export enum LineStrategy {
  STRAIGHT_LINES = `straightLines`,
  CURVES = `curves`,
}

export enum CellBoundsOrder {
  TTB_LTR = `topToBottom-leftToRight`,
  TTB_RTL = `topToBottom-rightToLeft`,
  BTT_LTR = `bottomToTop-leftToRight`,
  BTT_RTL = `bottomToTop-rightToLeft`,
  LTR_TTB = `leftToRight-topToBottom`,
  LTR_BTT = `leftToRight-bottomToTop`,
  RTL_TTB = `rightToLeft-topToBottom`,
  RTL_BTT = `rightToLeft-bottomToTop`,
}
