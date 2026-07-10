import { Router } from "express";
import { validate } from "../../middlewares/validate.middleware.ts";
import { restrictTo } from "../../middlewares/auth.middleware.ts";
import { userController } from "./user.controller.ts";
import { registerSchema } from "../auth/auth.schema.ts";
import { updateUserSchema } from "./user.schema.ts";

const router = Router();

// Static Routes
router.get('/', restrictTo('ADMIN'), userController.fetchUsers);
router.post('/create', validate(registerSchema), restrictTo('ADMIN'), userController.createUser);

// Dynamic Routes
router.get('/:id', userController.fetchSingleUser);
router.put('/:id/edit', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', restrictTo('ADMIN'), userController.deleteUsers);

export { router as userRoutes };