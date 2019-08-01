# ponto-node

Ponto API javascript client


## Documentation

[Full API info] (https://documentation.myponto.com/api/)

Methods available :

* async configure(api_key)
* async listFinancialInstitutions(_options_)
* async getFinancialInstitution(id)
* async createSynchronization(resourceType, resourceId, subtype)
* async getSynchronization(id)
* async awaitSynchronization(id, interval)
* async listAccounts(_options_)
* async getAccount(id)
* async listTransactions(accountId, _options_)
* async getTransaction(accountId, transactionId)

_options_ is an optional parameter provided as an object specifying pagination (see API doc) :
```{ limit: 3 }```

## Installation

```
npm install tstassin/ponto-node
```

create a ```.env```file at the root of the folder and supply your ```PONTO_API_KEY``` as an environment variable : 


```
PONTO_API_KEY=your_api_key
```

import ```tstassin/ponto-node```:

```
const ponto = require('./modules/ponto')
require('dotenv').config()

```

### Example

```
const ponto = require('./modules/ponto')
require('dotenv').config()

async function main() {
    try {
        var myponto = new ponto()
        await myponto.configure(process.env.PONTO_API_KEY)
        let accounts = await myponto.listAccounts()
        accounts.data.map(account => console.log(account.attributes.reference + " / " + account.attributes.currentBalance + account.attributes.currency))
        let anAccount = await myponto.getAccount(accounts.data[0].id)
        let transactionsFromThisAccount = await myponto.listTransactions(anAccount.data.id, { limit: 3 })
        console.log(transactionsFromThisAccount)
        let nextTransactions = await myponto.listTransactions(anAccount.data.id,
            { limit: 3, after: transactionsFromThisAccount.meta.paging.after })
        console.log(nextTransactions)
    } catch (e) {
        console.error(e.statusCode, e.statusMessage)
    }
}

main()
```

### Requirements

* NPM and Node.js

