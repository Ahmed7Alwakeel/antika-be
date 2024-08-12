import { Router } from "express"
import dashboardController from "../controllers/dashboard.controller"
import authController from "../controllers/auth.controller"

export const dashboardRouter = Router()

dashboardRouter.use(authController.protect, authController.permittedTo("admin"))
dashboardRouter.get("/monthly-orders", dashboardController.getOrdersOfTheMonth)
dashboardRouter.get(
	"/products-orders",
	dashboardController.getProductsData
)
dashboardRouter.get(
	"/branches-orders-graph",
	dashboardController.getOrderBranchesGraph
)
dashboardRouter.get(
	"/branches-percentage",
	dashboardController.getBranchedPercentage
)
