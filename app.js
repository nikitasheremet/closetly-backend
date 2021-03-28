const express = require("express")
const { MongoClient } = require("mongodb")
require("dotenv").config()
const app = express()
const port = 3000

app.get("/", (req, res) => {
    res.send("Hello World!")
})
app.post("/createUser", async (req, res) => {
    const { e: email, p: password } = req.query
    if (email && password) {
        const uri = `mongodb+srv://closetlyAdmin:${process.env.DB_PASS}@cluster0.vt6bu.mongodb.net/closetly?retryWrites=true&w=majority&useUnifiedTopology=true`
        const client = new MongoClient(uri)
        try {
            await client.connect()
            const database = client.db("closetly")
            const users = database.collection("users")
            const checkIfUserExistsQuery = { email }
            const checkIfUserExists = await users.findOne(
                checkIfUserExistsQuery
            )
            console.log("CHECK IF USER EXISTS", checkIfUserExists)
            if (!checkIfUserExists) {
                let userDoc = {
                    email: email,
                    pass: password,
                }
                await users.insertOne(userDoc)
                const query = { email }
                const user = await users.findOne(query)
                console.log(user)
                res.status(200).send(`User created ${JSON.stringify(user)}`)
            } else {
                res.status(400).send(`That email already exists`)
            }
        } catch (err) {
            console.dir(err)
            res.status(400).send(`Could not create user ${JSON.stringify(err)}`)
        } finally {
            await client.close()
        }
    } else {
        res.status(400).send("Does not contain proper params")
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
