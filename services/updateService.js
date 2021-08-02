const fetch = require('cross-fetch')
const { ApolloClient, InMemoryCache, gql, HttpLink } = require("@apollo/client/core")
const { utils } = require('ethers')

const db = require("../models")
const polygonTokens = require('../whitelists/polygon.json')
const { getMarket } = require('../providers/coingecko')
const { getTokens } = require('./tokenService')
const { calculatePrize } = require('../helpers/utilities')
const { getCurrentBlock } = require('./web3Service')

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.thegraph.com/subgraphs/id/QmW88bz4psLgGWhdRPTf6TbW58nQSrWsdhG5C7mAETCLUV', fetch }),
  cache: new InMemoryCache()
});

updateAll = async () => {
  await updateTokens()
  const tokens = await getTokens()
  const currentBlock = await getCurrentBlock()

  await fetchTournaments(tokens)
  await fetchPlayers(tokens)
  await fetchTrades(tokens)
  await fetchPlayerRewards()
  await updateTournaments(tokens, currentBlock)
}

getLastBlock = async (entity) => {
  const status = await db.updateStatus.findOne({ where: { entity } })

  let block = status ? status.block || 0 : 0

  return block
}

fetchTournaments = async (tokens) => {
  const block = await getLastBlock('tournament')

  const query = await client.query({
    query: gql`
      query GetTournaments {
        tournaments(where:{eventBlock_gt:${block}},orderBy:eventBlock) {
          id
          eventBlock
          start
          end
          startBlock
          endBlock
          ticketPrice
          ticketToken
          playerCount
          finalized
        }
      }
    `
  })

  if (query && query.data && query.data.tournaments && query.data.tournaments.length > 0) {
    const tournaments = query.data.tournaments.map(tourney => {

      const tokenData = tokens.find(x => x.address.toUpperCase() === tourney.ticketToken.toUpperCase())

      return {
        id: tourney.id,
        startBlock: tourney.startBlock,
        endBlock: tourney.endBlock,
        startTime: tourney.start,
        endTime: tourney.end,
        ticketToken: tourney.ticketToken,
        ticketTokenSymbol: tokenData.symbol,
        ticketPrice: tourney.ticketPrice,
        ticketPriceFloat: Number(utils.formatUnits(tourney.ticketPrice, tokenData.decimals)),
        playerCount: tourney.playerCount,
        eventBlock: tourney.eventBlock
      }
    })

    await db.tournament.bulkCreate(tournaments, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'tournament', block: tournaments[tournaments.length - 1].eventBlock })
  }
}

fetchPlayers = async (tokens) => {
  const block = await getLastBlock('player')

  const query = await client.query({
    query: gql`
      query GetPlayers {
        players(where:{eventBlock_gt:${block}},orderBy:eventBlock) {
          id
          eventBlock
          address
          tournament {
            id
          }
          tokensBalances {
            id
            token
            amount
          }
        }
      }
    `
  }).catch(ex => console.log(ex))

  if (query && query.data && query.data.players && query.data.players.length > 0) {

    let holdings = []

    const players = query.data.players.map(player => {
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

    await db.holding.bulkCreate(holdings, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.player.bulkCreate(players, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'player', block: players[players.length - 1].eventBlock })
  }
}

fetchTrades = async (tokens) => {
  const block = await getLastBlock('trade')

  const query = await client.query({
    query: gql`
      query GetTrades {
        trades(where:{eventBlock_gt:${block}},orderBy:eventBlock) {
          id
          eventBlock
          from
          to
          fromAmount
          toAmount
          time
          player {
            id
          }
        }
      }
    `
  }).catch(ex => console.log(ex))

  if (query && query.data && query.data.trades && query.data.trades.length > 0) {


    const trades = query.data.trades.map(trade => {

      const fromTokenData = tokens.find(x => x.address.toUpperCase() === trade.from.toUpperCase())
      const toTokenData = tokens.find(x => x.address.toUpperCase() === trade.to.toUpperCase())

      return {
        id: trade.id,
        playerId: trade.player.id,
        from: fromTokenData.symbol,
        to: toTokenData.symbol,
        amountFrom: Number(utils.formatUnits(trade.amountFrom, fromTokenData.decimals)),
        amountTo: Number(utils.formatUnits(trade.amountTo, toTokenData.decimals)),
        timestamp: token.time,
        fromAddress: trade.from,
        toAddress: trade.to,
        amountFromRaw: trade.amountFrom,
        amountToRaw: trade.amountTo,
        eventBlock: trade.eventBlock
      }
    })

    await updateHoldings(trades)
    await db.trade.bulkCreate(trades, { ignoreDuplicates: true }).catch(ex => console.log(ex))
    await db.updateStatus.upsert({ entity: 'trade', block: trades[trades.length - 1].eventBlock })
  }
}

fetchPlayerRewards = async () => {
  const block = await getLastBlock('playerReward')

  const query = await client.query({
    query: gql`
      query GetPlayerRewards {
        playerRewards(where:{eventBlock_gt:${block}},orderBy:eventBlock) {
          id
          eventBlock
          player {
            id
          }
          tournament {
            id
          }
        }
      }
    `
  }).catch(ex => console.log(ex))

  if (query && query.data && query.data.trades && query.data.trades.length > 0) {

    const playerRewards = query.data.playerRewards.map(reward => {

      return {
        id: reward.player.id,
        tournamentId: reward.tournament.id,
        prizeStatus: 'claimed',
        eventBlock: trade.eventBlock
      }
    })

    await db.player.bulkCreate(playerRewards, { updateOnDuplicate: ["prizeStatus"] })
    await db.updateStatus.upsert({ entity: 'playerReward', block: playerRewards[playerRewards.length - 1].eventBlock })
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

    fromHolding.amount = BigInt(fromHolding.amount - trade.amountFromRaw)
    fromHolding.amountFloat -= trade.amountFrom
    await fromHolding.save()

    const toHolding = await db.holding.findOne({
      where: {
        playerId: trade.playerId,
        tokenAddress: trade.toAddress
      }
    })

    if (toHolding) {

      toHolding.amount = BigInt(toHolding.amount + trade.amountToRaw)
      toHolding.amountFloat += trade.amountTo
      await toHolding.save()

    } else {

      await db.holding.insert({
        playerId: trade.playerId,
        tokenAddress: trade.toAddress,
        tokenSymbol: trade.to,
        amount: trade.amountToRaw,
        amountFloat: trade.amountTo
      })

    }

  }))
}

updateTournaments = async (tokens, currentBlock) => {

  const tournaments = await db.tournament.findAll({
    where: {
      endBlock: { [Op.gt]: currentBlock }
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
        prize: calculatePrize(tournament.ticketPrice, prizePool, players.length, i + 1, tournament.prizeRefunds, tournament.prizeIndividual)
      }
    })

    playerQuery = playerQuery.concat(players)
    tournamentQuery.push({
      id: tournament.id,
      playerCount: players.length,
      prizePool: prizePool
    })
  })

  await db.tournament.bulkCreate(tournamentQuery, { updateOnDuplicate: ["playerCount", "prizePool"] })
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
        price: tokenData ? tokenData.current_price : token.price
      }
    })

    await db.token.bulkCreate(updatedTokens, { updateOnDuplicate: ["price"] })
  }
}

// updateTokens()
updateAll()

module.exports = {
  updateTokens,
  updateAll
}
