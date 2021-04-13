import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import Assignment from "../models/assignment";
import Subject from "../models/subject";
import User from "../models/user";

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
      async (req: Request, res: Response, next: NextFunction) => {

        (Assignment as any).paginate({}, {
          page: parseInt((req as any).query.page) || 1,
          limit: parseInt((req as any).query.limit) || 10,
          populate: [
            { path: 'matiere', model: Subject, populate: { path: 'teacher', model: User } }
            , { path: 'auteur', model: User }]
        }).then(results => {
          res.send(results);
        }).catch(err => {
          res.send(err);
        })

        // let start = 0;
        // let limit = 10000;
        // if(req.query.start) start = +req.query.start;
        // if(req.query.limit) limit = +req.query.limit;
        // const assignments = await Assignment.find().populate({ path: 'matiere', model: Subject }).skip(start).limit(limit);
        // res.status(200).json(assignments)
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

        console.log("UPDATE recu assignment : ");
        console.log(req.body);

        try {
          const updatedUser = await Assignment.findOneAndUpdate({ _id: res.assignment._id }, req.body);
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
          await Assignment.findOneAndRemove({_id: req.params._id});
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