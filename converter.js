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
  const transactionPromises = [];

  //Adding all transaction requests in a promises array
  for (let i = 0; i < numOfTransactions; i++) {
    transactionPromises.push(axios.get(config.getUrl));
  }

  //Waiting for all transaction requests to resolve
  const transactions = await axios.all(transactionPromises);

  //Added all exchange rate requests in a promises array
  const exchangeRatePromises = transactions.map(response => convertedPrices(response.data));

  //Waiting for all exhange rate requests to resolve
  const convertedTransactions = (await axios.all(exchangeRatePromises));


  //Submitting converted ammounts
  const axiosSubmissionResponse = await axios.post(config.postUrl, { "transactions":convertedTransactions });
  console.log(axiosSubmissionResponse.data);
}

submitTransactions();