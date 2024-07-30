// -----------------------------------------------------------------------------
// Exports
// -----------------------------------------------------------------------------

export const mapObj = (f, o) => {
  return Object.keys(o).reduce((acc, key, idx) => {
    const value = o[key]
    return {
      ...acc,
      [key]: f(value, idx),
    }
  }, {})
}
