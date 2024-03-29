
calculatePrize = (ticketPrice, prizePool, players, playerPos, structure) => {
  switch (structure) {
    case 'STANDARD':
      return standardPrize(ticketPrice, prizePool, players, playerPos)
  }
}

standardPrize = (ticketPrice, prizePool, players, playerPos) => {
  const refund = 2
  const individual = 5

  console.log(ticketPrice, prizePool, players, playerPos)
  if (players === 1) {
    return prizePool
  }

  const refundPool = prizePool / refund
  const individualPool = prizePool - refundPool
  let playersToRefund = Math.floor(refundPool / ticketPrice)

  if (playersToRefund === 0) {
    playersToRefund = 1
  }

  let individualWinners = Math.floor(players / individual)
  if (individualWinners === 0) {
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
