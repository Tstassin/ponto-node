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
                if (allOptions.method === "GET" && (!err && res.statusCode === 200)
                    || allOptions.method === "POST" && (!err && res.statusCode === 201)) {
                    console.log(res.statusCode, res.statusMessage)
                    this.connected = true
                    resolve(body)
                } else {
                    let error = res.statusCode + " " + res.statusMessage + " with error message : " + err
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

    async listFinancialInstitutions() {
        return this.doRequest({ uri: "https://api.myponto.com/financial-institutions" })
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

    async awaitSynchronization(interval, id) {
        try {
            await this.delay(interval)
            let res = await this.getSynchronization(id)
            if (res.data.attributes.status == "success") return res
            else if (res.data.attributes.status == "error") throw res
            else return this.awaitSynchronization(interval, id)
        } catch (err) {throw err}
    }
}