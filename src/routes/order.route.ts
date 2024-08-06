import { Router } from "express"
import orderController from "../controllers/order.controller"
import authController from "../controllers/auth.controller"

export const orderRouter = Router()

orderRouter.post("/checkout/webhook", orderController.stripeWebhook)
orderRouter.use(authController.protect)
orderRouter
	.route("/checkout/create-checkout-session")
	.post(orderController.createCheckoutSession)

orderRouter.get("/my-orders", orderController.getUserOrders)
orderRouter.get("/:id", orderController.getUserOne)
orderRouter.use(authController.permittedTo("admin"))
orderRouter.get("/", orderController.getAll)
orderRouter
	.route("/:id")
	.get(orderController.getOne)
	.patch(orderController.updateOne)
