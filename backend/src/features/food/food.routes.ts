import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.ts";
import { foodController } from "./food.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { createFoodSchema } from "./food.schema.ts";


const router = Router();

router.post('/upload', upload.single('image'), validate(createFoodSchema), foodController.uploadFood);

export { router as foodRoutes };