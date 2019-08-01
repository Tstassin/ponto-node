const ponto = require('./modules/ponto')
require('dotenv').config()

async function main() {
    var myponto = new ponto()
    res = await myponto.configure(process.env.PONTO_API_KEY)
    let accounts = await myponto.listAccounts()
    accounts.data.map( account => console.log(account.attributes.reference + " / " + account.attributes.currentBalance + account.attributes.currency) )
    let anAccount = await myponto.getAccount(accounts.data[0].id)
    let transactionsFromThisAccount = await myponto.listTransactions(anAccount.data.id, {limit: 3})
    console.log (transactionsFromThisAccount)
    let nextTransactions = await myponto.listTransactions(anAccount.data.id, 
        {limit:3, after: transactionsFromThisAccount.meta.paging.after})
    console.log(nextTransactions)
}

main()