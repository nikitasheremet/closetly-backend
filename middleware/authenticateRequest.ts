import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import type { JwtPayload } from "jsonwebtoken"
import extractAuthorizationToken from "../helpers/extractAuthorizationToken"

interface DecodedAuthorizationToken extends JwtPayload {
    id: string
}

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
    const authorizationHeaderToken = extractAuthorizationToken(req)
    if (!authorizationHeaderToken) {
        res.status(403).json({ error: "No credentials sent!" })
    } else {
        try {
            const decoded = jwt.verify(
                JSON.parse(authorizationHeaderToken),
                process.env.JWT_SECRET
            ) as DecodedAuthorizationToken
            res.locals.userId = decoded.id
        } catch (err) {
            res.status(403).json({ error: "Credentials invalid" })
        }
    }
    next()
}

export default authenticateRequest
