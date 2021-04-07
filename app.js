const e = require("express")
const express = require("express")
const { MongoClient } = require("mongodb")
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
var cors = require("cors")

require("dotenv").config()
const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const uri = `mongodb+srv://closetlyAdmin:${process.env.DB_PASS}@cluster0.vt6bu.mongodb.net/closetly?retryWrites=true&w=majority&useUnifiedTopology=true`

app.post("/createUser", async (req, res) => {
    const { email, password } = req.body
    if (email && password) {
        const client = new MongoClient(uri)
        try {
            await client.connect()
            const database = client.db("closetly")
            const users = database.collection("users")
            const checkIfUserExistsQuery = { email }
            const checkIfUserExists = await users.findOne(
                checkIfUserExistsQuery
            )
            if (!checkIfUserExists) {
                let userDoc = {
                    email,
                    pass: password,
                }
                await users.insertOne(userDoc)
                const query = { email }
                const user = await users.findOne(query)
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

app.post("/updateUser", async (req, res) => {
    const { currentEmail, updateObject } = req.body
    if (currentEmail && updateObject) {
        const client = new MongoClient(uri)
        try {
            await client.connect()
            const database = client.db("closetly")
            const users = database.collection("users")
            const checkIfUserExistsQuery = { email: currentEmail }
            const checkIfUserExists = await users.findOne(
                checkIfUserExistsQuery
            )
            if (checkIfUserExists) {
                let filter = { _id: checkIfUserExists._id }
                let updateDocument = {
                    $set: updateObject,
                }
                await users.updateOne(filter, updateDocument)
                const query = { _id: checkIfUserExists._id }
                const user = await users.findOne(query)
                res.status(200).send(`User updated ${JSON.stringify(user)}`)
            } else {
                res.status(400).send(`Invalid email`)
            }
        } catch (err) {
            console.dir(err)
            res.status(400).send(`Could not update user ${JSON.stringify(err)}`)
        } finally {
            await client.close()
        }
    } else {
        res.status(400).send("Does not contain proper params")
    }
})

app.post("/login", async (req, res) => {
    const { username, password, token } = req.body
    console.log("Username", username, "Password", password, "token", token)

    if (token) {
        try {
            const result = jwt.verify(JSON.parse(token), "secret")
            res.status(200).send({ loggedIn: true })
        } catch (err) {
            console.log("token not valid")
        }
    }

    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const users = database.collection("users")
        const checkIfUserExistsQuery = { email: username }
        const checkIfUserExists = await users.findOne(checkIfUserExistsQuery)
        if (checkIfUserExists) {
            console.log(1)
            if (password === checkIfUserExists.pass) {
                const newToken = jwt.sign(
                    { id: checkIfUserExists._id },
                    "secret",
                    {
                        expiresIn: 600,
                    }
                )
                res.status(200).send({ loggedIn: true, createdToken: newToken })
            } else {
                res.status(401).send(`FAILED LOGIN!!!! wrong password`)
            }
        } else {
            res.status(200).send(`FAILED LOGIN!!!! user doesnt exist`)
        }
    } finally {
        await client.close()
    }
})

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})