require("dotenv").config()
import * as express from "express"
import { MongoClient, ObjectId } from "mongodb"
import authenticateRequest from "../middleware/authenticateRequest"
import * as multer from "multer"
import { v2 as cloudinary } from "cloudinary"

// Return "https" URLs by setting secure: true
cloudinary.config({
    secure: true,
})

const imageRouter = express.Router()
const upload = multer({ dest: ".temp" })
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

imageRouter.post(
    "/saveImage",
    authenticateRequest,
    upload.single("closet-image"),
    async (req, res) => {
        const { description, title, tags } = req.body

        try {
            const cloudinaryImageUploadOptions = {
                use_filename: true,
                unique_filename: false,
                overwrite: true,
            }
            // Upload the image
            const { url, public_id } = await cloudinary.uploader.upload(
                req.file.path,
                cloudinaryImageUploadOptions
            )
            const client = new MongoClient(uri)
            try {
                // Save image to db
                await client.connect()
                const database = client.db("closetly")
                const images = database.collection("images")
                let imageDocStructure = {
                    description,
                    title,
                    name: public_id,
                    url,
                    user: res.locals.userId,
                    tags: JSON.parse(tags),
                }
                await images.insertOne(imageDocStructure)

                res.status(200).send({ ...imageDocStructure })
            } catch (err) {
                const errorMessage = `Unable to save file to db. Error is: ${err}`
                console.log(errorMessage)
                res.status(500).send(errorMessage)
            } finally {
                await client.close()
            }
        } catch (err) {
            const errorMessage = `unable to upload image, fieldname: ${req.file.fieldname}, originalname: ${req.file.originalname}. Error is: ${err}`
            console.log(errorMessage)
            res.status(500).send(errorMessage)
        }
    }
)

export default imageRouter
