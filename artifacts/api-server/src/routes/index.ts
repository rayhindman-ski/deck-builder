import { Router, type IRouter } from "express";
import healthRouter from "./health";
import brandSourcesRouter from "./brand-sources";

const router: IRouter = Router();

router.use(healthRouter);
router.use(brandSourcesRouter);

export default router;
