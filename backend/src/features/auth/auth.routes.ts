import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "./auth.schema.ts";

const router = Router();
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);

export { router as authRoutes };