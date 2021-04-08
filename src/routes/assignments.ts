import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import Assignment from "../models/assignment";

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
      async (req: Request, res: Response, next: NextFunction) => {

        const aggregateQuery = Assignment.aggregate();

        (Assignment as any).aggregatePaginate(
          aggregateQuery,
          {
            page: parseInt((req as any).query.page) || 1,
            limit: parseInt((req as any).query.limit) || 10,
          },
          (err, assignments) => {
            if (err) {
              res.send(err);
            }
            res.send(assignments);
          }
        );
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
          const updatedUser = await res.assignment.set(req.body);
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
      this.getAssignment,
      async (req: Request, res: any, next: NextFunction) => {
        try {
          await res.assignment.deleteOne();
          res.json({ message: `${res.assignment.nom} deleted` });
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
      assignment = await Assignment.findById(req.params._id);
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