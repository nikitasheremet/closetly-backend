require("dotenv").config()
const express = require('express')
const { MongoClient, ObjectId } = require("mongodb")

const userRouter = express.Router()

const uri = `mongodb+srv://closetlyAdmin:${process.env.DB_PASS}@cluster0.vt6bu.mongodb.net/closetly?retryWrites=true&w=majority&useUnifiedTopology=true`

userRouter.post("/updatePassword", async (req, res) => {
    const { newPassword } = req.body
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const users = database.collection("users")

        let filter = { _id: ObjectId(res.locals.userId) }
        let updateDocument = {
            $set: { pass: newPassword },
        }
        await users.updateOne(filter, updateDocument)

        res.status(200).send(`Password Updated`)
    } catch (err) {
        console.dir(err)
        res.status(400).send(`Could not save password  ${err}`)
    } finally {
        await client.close()
    }
})
userRouter.post("/createUser", async (req, res) => {
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
userRouter.post("/updateUser", async (req, res) => {
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
userRouter.post("/login", async (req, res) => {
    const { username, password, token } = req.body
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
            if (password === checkIfUserExists.pass) {
                const newToken = jwt.sign(
                    { id: checkIfUserExists._id },
                    "secret",
                    {
                        expiresIn: 30000000,
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

module.exports = userRouter