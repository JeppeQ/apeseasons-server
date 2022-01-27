const db = require("../models")
const { Op } = require("sequelize")
const { utils } = require('ethers')
const polygonTokens = require('../whitelists/polygon.json')
const { getMarket } = require('../providers/coingecko')
const { fetchNewData } = require('../providers/thegraph')
const { getTokens } = require('./tokenService')
const { calculatePrize } = require('./prizeService')
const { getCurrentBlock } = require('./web3Service')
const { DateTime } = require('luxon')

updateAll = async () => {
  const tokens = await getTokens()

  const updateBlocks = await db.updateStatus.findAll({})
  const data = await fetchNewData(updateBlocks)

  if (data) { 
    await addTournaments(data.tournaments, tokens)
    await addPlayers(data.players, tokens)
    await addTrades(data.trades, tokens)
    await addPlayerRewards(data.playerRewards)
  }
  
  await updateTournaments(tokens)
}

addTournaments = async (tournaments, tokens) => {
  if (tournaments.length > 0) {
    const newTournaments = tournaments.map(tourney => {

      const tokenData = tokens.find(x => x.address.toUpperCase() === tourney.ticketToken.toUpperCase())

      return {
        id: tourney.id,
        name: tourney.name,
        startBlock: tourney.startBlock,
        endBlock: tourney.endBlock,
        startTime: tourney.start,
        endTime: tourney.end,
        ticketToken: tourney.ticketToken,
        ticketTokenSymbol: tokenData.symbol,
        ticketPrice: tourney.ticketPrice,
        ticketPriceFloat: Number(utils.formatUnits(tourney.ticketPrice, tokenData.decimals)),
        playerCount: tourney.playerCount,
        eventBlock: tourney.eventBlock,
        finalized: tourney.finalized
      }
    })

    await db.tournament.bulkCreate(newTournaments, { updateOnDuplicate: ["finalized", "playerCount"] }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'tournament', block: newTournaments[newTournaments.length - 1].eventBlock })
  }
}

addPlayers = async (players, tokens) => {
  if (players.length > 0) {

    let holdings = []

    const newPlayers = players.map(player => {

      player.tokensBalances.map(token => {

        const tokenData = tokens.find(x => x.address.toUpperCase() === token.token.toUpperCase())

        holdings.push({
          playerId: player.id,
          tokenAddress: token.token,
          amount: token.amount,
          tokenName: tokenData.name,
          tokenSymbol: tokenData.symbol,
          amountFloat: Number(utils.formatUnits(token.amount, tokenData.decimals))
        })
      })

      return {
        id: player.id,
        address: player.address,
        tournamentId: player.tournament.id,
        eventBlock: player.eventBlock
      }
    })
    await db.player.bulkCreate(newPlayers, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.holding.bulkCreate(holdings, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'player', block: newPlayers[newPlayers.length - 1].eventBlock })
  }
}

addTrades = async (trades, tokens) => {
  if (trades.length > 0) {

    const newTrades = trades.map(trade => {

      const fromTokenData = tokens.find(x => x.address.toUpperCase() === trade.from.toUpperCase())
      const toTokenData = tokens.find(x => x.address.toUpperCase() === trade.to.toUpperCase())

      return {
        id: trade.id,
        playerId: trade.player.id,
        from: fromTokenData.symbol,
        to: toTokenData.symbol,
        fromName: fromTokenData.name,
        toName: toTokenData.name,
        fromAmount: Number(utils.formatUnits(trade.fromAmount, fromTokenData.decimals)),
        toAmount: Number(utils.formatUnits(trade.toAmount, toTokenData.decimals)),
        timestamp: trade.time,
        fromAddress: trade.from,
        toAddress: trade.to,
        fromAmountRaw: trade.fromAmount,
        toAmountRaw: trade.toAmount,
        eventBlock: trade.eventBlock
      }
    })

    await updateHoldings(newTrades)
    await db.trade.bulkCreate(newTrades, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'trade', block: newTrades[newTrades.length - 1].eventBlock })
  }
}

