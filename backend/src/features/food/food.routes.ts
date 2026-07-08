import { Router } from "express";
import { upload } from "../../middlewares/upload.middleware.ts";
import { foodController } from "./food.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { createFoodSchema } from "./food.schema.ts";
import { restrictTo } from "../../middlewares/auth.middleware.ts";


const router = Router();

// Strict Routes
router.get('/', foodController.fetchAllFoods);
router.get('/deleted', foodController.fetchDeletedFoods);
router.post('/upload', upload.single('image'), validate(createFoodSchema), restrictTo('ADMIN'), foodController.uploadFood);
router.delete('/bulk/delete', restrictTo('ADMIN'), foodController.bulkSoftDeleteFoods);
router.put('/bulk/restore', restrictTo('ADMIN'), foodController.bulkRestoreFood);

// Dynamic Routes
router.delete('/:id/delete', restrictTo('ADMIN'), foodController.softDeleteFood);
router.put('/:id/update', upload.single('image'), validate(createFoodSchema), restrictTo('ADMIN'), foodController.updateFood);



export { router as foodRoutes };