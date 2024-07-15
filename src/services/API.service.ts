import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import AppError from "../utils/appError"
import fs from "fs"
import path from "path"
import categoryModel from "../models/category.model"
import productModel from "../models/product.model"
import APIFiltration from "../utils/apiFiltration"

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
      console.log(Model,req.body)
			const data = await Model.create({ ...req.body })
			res.status(201).json({
				status: "Success",
				data: { data },
			})
		})

	getAll = (Model: any) =>
		catchAsync(async (req: Request, res: Response) => {
            let filter = {}
            if (req.params.categoryId) filter={ category: req.params.categoryId }
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
                        (await Model.countDocuments()) /
                            apiFiltration.metaData().limit
                    ) || 1,
                results: data.length,
            }
			
			res.status(200).json({
				status: "Success",
				data: { data },
                metaData
			})
		})

	getOne = (Model: any, populateOptions?: string, select?: string) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			let query = Model.findById(req.params.id)
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

	deleteOne = (Model: any, folderName: string) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const item = await Model.findById(req.params.id)
			if (!item) {
				return next(new AppError("No data found with that ID", "FAIL", 404))
			}

			if (item.cardImage) {
				this.deleteImageById(item.cardImage.name, folderName)
				this.deleteImageById(item.bannerImage.name, folderName)
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

	updateOne = (Model: any) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			const data = await Model.findOneAndUpdate(
				{ _id: req.params.id },
				req.body,
				{
					new: true,
					projection: { __v: 0 },
					runValidators: true,
				}
			)
			if (!data) {
				return next(new AppError("No data found with that ID", "FAIL", 404))
			}
			res.status(200).json({
				status: "Success",
				data: { data },
			})
		})
}
export default new API()
