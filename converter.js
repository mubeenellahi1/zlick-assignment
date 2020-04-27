const axios = require('axios');

let num_of_transactions = parseInt(process.argv[2])
let exchange_url = "https://api.exchangeratesapi.io/"
let get_url = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/get-transaction"
let post_url = "https://7np770qqk5.execute-api.eu-west-1.amazonaws.com/prod/process-transactions"


function converted_prices(data){
    url = exchange_url + data.createdAt.slice(0,4) + '-'+ data.createdAt.slice(5,7) + '-'+ data.createdAt.slice(8,10) + "?base=EUR"
    return axios.get(url).then(res =>{
        return {
            "createdAt": data.createdAt,
            "currency": data.currency,
            "convertedAmount": parseFloat((data.amount / res.data.rates[data.currency]).toFixed(4)),
            "checksum": data.checksum
        }
    })
    
}

function transactions(){

    transactions = []
    promises = []
    promises2 = []

    //Adding all requests in a promises array
    for (var i = 0; i < num_of_transactions; i++) {
        promises.push(axios.get(get_url))
    }
    
    //After resolving all promises
    axios.all(promises).then(axios.spread((...responses) => {
        transactions = []

        responses.forEach(response => {
            promises2.push(converted_prices(response.data))    
        })

        //After getting converted prices
        axios.all(promises2).then(axios.spread((...responses2)=>{
            responses2.forEach(res => {
                transactions.push(res)
            });

            //submitting converted ammounts
            axios.post(post_url,{"transactions":transactions}).then(function(response){
                console.log(response.data)
            })
            
        }))

    }))
}


transactions()

