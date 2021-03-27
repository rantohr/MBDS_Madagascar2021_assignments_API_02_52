import { NextFunction, Request, Response, Router } from 'express';
import { auth } from '../middleware/authorization';

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

                res.status(200).json({
                    success: true,
                    body: {}
                })
            }
        )

        this.router.post(
            '/login',
            async (req: Request, res: Response, next: NextFunction) => {

                res.status(200).json({
                    success: true,
                    body: {}
                })
            }
        )

        this.router.post(
            '/logout',
            async (req: Request, res: Response, next: NextFunction) => {

                res.status(200).json({
                    success: true,
                    body: {}
                })
            }
        )

        this.router.post(
            '/refreshtoken',
            async (req: Request, res: Response, next: NextFunction) => {

                res.status(200).json({
                    success: true,
                    body: {}
                })
            }
        )

        this.router.post(
            '/',
            auth.protect,
            auth.authorize("admin"),
            async (req: Request, res: Response, next: NextFunction) => {

                res.status(200).json({
                    success: true,
                    body: {}
                })
            }
        )
    }
}
export default new AuthenticationRouter().router;