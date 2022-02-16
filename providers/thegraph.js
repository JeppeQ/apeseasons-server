const fetch = require('cross-fetch')
const { ApolloClient, InMemoryCache, gql, HttpLink } = require("@apollo/client/core")

const defaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const client = new ApolloClient({
  link: new HttpLink({ uri: 'https://api.thegraph.com/subgraphs/id/QmbkY2Yqq5cNSHq2jwkKxnfQXhtRckb3hckyfPzR86oDiK', fetch }),
  cache: new InMemoryCache(),
  defaultOptions: defaultOptions
});

fetchNewData = async (blocks) => {
  const tournamentBlock = getLastBlock(blocks, 'tournament')
  const playerBlock = getLastBlock(blocks, 'player')
  const tradeBlock = getLastBlock(blocks, 'trade')
  const playerRewardBlock = getLastBlock(blocks, 'playerReward')

  try {
    const query = await client.query({
      query: gql`
      query GetAllData {

        tournaments(where:{eventBlock_gt:${tournamentBlock}} orderBy:eventBlock) {
          id
          name
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

        players(where:{eventBlock_gt:${playerBlock}} orderBy:eventBlock) {
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

        trades(where:{eventBlock_gt:${tradeBlock}} orderBy:eventBlock) {
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
        
        playerRewards(where:{eventBlock_gt:${playerRewardBlock}} orderBy:eventBlock) {
          id
          eventBlock
          amount
          player {
            id
          }
          tournament {
            id
          }
        }
      }
    `
    })

    return query.data
  } catch (ex) {
    console.log(ex)
  }
}

getLastBlock = (blocks, entity) => {
  const status = blocks.find(b => b.entity === entity)

  let block = status ? status.block || 0 : 0

  return block
}

module.exports = {
  fetchNewData
}