addPlayerRewards = async (playerRewards) => {
  if (playerRewards.length > 0) {
    const newPlayersRewarded = playerRewards.map(reward => {

      return {
        id: reward.player.id,
        tournamentId: reward.tournament.id,
        prizeStatus: 'claimed',
        eventBlock: reward.eventBlock
      }
    })

    await db.player.bulkCreate(newPlayersRewarded, { updateOnDuplicate: ["prizeStatus"] })
    await db.updateStatus.upsert({ entity: 'playerReward', block: newPlayersRewarded[newPlayersRewarded.length - 1].eventBlock })
  }
}

updateHoldings = async (trades) => {
  await Promise.all(trades.map(async trade => {

    const fromHolding = await db.holding.findOne({
      where: {
        playerId: trade.playerId,
        tokenAddress: trade.fromAddress
      }
    })

    fromHolding.amount = BigInt(fromHolding.amount) - BigInt(trade.fromAmountRaw)
    fromHolding.amountFloat -= trade.fromAmount
    await fromHolding.save()

    const toHolding = await db.holding.findOne({
      where: {
        playerId: trade.playerId,
        tokenAddress: trade.toAddress
      }
    })

    if (toHolding) {

      toHolding.amount = BigInt(toHolding.amount) + BigInt(trade.toAmountRaw)
      toHolding.amountFloat += trade.toAmount
      await toHolding.save()

    } else {

      await db.holding.create({
        playerId: trade.playerId,
        tokenAddress: trade.toAddress,
        tokenName: trade.toName,
        tokenSymbol: trade.to,
        amount: trade.toAmountRaw,
        amountFloat: trade.toAmount
      })

    }

  }))
}

updateTournaments = async (tokens) => {
  const currentBlock = await getCurrentBlock()

  const tournaments = await db.tournament.findAll({
    where: {
      endBlock: { [Op.gte]: currentBlock }
    },
    include: {
      model: db.player,
      include: {
        model: db.holding
      }
    },
  })

  let tournamentQuery = []
  let playerQuery = []

  tournaments.map(tournament => {
    let players = []
    let prizePool = 0

    tournament.players.map(player => {
      let netWorth = 0
      player.holdings.map(holding => {
        const token = tokens.find(x => x.address.toUpperCase() === holding.tokenAddress.toUpperCase())
        netWorth += holding.amountFloat * token.price
      })

      players.push({
        id: player.id,
        netWorth
      })
      prizePool += netWorth
    })

    prizePool = prizePool * 0.9 // 10% protocol fee

    players = players.sort((a, b) => b.netWorth - a.netWorth)
    players = players.map((player, i) => {
      return {
        ...player,
        rank: i + 1,
        prize: calculatePrize(tournament.ticketPrice, prizePool, players.length, i, tournament.prizeStructure)
      }
    })

    playerQuery = playerQuery.concat(players)
    tournamentQuery.push({
      id: tournament.id,
      playerCount: players.length,
      prizePool: prizePool,
      placesPaid: players.filter(p => p.prize > 0).length,
      endTime: DateTime.utc().valueOf() + ((tournament.endBlock - currentBlock) * 2100),
      startTime: tournament.startTime
    })

    if (tournament.startBlock > currentBlock) {
      tournamentQuery.startTime = DateTime.utc().valueOf() + ((tournament.startBlock - currentBlock) * 2100)
    }
  })

  await db.tournament.bulkCreate(tournamentQuery, { updateOnDuplicate: ["playerCount", "prizePool", "placesPaid", "startTime", "endTime"] })
  await db.player.bulkCreate(playerQuery, { updateOnDuplicate: ["netWorth", "rank", "prize"] })
}

getWhitelist = (network) => {
  return polygonTokens
}

updateTokens = async (network = 'polygon') => {
  const tokens = getWhitelist(network)
  const data = await getMarket(tokens.map(coin => coin.coingeckoId))

  if (data && data.length > 0) {
    const updatedTokens = tokens.map(token => {
      const tokenData = data.find(x => x.id === token.coingeckoId)
      return {
        ...token,
        network,
        price: tokenData ? tokenData.current_price : token.price,
        priceChangeDay: tokenData.price_change_percentage_24h_in_currency
      }
    })

    await db.token.bulkCreate(updatedTokens, { updateOnDuplicate: ["price", "priceChangeDay"] })
  }
}

module.exports = {
  updateTokens,
  updateAll
}
