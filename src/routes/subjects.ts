import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import Subject from "../models/subject";
import user from "../models/user";

class SubjectsRouter {
    router: Router;

    constructor() {
        this.router = Router();
        this.routes();
    }

    routes() {
        this.router.get(
            '/',
            async (req: Request, res: Response, next: NextFunction) => {
                try {
                    const subjects = await Subject.find().populate({ path: 'teacher', model: user });
                    if (!subjects) {
                        return res.status(404).json({ message: "No Subjects found" });
                    }
                    return res.status(200).json(subjects)
                } catch (err) {
                    return res.status(500).json({ message: err.message });
                }
            }
        )

        this.router.get(
            '/:_id',
            this.getSubject,
            async (req: Request, res: any, next: NextFunction) => {
                res.json(res.subject);
            }
        )
    }

    async getSubject(req: Request, res: any, next: NextFunction) {
        let subject;
        try {
            console.log('req.params._id', req.params._id)
            subject = await Subject.findById(req.params._id).populate({ path: 'teacher', model: user });
            if (subject == null) {
                return res.status(404).json({ message: "Cannot find Subject" });
            }
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
        res.subject = subject;
        next();
    }
}
export default new SubjectsRouter().router;