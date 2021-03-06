import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import Assignment from "../models/assignment";
import Subject from "../models/subject";
import User from "../models/user";
import * as faker from "faker";

class AssignmentsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {

    this.router.post(
      '/',
      auth.protect,
      auth.authorize("prof"),
      async (req: Request, res: Response, next: NextFunction) => {

        const assignment = new Assignment({
          id: req.body.id,
          nom: req.body.nom,
          dateDeRendu: req.body.dateDeRendu,
          rendu: req.body.rendu,
          matiere: req.body.matiere,
          auteur: req.body.auteur,
          note: req.body.note,
          remarques: req.body.remarques
        });
        console.log("POST assignment reçu :");
        console.log(assignment);
        try {
          const newUser = await assignment.save();
          res.status(201).json({ newUser });
        } catch (err) {
          res.status(400).json({ message: err.message, error: err });
        }
      }
    )

    this.router.get(
      '/',
      auth.protect,
      auth.authorize("prof"),
      async (req: Request, res: Response, next: NextFunction) => {

        let renduQuery: any = {};
        if ((req as any).query.rendu == '1') renduQuery.rendu = true;
        if ((req as any).query.rendu == '0') renduQuery.rendu = false;
        if ((req as any).query.search) renduQuery.nom = { $regex: '.*' + (req as any).query.search + '.*' };

        (Assignment as any).paginate(renduQuery, {
          page: parseInt((req as any).query.page) || 1,
          limit: parseInt((req as any).query.limit) || 10,
          populate: [
            { path: 'matiere', model: Subject, populate: { path: 'teacher', model: User } }, { path: 'auteur', model: User }]
        }).then(results => {
          res.send(results);
        }).catch(err => {
          res.send(err);
        })
      }
    )

    this.router.get(
      '/student',
      auth.protect,
      async (req: Request, res: Response, next: NextFunction) => {

        let query: any = {};
        if ((req as any).query.rendu == '1') query.rendu = true;
        if ((req as any).query.rendu == '0') query.rendu = false;
        if ((req as any).query.search) query.nom = { $regex: '.*' + (req as any).query.search + '.*' };
        if ((req as any).user) query.auteur = (req as any).user._id;

        (Assignment as any).paginate(query, {
          page: parseInt((req as any).query.page) || 1,
          limit: parseInt((req as any).query.limit) || 10,
          populate: [
            { path: 'matiere', model: Subject, populate: { path: 'teacher', model: User } }, { path: 'auteur', model: User }]
        }).then(results => {
          res.send(results);
        }).catch(err => {
          res.send(err);
        })
      }
    )

    this.router.get(
      '/data',
      async (req: Request, res: Response, next: NextFunction) => {
        // await Assignment.updateMany({rendu: false}, {dateDeRendu: null})

        // let items = []
        // // STUDENTS
        // let students = await User.find({ role: 'etudiant' })

        // // ASSIGNMENTS
        // let subjectsIds = ['606d4d56d46cb401b45695e7', "606d4e28a795b11700e3cb8d", "606d4e56a795b11700e3cb8e", "606d4e89a795b11700e3cb8f", "606d4eada795b11700e3cb90"]
        // for (let index = 0; index < 550; index++) {
        //   let rendu = [true, false][Math.floor(Math.random() * 2)]

        //   let assignment = await Assignment.create({
        //     dateDeRendu: faker.date.between('2021-03-01', '2021-06-01'),
        //     nom: faker.lorem.word(),
        //     rendu: rendu,
        //     matiere: subjectsIds[Math.floor(Math.random() * subjectsIds.length)],
        //     auteur: students[Math.floor(Math.random() * students.length)]._id,
        //     note: rendu ? Math.floor(Math.random() * 20) : null,
        //     remarques: faker.lorem.paragraph(),
        //   })
        //   console.log(`${index} - ${assignment._id}`)
        // }

        res.status(200).json('ok')
      }
    )

    this.router.get(
      '/:_id',
      auth.protect,
      this.getAssignment,
      async (req: Request, res: any, next: NextFunction) => {
        res.json(res.assignment);
      }
    )

    this.router.put(
      '/:_id',
      auth.protect,
      auth.authorize("prof"),
      this.getAssignment,
      async (req: Request, res: any, next: NextFunction) => {

        console.log("UPDATE recu assignment : ", res.assignment._id);

        try {
          const updatedUser = await Assignment.findOneAndUpdate({ _id: res.assignment._id }, req.body);
          console.log("updatedUser", updatedUser);
          res.json(updatedUser);
        } catch (err) {
          res.status(400).json({ message: err.message });
        }
      }
    )

    this.router.delete(
      '/:_id',
      auth.protect,
      auth.authorize("prof"),
      async (req: Request, res: any, next: NextFunction) => {
        try {
          await Assignment.findOneAndRemove({ _id: req.params._id });
          res.json({ message: `assignment supprimé` });
        } catch (err) {
          res.status(500).json({ message: err.message });
        }
      }
    )
  }

  async getAssignment(req: Request, res: any, next: NextFunction) {
    let assignment;
    try {
      console.log('req.params._id', req.params._id)
      assignment = await Assignment.findById(req.params._id).populate({
        path: 'matiere',
        model: 'Subject',
        populate: {
          path: 'teacher',
          model: 'User'
        }
      }).populate('auteur');
      if (assignment == null) {
        return res.status(404).json({ message: "Cannot find Assignment" });
      }
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
    res.assignment = assignment;
    next();
  }
}
export default new AssignmentsRouter().router;