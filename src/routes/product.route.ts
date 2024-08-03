import { Router } from "express"
import uploadImage from "../utils/uploadImage"
import productController from "../controllers/product.controller"
import authController from "../controllers/auth.controller"
import productModel from "../models/product.model"

export const productRouter = Router({ mergeParams: true })

productRouter
	.route("/")
	.post(
		authController.protect,
		authController.permittedTo("admin"),
		productController.createOne
	)
	.get(productController.getAll)
	.delete(
		authController.protect,
		authController.permittedTo("admin"),
		productController.deleteMany
	)
productRouter
	.route("/:id")
	.get(productController.getOne)
	.patch(
		authController.protect,
		authController.permittedTo("admin"),
		productController.updateMany
	)
