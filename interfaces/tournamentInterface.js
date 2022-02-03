const { roundNumber } = require("../helpers/utilities")

const tournamentInterface = (tournaments) => {
  return tournaments.map(data => {
    return {
      id: data.id,
      address: data.address,
      netWorth: data.netWorth,
      prize: data.prize,
      prizeStatus: data.prizeStatus,
      rank: data.rank,
      rewardAmount: data.rewardAmount,
      tournamentId: data.tournamentId,
      holdings: data.holdings.map(holding => {
        return {
          amount: holding.amount,
          amountFloat: holding.amountFloat,
          amountRounded: roundNumber(holding.amountFloat),
          playerId: holding.playerId,
          tokenAddress: holding.tokenAddress,
          tokenName: holding.tokenName,
          tokenSymbol: holding.tokenSymbol,
        }
      }),
      tournament: data.tournament
    }
  })
}

const playerInterface = (players) => {
  return players.map(data => {
    return {
      id: data.id,
      address: data.address,
      netWorth: data.netWorth,
      prize: data.prize,
      prizeStatus: data.prizeStatus,
      rank: data.rank,
      rewardAmount: data.rewardAmount,
      tournamentId: data.tournamentId,
      holdings: data.holdings.map(holding => {
        return {
          amount: holding.amount,
          amountFloat: holding.amountFloat,
          amountRounded: roundNumber(holding.amountFloat),
          playerId: holding.playerId,
          tokenAddress: holding.tokenAddress,
          tokenName: holding.tokenName,
          tokenSymbol: holding.tokenSymbol,
        }
      }),
      trades: data.trades
    }
  })
}

module.exports = {
  tournamentInterface,
  playerInterface
}