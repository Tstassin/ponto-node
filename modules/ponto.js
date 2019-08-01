const request = require('request')


module.exports = class Ponto {

    constructor() {
        this.options = {
            uri: "https://api.myponto.com/",
            method: "GET",
            json: true
        }
        this.connected = false
    }

    doRequest(options) {
        return new Promise((resolve, reject) => {
            let allOptions = { ...this.options, ...options }
            request(allOptions, (err, res, body) => {
                if ( !err && ( res.statusCode === 200 || res.statusCode === 201)) {
                    console.log(res.statusCode, res.statusMessage)
                    this.connected = true
                    resolve(body)
                } else {
                    let error = { statusCode: res.statusCode, statusMessage: res.statusMessage, error: err , body: body, response: res}
                    console.log(body)
                    reject(error)
                }
            }).auth(null, null, true, this.api_key)
        })
    }

    async configure(api_key) {
        this.api_key = api_key
        return this.doRequest()
    }

    async listFinancialInstitutions(options) {
        return this.doRequest({ uri: "https://api.myponto.com/financial-institutions", qs: options })
    }
    async getFinancialInstitution(id) {
        return this.doRequest({ uri: "https://api.myponto.com/financial-institutions/" + id })
    }

    async createSynchronization(resourceType, resourceId, subtype) {
        return this.doRequest({
            uri: "https://api.myponto.com/synchronizations",
            method: "POST",
            json: {
                "data": {
                    "type": "synchronization",
                    "attributes": {
                        "resourceType": resourceType,
                        "resourceId": resourceId,
                        "subtype": subtype
                    }
                }
            }
        })
    }

    async getSynchronization(id) {
        return this.doRequest({ uri: "https://api.myponto.com/synchronizations/" + id })
    }

    delay(t) {
        return new Promise(resolve => { setTimeout(resolve, t); });
    }

    async awaitSynchronization(id, interval) {
        try {
            await this.delay(interval)
            let res = await this.getSynchronization(id)
            if (res.data.attributes.status == "success") return res
            else if (res.data.attributes.status == "error") throw res
            else return this.awaitSynchronization(interval, id)
        } catch (err) {throw err}
    }

    async listAccounts(options) {
        return this.doRequest({ uri: "https://api.myponto.com/accounts/", qs: options })
    }

    async getAccount(id) {
        return this.doRequest({ uri: "https://api.myponto.com/accounts/" + id })
    }

    async listTransactions(accountId, options) {
        return this.doRequest({ uri: "https://api.myponto.com/accounts/" + accountId + "/transactions", qs : options})
    }

    async getTransaction(accountId, transactionId) {
        return this.doRequest({ uri: "https://api.myponto.com/accounts/" + accountId + "/transactions/" + transactionId})
    }
}