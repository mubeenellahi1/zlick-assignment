const axios = require('axios');
const config = require('./config');
const numOfTransactions = parseInt(process.argv[2], 10);

const convertedPrices = async (data) => {
  const url = `${config.exchangeUrl}${new Date(data.createdAt).toISOString().substring(0, 10)}?base=EUR`;
  return {
    createdAt: data.createdAt,
    currency: data.currency,
    convertedAmount: parseFloat((data.amount / (await axios.get(url)).data.rates[data.currency]).toFixed(4)),
    checksum: data.checksum,
  };
}

const submitTransactions = async () => {
  const promises = [];
  let transactions;
  let promises2;

  //Adding all requests in a promises array
  for (let i = 0; i < numOfTransactions; i++) {
    promises.push(axios.get(config.getUrl));
  }

  //After resolving all promises
  const axiosAllResponse = await axios.all(promises);
  promises2 = axiosAllResponse.map(response => convertedPrices(response.data));

  //After getting converted prices
  const axiosAllPromises2 = await axios.all(promises2);
  transactions = axiosAllPromises2.map(d => d);

  //submitting converted ammounts
  const axiosSubmissionResponse = await axios.post(config.postUrl, { transactions });
  console.log(axiosSubmissionResponse.data);
}

submitTransactions();