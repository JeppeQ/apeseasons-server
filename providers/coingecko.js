const axios = require('axios')

const baseUrl = 'https://api.coingecko.com/api/v3'

getMarket = async (tokenIds) => {
  try {
    const url = `${baseUrl}/coins/markets?vs_currency=usd&ids=${tokenIds.join()}&price_change_percentage=1h%2C24h%2C7d`
    const response = await axios.get(url).catch(err => console.log(err))
    return response.data
  } catch (ex) {
    console.log(ex)
  }

  return []
}

module.exports = {
  getMarket
}