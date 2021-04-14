import { NextFunction, Request, Response, Router } from 'express';
import { auth } from '../middleware/authorization';
import users from "../models/user";
import { ErrorResponse } from '../utils/errorResponse';
import * as generator from "generate-password";
import * as jwt from "jsonwebtoken";
import config from "../environments";

class AuthenticationRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.post(
            '/register',
            async (req: Request, res: Response, next: NextFunction) => {

                const { name, email, password } = req.body;

                const userEmailExists = await users.findOne({ email });
                if (userEmailExists) {
                    return next(new ErrorResponse("Vous avez déjà un compte avec cet email", 400));
                }

                /*
                const password = generator.generate({
                    length: 12,
                    numbers: true,
                });
                */

                const user: any = await users.create({
                    name,
                    email,
                    password,
                }).then(data => {
                    res.status(200).json({
                        success: true,
                        message: "Votre compte a été créé avec succès"
                    })
                }).catch(err => {
                    console.log(err)
                    res.status(500).send(err)
                });
            }
        )

        this.router.post(
            '/login',
            async (req: Request, res: Response, next: NextFunction) => {

                const { email, password } = req.body;

                if (!email || !password) {
                    return next(new ErrorResponse("Veuillez inserer votre adresse email et mot de passe", 400));
                }

                const user: any = await users.findOne({ email }).select("+password");
                if (!user) {
                    return res.status(500).send("Adresse email ou mot de passe invalide");
                }

                const isMatch = await user.matchPassword(password);
                if (!isMatch) {
                    return res.status(500).send("Adresse email ou mot de passe invalide");
                }

                this.sendTokenResponse(user, 200, res);
            }
        )

        this.router.post(
            '/logout',
            async (req: Request, res: Response, next: NextFunction) => {
                res.status(200).json({
                    success: true,
                    message: "utilisateur déconnecté!",
                });
            }
        )

        this.router.post(
            '/refreshtoken',
            async (req: Request, res: Response, next: NextFunction) => {
                const currentRefreshToken = req.body.refreshToken;
                if (!currentRefreshToken) {
                    return next(new ErrorResponse("No refresh token found", 400));
                }

                const decoded = await jwt.decode(currentRefreshToken);
                const user: any = await users.findById(decoded._id).select("+password");

                const refreshSecret = `${config.REFRESH_TOKEN_SECRET}${user.password}`;
                await jwt.verify(currentRefreshToken, refreshSecret);

                this.sendTokenResponse(user, 200, res);
            }
        )
    }

    sendTokenResponse = (user: any, statusCode: number, res: Response) => {
        
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        const body = {
            _id: user._id,
            role: user.role,
            email: user.email,
        };

        res.status(statusCode).json({
            success: true,
            body,
            accessToken,
            refreshToken,
        });
    };
}
export default new AuthenticationRouter().router;