import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken"
import config from "../environments"
import user from "../models/user"
import { ErrorResponse } from "../utils/errorResponse"

class Auth {
    /**
     * middleware to protect routes
     * a query should have an authorization token to access protected routes
     */
    protect = async (req: any, res: Response, next: NextFunction) => {
        let token
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            // set token from Bearer token
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) {
            return next(
                new ErrorResponse("Non autorisé à accéder à cette route", 401)
            )
        }

        try {
            const decoded = jwt.verify(token, config.ACCESS_TOKEN_SECRET)
            // add user information to request object
            req.user = await user.findById(decoded._id)
            next()
        } catch (error) {
            return next(
                new ErrorResponse("Invalid token", 401)
            )
        }
    }


    /**
     * middleware to protext routes with roles
     * user should have the specified role to access the route
     */
    authorize = (...roles) => {
        return (req: any, res: Response, next: NextFunction) => {
            if (!roles.includes(req.user.role)) {
                return next(
                    new ErrorResponse(
                        `Le rôle utilisateur ${req.user.role} n'a pas accès à cette route`,
                        403
                    )
                )
            }
            next()
        }
    }
}

const auth = new Auth()
export {
    auth
}
