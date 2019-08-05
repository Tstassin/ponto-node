const axios = require('axios')

module.exports = class Ponto {

    //GLOBALS
    async getDefaultBaseUrl() { return "https://api.myponto.com/" }

    constructor() {
        // url and api_key are set using configure()
        this.options = {
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
        if (!api_key) throw "Please provide at least an API Key as argument"
        this.api_key = api_key

        let bearer = "Bearer " + api_key
        this.options.headers.Authorization = bearer

        console.log("API Key correctly set")
        if (baseUrl == "" || baseUrl == "/") {
            this.options.url = "/"
            console.log("given empty base URL, replacing default url with \"/\"")
        } else if (!baseUrl) {
            let defaultBaseUrl = await this.getDefaultBaseUrl()
            this.options.url = defaultBaseUrl
            console.log("Using default base URL : " + defaultBaseUrl)
        } else {
            this.options.url = baseUrl
            console.log("Base URL now changed to : " + baseUrl)
        }
        return await this.doRequest()
    }

    getBaseUrl() {
        return this.options.url
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