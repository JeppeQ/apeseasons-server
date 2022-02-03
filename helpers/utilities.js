getSignificantDecimals = (number) => {
  const _str = String(number)
  const first = _str.split("").findIndex(x => x !== '0' && x !== '.')

  return Math.min(5, first + 2)
}

roundNumber = (x) => {
  if (!x) {
    return 0
  }

  const power = 10 ** getSignificantDecimals(x)
  
  return Math.ceil(x * power) / power
}

module.exports = {
  roundNumber
}