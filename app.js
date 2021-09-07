const express = require("express")
const bodyParser = require("body-parser")
var jwt = require("jsonwebtoken")
var cors = require("cors")
const imageRouter = require("./routes/image")
const userRouter = require("./routes/user")

require("dotenv").config()
const app = express()
// const port = 3000

app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.use(function (req, res, next) {
    if (req.path !== "/login") {
        const authorizationHeader = req.headers.authorization
        if (!req.headers.authorization) {
            return res.status(403).json({ error: "No credentials sent!" })
        } else {
            const clientToken = authorizationHeader.split(" ")[1]
            try {
                const decoded = jwt.verify(JSON.parse(clientToken), "secret")
                res.locals.userId = decoded.id
            } catch (err) {
                return res.status(403).json({ error: "Credentials invalid" })
            }
        }
    }
    next()
})

app.use("/image", imageRouter)
app.use("/user", userRouter)

app.get("/", (req, res) => {
    res.send("Hello World!")
})

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8000;
}
app.listen(port, () => {
    console.log(`App listening on port: ${port}`)
});
