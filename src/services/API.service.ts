import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import AppError from "../utils/appError"
import fs from "fs"
import path from "path"
import categoryModel from "../models/category.model"
import productModel from "../models/product.model"
import APIFiltration from "../utils/apiFiltration"
import restaurantModel from "../models/Restaurant.model"
import mongoose from "mongoose"

class API {
	deleteImageById = (pathName: string, folderName: string) => {
		const directoryPath = path.join(
			__dirname,
			`../../src/public/images/${folderName}`
		)
		fs.readdir(directoryPath, (err, files) => {
			files.forEach((file) => {
				if (file.includes(pathName)) {
					const filePath = path.join(directoryPath, file)
					// Delete the file
					fs.unlink(filePath, (err) => {})
				}
			})
		})
	}

	renameImage = (oldPath: string, newPath: string) => {
		fs.rename(oldPath, newPath, () => {})
	}

	createOne = (Model: any) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			if (Model == productModel) {
				if (req.body.category) {
					const category = await categoryModel.findById(req.body.category)
					if (!category)
						return next(
							new AppError("No category found with that ID", "FAIL", 404)
						)
				}
			}
			if (req.params.categoryId) req.body.category = req.params.categoryId
			const data = await Model.create(
				Model == productModel ? [...req.body] : { ...req.body }
			)

			if (Model == productModel || Model == categoryModel) {
				let pathName = `src/public/images/${
					Model == productModel ? "product" : "category"
				}`
				Model == categoryModel &&
					this.renameImage(
						path.join(pathName, data.bannerImage.name),
						path.join(pathName, `${data._id}-banner.jpeg`)
					)
				this.renameImage(
					path.join(pathName, data.cardImage.name),
					path.join(pathName, `${data._id}-card.jpeg`)
				)
				data.cardImage.name = `${data._id}-card.jpeg`
				if (Model == categoryModel)
					data.bannerImage.name = `${data._id}-banner.jpeg`
				await data.save({ validateBeforeSave: false })
			}

			res.status(201).json({
				status: "Success",
				data: { data },
			})
		})

	getAll = (Model: any) =>
		catchAsync(async (req: Request, res: Response) => {
			let filter = {}
			if (req.params.categoryId) filter = { category: req.params.categoryId }
			const apiFiltration = new APIFiltration(Model.find(filter), req.query)
				.filter()
				.sort()
				.paginate()

			let data = await apiFiltration.query

			const metaData = {
				page: apiFiltration.metaData().page,
				limit: apiFiltration.metaData().limit,
				no_of_pages:
					Math.floor(
						(await Model.countDocuments()) / apiFiltration.metaData().limit
					) || 1,
				results: data.length,
			}

			res.status(200).json({
				status: "Success",
				data: { data },
				metaData,
			})
		})

	getOne = (Model: any, populateOptions?: string, select?: string) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			let query = Model.findById(req.params.id)

			//populate for products that has parent ref of Category
			if (populateOptions)
				query = query.populate(populateOptions).select(select)
			const data = await query
			if (!data) {
				return next(new AppError("No data found with that ID", "FAIL", 404))
			}
			res.status(200).json({
				status: "Success",
				data: { data },
			})
		})

	deleteOne = (Model: any, folderName: string = "") =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const item = await Model.findById(req.params.id)
			if (!item) {
				return next(new AppError("No data found with that ID", "FAIL", 404))
			}

			if (item.cardImage) {
				this.deleteImageById(req.params.id, folderName)
			}
			if (Model == categoryModel) {
				await productModel.updateMany(
					{
						category: item.id,
					},
					{ $set: { category: null } }
				)
			}
			await Model.findByIdAndDelete(req.params.id)
			res.status(200).json({
				status: "Success",
			})
		})

	deleteMany = (Model: any, folderName: string = "") =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const body = req.body
			for (let item of body) {
				const data = await Model.findById(item)
				if (!data)
					return next(new AppError("No data found with that ID", "FAIL", 404))
			}
			for (let item of body) {
				this.deleteImageById(item, folderName)
			}
			await Model.deleteMany({ _id: { $in: body } })

			res.status(200).json({
				status: "Success",
			})
		})

	updateOne = (Model: any) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
				new: true,
				projection: { __v: 0 },
				runValidators: true,
			})
			if (!data) {
				return next(new AppError("No data found with that ID", "FAIL", 404))
			}
			res.status(200).json({
				status: "Success",
				data: { data },
			})
		})

	updateMany = (Model: any) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const body = req.body
			let data = []

			for (const item of body) {
				const update = { ...item.data }

				// Perform the update operation
				const result = await restaurantModel.findByIdAndUpdate(
					item.id,
					update,
					{
						new: true,
						projection: { __v: 0 },
						runValidators: true,
					}
				)
				if (!result) {
					return next(new AppError("No data found with that ID", "FAIL", 404))
				}
				data.push(result)
			}
			// const data = await Model.updateMany({}, req.body, {
			// 	new: true,
			// 	projection: { __v: 0 },
			// 	runValidators: true,
			// })
			// if (!data) {
			// 	return next(new AppError("No data found with that ID", "FAIL", 404))
			// }
			res.status(200).json({
				status: "Success",
				data,
			})
		})
}
export default new API()
