import { Request } from "express"

const extractAuthorizationToken = (req: Request): string | undefined => {
    const authorizationHeader = req.headers.authorization
    if (!authorizationHeader) {
        return undefined
    }
    return authorizationHeader.split(" ")[1]
}

export default extractAuthorizationToken
