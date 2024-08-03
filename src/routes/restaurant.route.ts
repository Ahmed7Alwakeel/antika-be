import { Router } from "express"
import uploadImage from "../utils/uploadImage"
import productController from "../controllers/product.controller"
import authController from "../controllers/auth.controller"
import productModel from "../models/product.model"
import restaurantController from "../controllers/restaurant.controller"

export const restaurantRouter = Router({ mergeParams: true })

restaurantRouter
	.route("/branch-within").get(restaurantController.getBranchesWithin)

restaurantRouter
	.route("/")
	.post(
		authController.protect,
		authController.permittedTo("admin"),
		restaurantController.createOne
	)
	.get(restaurantController.getAll)


restaurantRouter
	.route("/:id")
	.get(restaurantController.getOne)
	.delete(
		authController.protect,
		authController.permittedTo("admin"),
		restaurantController.deleteOne
	)
	.patch(
		authController.protect,
		authController.permittedTo("admin"),
		restaurantController.updateOne
	)
