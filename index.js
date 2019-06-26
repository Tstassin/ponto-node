const ponto = require('./modules/ponto')
require('dotenv').config()

const interval = 1500

function delay(t) {
    return new Promise(resolve => { setTimeout(resolve, t); });
}

async function main() {
    let res
    var myponto = new ponto()
    res = await myponto.configure(process.env.PONTO_API_KEY)
    await delay(interval)
    console.log(res)
    res = await myponto.listFinancialInstitutions()
    await delay(interval)
    console.log(res)
    res = await myponto.getFinancialInstitution(res.data[0].id)
    await delay(interval)
    console.log(res)
    res = await myponto.createSynchronization("account", "67246da0-fe9a-45c8-8d7d-e452babbc374", "accountDetails")
    await delay(interval)
    console.log(res)
    res = await myponto.getSynchronization(res.data.id)
    await delay(interval)
    console.log(res)
    res = await myponto.awaitSynchronization(res.data.id, 500)
    await delay(interval)
    console.log(res)

}

main()