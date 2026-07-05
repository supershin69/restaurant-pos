import { Router } from "express";
import { authController } from "./auth.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { loginSchema, registerSchema } from "./auth.schema.ts";

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export { router as authRoutes };