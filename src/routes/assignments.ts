import { Response, Request, NextFunction } from "express";
import { Router } from 'express';
import { auth } from "../middleware/authorization";
import Assignment from "../models/assignment";

class AssignementsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.routes();
  }

  routes() {
    /*
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
    */

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

    this.router.get(
      '/',
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
      auth.authorize("admin"),
      async (req: Request, res: Response, next: NextFunction) => {

        res.status(200).json({
          success: true,
          body: {}
        })
      }
    )

    this.router.put(
      '/:_id',
      auth.protect,
      auth.authorize("admin"),
      async (req: Request, res: Response, next: NextFunction) => {

        res.status(200).json({
          success: true,
          body: {}
        })
      }
    )

    this.router.delete(
      '/:_id',
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
export default new AssignementsRouter().router;