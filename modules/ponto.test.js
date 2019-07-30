const ponto = require('./ponto')
require('dotenv').config()

let myponto
beforeAll(() =>
    myponto = new ponto()
)

describe("Testing Ponto object creation and configuration", () => {

    test('new Ponto Object is instance of class Ponto', () => {
        expect(myponto).toHaveProperty("options")
        expect(myponto).toHaveProperty("connected")
    })

    test("Configuring with an empty API Key resolves to an error code from Ponto base api url", () => {
        return expect(myponto.configure("")).rejects.toMatchObject({ statusCode: 401 })
    })
    test("Configuring with a correct API Key (sourced from environement variable PONTO_API_KEY) resolves to a response from Ponto base api url", () => {
        return expect(myponto.configure(process.env.PONTO_API_KEY)).resolves.toHaveProperty("links")
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

//Test here account first

describe("Testing Accounts...", () => {

    test("List accounts", async () => {
        let object = {
            "data": [
                {
                    "type": "account"
                },
                {
                    "type": "account"
                },
                {
                    "type": "account"
                }
            ]
        }
        return expect(myponto.listAccounts()).resolves.toEqual(expect.objectContaining({data: expect.arrayContaining([expect.objectContaining({type: "account"})])}))
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
