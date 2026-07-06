import { Router, type IRouter } from "express";
import healthRouter from "./health";
import importRouter from "./import";
import productsRouter from "./products";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Daily Finds PK API" });
});

router.use(healthRouter);
router.use(importRouter);
router.use(productsRouter);

export default router;
