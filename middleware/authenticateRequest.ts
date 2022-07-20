import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

/**
 * Middleware which checks to see if a JWT token was passed in via authorization headers
 * and wether it is a valid token
 *
 * @param req
 * @param res
 * @param next
 * @returns void
 */

const authenticateRequest = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const authorizationHeader = req.headers.authorization
    if (!req.headers.authorization) {
        res.status(403).json({ error: "No credentials sent!" })
    } else {
        console.log(authorizationHeader.split(" "))
        const clientToken = authorizationHeader.split(" ")[1]
        try {
            const decoded = jwt.verify(
                JSON.parse(clientToken),
                process.env.JWT_SECRET
            )
            res.locals.userId = decoded.id
        } catch (err) {
            res.status(403).json({ error: "Credentials invalid" })
        }
    }
    next()
}

export default authenticateRequest
