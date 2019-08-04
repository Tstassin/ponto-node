const ponto = require('./ponto')
require('dotenv').config()

let myponto
beforeAll(() => {
    myponto = new ponto()
    myponto.configure(process.env.PONTO_API_KEY)
    }
)

describe("Testing Ponto object creation and configuration", () => {

    test("Configuring with an empty API Key resolves to an error", () => {
        return expect(myponto.configure()).rejects.toMatch(/Please provide at least an API Key as argument/)
    })
    test("Configuring without providing an API Key resolves to an error", () => {
        return expect(myponto.configure()).rejects.toMatch(/Please provide at least an API Key as argument/)
    })
    test("Configuring with a wrong API Key resolves to an error from Ponto API", async () => {
        return expect(myponto.configure("WRONG_API_KEY")).rejects.toThrow(/401/)
    })
    test("Configuring with a correct API Key (sourced from environment variable PONTO_API_KEY) resolves to a response from Ponto base api url", () => {
        return expect(myponto.configure(process.env.PONTO_API_KEY)).resolves.toHaveProperty("links")
    })

    test("Configuring with a correct API Key and no base URL parameter leaves baseURL as default", async () => {
        await myponto.configure(process.env.PONTO_API_KEY)
        return expect(myponto.getBaseUrl()).toMatch(/api.myponto.com/)
    })
    test("Configuring with a correct API Key and an empty string \"\" as base URL parameter changes baseURL to \"/”\"", async () => {
        await myponto.configure(process.env.PONTO_API_KEY, "").catch(e => e)
        //We throm away the error returned when configuring with an empty base URL
        return expect(myponto.getBaseUrl()).toMatch(/\//)
    })
    test("Configuring with a correct API Key and a custom non-empty base URL parameter replaces baseUrl with this value", async () => {
        await myponto.configure(process.env.PONTO_API_KEY, "https://base.url").catch(e => e)
        //We throm away the error returned when configuring with an empty base URL
        return expect(myponto.getBaseUrl()).toMatch("https://base.url")
    })

    afterAll(() => {
        myponto.configure(process.env.PONTO_API_KEY, "https://api.myponto.com/")
    })

})

describe("Testing Financial Institutions...", () => {

    test("list financial institutions", () => {
        let object = {
            data: [
                {
                    type: "financialInstitution"
                }
            ]
        }
        return expect(myponto.listFinancialInstitutions()).resolves.toMatchObject(object)
    })

    test("get financial institution", async () => {
        let object = {
            data: {
                type: "financialInstitution"
            }
        }
        res = await myponto.listFinancialInstitutions()
        financialInstitutionId = res.data[0].id
        return expect(myponto.getFinancialInstitution(financialInstitutionId)).resolves.toMatchObject(object)
    })

})

let accountId

describe("Testing Accounts...", () => {

    let accounts

    test("List accounts", async () => {
        accounts = await myponto.listAccounts()
        return expect(myponto.listAccounts()).resolves.toEqual(expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ type: "account" })]) }))
    })

    test("Get account", async () => {
        accountId = accounts.data[0].id
        return expect(myponto.getAccount(accountId)).resolves.toMatchObject({ data: { type: "account" } })
    })
})


describe("Testing Transactions...", () => {

    test("List transactions", async () => {
        let accounts = await myponto.listAccounts()
        return expect(myponto.listTransactions(accounts.data[0].id)).resolves.toEqual(expect.objectContaining({ data: expect.arrayContaining([expect.objectContaining({ type: "transaction" })]) }))
    })

    test("Get transaction", async () => {
        let accounts = await myponto.listAccounts()
        let transactions = await myponto.listTransactions(accounts.data[0].id)
        return expect(myponto.getTransaction(transactions.data[0].relationships.account.data.id, transactions.data[0].id)).resolves.toEqual(expect.objectContaining({ data: expect.objectContaining({ type: "transaction" }) }))
    })
})

describe("Testing pagination", () => {

    test("Testing pagination limit", async () => {
        let accounts = await myponto.listAccounts()
        let transactions = await myponto.listTransactions(accounts.data[0].id, {limit: 9})
        return expect(transactions.data).toHaveLength(9)
    })
})

describe("Testing Synchronizations...", () => {

    let synchronization

    test("Create synchronization", async () => {
        let object = {
            data: {
                type: "synchronization",
                attributes: {
                    status: "pending"
                }
            }
        }
        synchronization = await myponto.createSynchronization("account", "67246da0-fe9a-45c8-8d7d-e452babbc374", "accountDetails")
        return expect(synchronization).toMatchObject(object)
    })

    test("get Synchronization status", () => {
        let object = {
            data: {
                type: "synchronization"
            }
        }
        return expect(myponto.getSynchronization(synchronization.data.id)).resolves.toMatchObject(object)
    })

    test("await Synchronization ending", () => {
        let object = {
            data: {
                type: "synchronization",
                attributes: {
                    status: "success"
                }
            }
        }
        return expect(myponto.awaitSynchronization(synchronization.data.id, 500)).resolves.toMatchObject(object)
    })
})
