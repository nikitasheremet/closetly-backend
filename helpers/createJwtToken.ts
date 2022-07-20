import jwt from "jsonwebtoken"
import "dotenv/config"

interface customTokenCreationInterface {
    payload: {}
    expiryTime?: string
    secret?: string
}

/**
 * Create a signed JWT token.
 *
 * Parameters:
 *
 * - payload: Any object
 *
 * - expiryTime(optional) - in milliseconds | default: 30000000
 *
 * - secret(optional) - default: 'secret'
 *
 */

const createCustomToken = ({
    payload,
    expiryTime,
    secret,
}: customTokenCreationInterface): string => {
    return jwt.sign(payload, secret || process.env.JWT_SECRET, {
        expiresIn: expiryTime || 30000000,
    })
}

export default createCustomToken
