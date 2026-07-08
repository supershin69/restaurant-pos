import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.ts";
import { createTableSchema } from "./table.schema.ts";
import { restrictTo } from "../../middlewares/auth.middleware.ts";
import { tableController } from "./table.controller.ts";

const router = Router();

router.post('/', validate(createTableSchema), restrictTo('ADMIN'), tableController.createTable);
router.get('/', tableController.fetchTables);
router.delete('/', restrictTo('ADMIN'), tableController.deleteTables);

export { router as tableRoutes }