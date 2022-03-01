const { ethers } = require('ethers')
const tournamentContract = require("../contracts/tournament.json")
const erc20Contract = require("../contracts/erc20.json")

const polygonTokens = require('../whitelists/polygon.json')
const { finalizeStandings } = require('./tournamentService')
const whitelistedTokens = polygonTokens.map(token => token.address)

const infuraId = 'f80d51814eef48c3b911ed0f0b52507c'
const provider = new ethers.providers.InfuraProvider("matic", infuraId)
const gasOptions = { gasLimit: 10000000, gasPrice: BigInt(10 ** 11), value: 0 }

const getCurrentBlock = async () => {
  const block = await provider.getBlockNumber()

  return block
}

const finalizeTournament = async (tournament) => {
  try {
    const wallet = new ethers.Wallet(process.env.GAMEMASTER_KEY, provider);
    const contract = new ethers.Contract(tournament.id, tournamentContract.abi, wallet);

    const liquidateTx = await liquidateTournament(tournament.id, contract);

    if (liquidateTx) {
      await score(tournament, contract);
    }
  } catch (ex) {
    tournament.finalized = 'FAILED'
    tournament.save()
  }

}

const liquidateTournament = async (address, contract) => {
  const isLiquidated = await contract.isLiquidated();

  if (isLiquidated) {
    return true;
  }

  //1. Get a list of whitelisted tokens owned by tournament contract:
  var ownedTokenList = []
  for (const tokenAddress of whitelistedTokens) {
    console.log("Fetching token at:", tokenAddress)

    const tokenContract = new ethers.Contract(tokenAddress, erc20Contract.abi, provider);

    const amountOwned = await tokenContract.balanceOf(address);

    console.log("Token balance:", amountOwned);

    if (amountOwned.gt(0)) {
      ownedTokenList.push(tokenAddress);
    }
  }

  //2. Create array of minimum payouts
  //TODO: Calculate a reasonable minOut
  const minOutArray = new Array(ownedTokenList.length).fill(1);

  console.log("Liquidating the following tokens:", ownedTokenList);

  const liquidationTx = await contract.liquidate(ownedTokenList, minOutArray, gasOptions);

  return liquidationTx.wait()
}

async function score(tournament, contract) {
  console.log("Entering scoring function")

  var playerScores = []
  var playerTokens = {}
  for (const p of tournament.players) {
    const player = p.address
    playerTokens[player] = []

    for (const tokenAddress of whitelistedTokens) {
      const balance = await contract.getBalance(player, tokenAddress)

      if (balance.gt(0)) {
        playerTokens[player].push(tokenAddress)
      }
    }

    playerScores.push([player, await contract.calculateScore(player, playerTokens[player])])
  }

  console.log("Player scores:", playerScores)
  console.log("Player tokens:", playerTokens)

  //2. Sort players by liquidated value
  playerScores.sort(function (a, b) {
    if (a[1].gt(b[1])) {
      return -1
    } else {
      return 1
    }
  })


  var sortedPlayers = playerScores.map((playerArray) => playerArray[0])
  var sortedPlayerTokens = playerScores.map((playerArray) => playerTokens[playerArray[0]])

  console.log("Scoring the following players:", sortedPlayers);
  console.log("With the following tokens:", sortedPlayerTokens);

  const scoreTx = await contract.scorePlayers(sortedPlayers, sortedPlayerTokens, gasOptions);
  const receipt = await scoreTx.wait()

  if (receipt) {
    finalizeStandings(tournament, playerScores)
  }
}

module.exports = {
  getCurrentBlock,
  finalizeTournament
}
