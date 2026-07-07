import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.ts";
import { foodController } from "./food.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { createFoodSchema } from "./food.schema.ts";
import { restrictTo } from "../../middlewares/auth.middleware.ts";


const router = Router();

router.get('/', foodController.fetchAllFoods);
router.post('/upload', upload.single('image'), validate(createFoodSchema), restrictTo('ADMIN'), foodController.uploadFood);

export { router as foodRoutes };