import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import User from "../models/user";

class UsersRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.get(
            '/',
            auth.protect,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const subjects = await User.find();
                    if (!subjects) {
                        return res.status(404).json({ message: "No Users found" });
                    }
                    return res.status(200).json(subjects)
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            }
        )

        this.router.get(
            '/teachers',
            auth.protect,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const subjects = await User.find({role: 'prof'});
                    if (!subjects) {
                        return res.status(404).json({ message: "No teachers found" });
                    }
                    return res.status(200).json(subjects)
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            }
        )

        this.router.get(
            '/students',
            auth.protect,
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const subjects = await User.find({role: 'etudiant'});
                    if (!subjects) {
                        return res.status(404).json({ message: "No students found" });
                    }
                    return res.status(200).json(subjects)
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            }
        )

        this.router.get(
            '/:_id',
            auth.protect,
            this.getUser,
            async (req: Request, res: any, next: NextFunction) => {
                res.json(res.user);
            }
        )
    }

    async getUser(req: Request, res: any, next: NextFunction) {
        let user;
        try {
            user = await User.findById(req.params._id);
            if (user == null) {
                return res.status(404).json({ message: "Cannot find User" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        res.user = user;
        next();
    }
}
export default new UsersRouter().router;