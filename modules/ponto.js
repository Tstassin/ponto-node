const axios = require('axios')

module.exports = class Ponto {

    constructor() {
        this.options = {
            url: 'https://api.myponto.com/',
            method: 'get',
            responseType: 'json',
            headers: {
                "Accept": "application/json",
                "Authorization": "Bearer no set"
            }
        }
    }

    doRequest(options) {
        let url = this.options.url
        if (options && options.endpoint) url = url + options.endpoint
        return new Promise((resolve, reject) => {
            let allOptions = { ...this.options, ...options, url: url }
            axios(allOptions)
                .then(response => resolve(response.data))
                .catch(error => reject(error))
        })
    }

    async configure(api_key, baseUrl) {
        if (!api_key) throw "Please provide a valid API Key as argument"
        this.api_key = api_key
        let bearer = "Bearer " + api_key
        this.options.headers.Authorization = bearer
        if (baseUrl) this.options.url = baseUrl
        return this.doRequest()
    }

    setBaseUrl(baseUrl) {
        this.options.url = baseUrl
    }

    async listFinancialInstitutions(options) {
        return this.doRequest({ endpoint: "/financial-institutions", params: options })
    }
    async getFinancialInstitution(id) {
        return this.doRequest({ endpoint: "/financial-institutions/" + id })
    }

    async createSynchronization(resourceType, resourceId, subtype) {
        return this.doRequest({
            endpoint: "/synchronizations",
            method: "POST",
            data: {
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
        return this.doRequest({ endpoint: "/synchronizations/" + id })
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
            else return this.awaitSynchronization(id, interval)
        } catch (err) { throw err }
    }

    async listAccounts(options) {
        return this.doRequest({ endpoint: "/accounts", params: options })
    }

    async getAccount(id) {
        return this.doRequest({ endpoint: "/accounts/" + id })
    }

    async listTransactions(accountId, options) {
        return this.doRequest({ endpoint: "/accounts/" + accountId + "/transactions", params: options })
    }

    async getTransaction(accountId, transactionId) {
        return this.doRequest({ endpoint: "/accounts/" + accountId + "/transactions/" + transactionId })
    }
}