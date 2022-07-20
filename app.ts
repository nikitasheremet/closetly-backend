import * as express from "express"
import * as bodyParser from "body-parser"
import * as cors from "cors"
import imageRouter from "./routes/image"
import userRouter from "./routes/user"

require("dotenv").config()
const app = express()

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use("/image", imageRouter)
app.use("/user", userRouter)

app.get("/", (req, res) => {
    res.send("Hello World!")
})

let port = Number(process.env.PORT)
if (!port) {
    port = 8000
}
app.listen(port, () => {
    console.log(`App listening on port: ${port}`)
})
