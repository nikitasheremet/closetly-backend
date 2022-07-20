require("dotenv").config()
import * as express from "express"
import { MongoClient, ObjectId } from "mongodb"
import authenticateRequest from "../middleware/authenticateRequest"

const imageRouter = express.Router()

const uri = `mongodb+srv://closetlyAdmin:${process.env.DB_PASS}@cluster0.vt6bu.mongodb.net/closetly?retryWrites=true&w=majority&useUnifiedTopology=true`

imageRouter.get("/showPictures", authenticateRequest, async (req, res) => {
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const images = database.collection("images")
        const foundImages = await images
            .find({ user: res.locals.userId })
            .toArray()
        res.status(200).send(foundImages)
    } finally {
        await client.close()
    }
})

imageRouter.post("/removeImage", async (req, res) => {
    const { imageId } = req.body
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const images = database.collection("images")
        let imageDocToFind = {
            _id: ObjectId(imageId),
        }
        await images.deleteOne(imageDocToFind)
        res.status(200).send(`Image Deleted`)
    } catch (err) {
        console.dir(err)
        res.status(400).send(`Could not delete image  ${err}`)
    } finally {
        await client.close()
    }
})

imageRouter.post("/updateImage", async (req, res) => {
    const { _id, ...imageDetails } = req.body
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const images = database.collection("images")
        let filter = { _id: ObjectId(_id) }
        let updateDocument = {
            $set: imageDetails,
        }
        console.log(filter, updateDocument)
        const hello = await images.updateOne(filter, updateDocument)
        // console.log(hello)
        res.status(200).send(`Image Updated`)
    } catch (err) {
        console.dir(err)
        res.status(400).send(`Could not update image  ${err}`)
    } finally {
        await client.close()
    }
})

imageRouter.post("/saveImage", async (req, res) => {
    const { description, title, name, url, tags } = req.body
    const client = new MongoClient(uri)
    try {
        await client.connect()
        const database = client.db("closetly")
        const images = database.collection("images")
        let imageDoc = {
            description,
            title,
            name,
            url,
            user: res.locals.userId,
            tags,
        }
        await images.insertOne(imageDoc)
        res.status(200).send(`Image Saved`)
    } catch (err) {
        console.dir(err)
        res.status(400).send(`Could not save image  ${err}`)
    } finally {
        await client.close()
    }
})

export default imageRouter
