import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importRouter from "./import";
import productsRouter from "./products";

const router: IRouter = Router();

router.use(healthRouter);
router.use(importRouter);
router.use(productsRouter);

export default router;
