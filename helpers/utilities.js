calculatePrize = (ticketPrice, prizePool, players, playerPos, refund, individual) => {
  if (players === 1) {
    return prizePool
  }

  const refundPool = prizePool / refund
  const individualPool = prizePool - refundPool
  const playersToRefund = refundPool / ticketPrice

  if (playersToRefund == 0) {
    playersToRefund = 1
  }

  const individualWinners = Math.round(players / individual)
  if (individualWinners == 0) {
    individualWinners = 1
  }

  const refundAmount = refundPool / playersToRefund

  if (playerPos < individualWinners) {
    return individualPool / (2 ** (playerPos + 1)) + refundAmount + (individualPool / (2 ** (individualWinners)) / individualWinners)
  } else if (playerPos < playersToRefund) {
    return refundAmount
  } else {
    return 0
  }

}

module.exports = {
  calculatePrize
}