import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.ts";
import { restrictTo } from "../../middlewares/auth.middleware.ts";
import { userController } from "./user.controller.ts";
import { registerSchema } from "../auth/auth.schema.ts";
import { updateUserSchema } from "./user.schema.ts";
import { upload } from "../../middlewares/upload.middleware.ts";

const router = Router();

// Static Routes
router.get('/', restrictTo('ADMIN'), userController.fetchUsers);
router.get('/me', userController.fetchMyself);
router.post('/create', validate(registerSchema), restrictTo('ADMIN'), userController.createUser);

// Dynamic Routes
router.get('/:id', restrictTo('ADMIN'), userController.fetchSingleUser);
router.put('/:id/edit', upload.single('image'), validate(updateUserSchema), userController.updateUser);
router.delete('/delete', restrictTo('ADMIN'), userController.deleteUsers);

export { router as userRoutes };