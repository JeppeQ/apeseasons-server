const { ethers } = require('ethers')

const infuraId = 'f80d51814eef48c3b911ed0f0b52507c'
const provider = new ethers.providers.InfuraProvider("matic", infuraId)

const getCurrentBlock = async () => {
  const block = await provider.getBlockNumber()

  return block
}


module.exports = {
  getCurrentBlock
}
