import { Router } from "express";
import { orderController } from "./order.controller.ts";
import { validate } from "../../middlewares/validate.middleware.ts";
import { createOrderSchema, updateOrderSchema } from "./order.schema.ts";

const router = Router();

// static
router.get("/", orderController.fetchOrders);
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.delete("/delete", orderController.deleteOrders);
router.put("/restore", orderController.restoreOrders);

// dynamic
router.put("/:id/update", validate(updateOrderSchema), orderController.updateOrder);
router.get("/:id", orderController.viewOrderDetail);

export { router as orderRoutes }