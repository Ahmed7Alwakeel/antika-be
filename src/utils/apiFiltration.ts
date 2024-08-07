import mongoose from "mongoose"
import IProduct from "../interfaces/product.interface"
import ICategory from "../interfaces/category.interface"

export default class APIFiltration {
	query: mongoose.Query<
		Array<IProduct>,
		IProduct,
		Array<ICategory>,
		ICategory,
		{}
	>
	queryString = {}

	constructor(
		query: mongoose.Query<
			Array<IProduct>,
			IProduct,
			Array<ICategory>,
			ICategory,
			{}
		>,
		queryString: {}
	) {
		this.query = query
		this.queryString = queryString
	}

	//ex: tours?duration[gt]=5&duration[lt]=10
	filter() {
		const queryParams = { ...this.queryString }
		const excludedFields = ["page", "sort", "limit", "fields"]
		excludedFields.forEach((el) => delete (queryParams as any)[el])
		let queryStr = JSON.stringify(queryParams)
		queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
		this.query = this.query.find(JSON.parse(queryStr)) || []
		return this
	}

	//ex: sort=price
	sort() {
		if ((this.queryString as { sort: string }).sort) {
			const sortBy = ((this.queryString as { sort: string }).sort as string)
				.split(",")
				.join(" ")
			this.query = this.query.sort(`${sortBy}`)
			//sort(field field)
		} else {
			//from newest to oldest
			this.query = this.query.sort(`-createdAt`)
		}
		return this
	}

	//ex: tours?fields[gt]=name,duration
	// limitFields() {
	// 	if ((this.queryString as { fields: string }).fields) {
	// 		const fields = ((this.queryString as { fields: string }).fields as string)
	// 			.split(",")
	// 			.join(" ")
	// 		this.query = this.query.select(`${fields}`)
	// 	} else {
	// 		this.query = this.query.select("-__v")
	// 	}
	// 	return this
	// }

	metaData() {
		const page = (this.queryString as { page: string }).page
			? +(this.queryString as { page: string }).page * 1
			: 1
		const limit = (this.queryString as { limit: string }).limit
			? +(this.queryString as { limit: string }).limit * 1
			: 30
		const skip = (page - 1) * limit
		return {
			page,
			limit,
			skip,
		}
	}

	paginate() {
		this.query = this.query
			.skip(this.metaData().skip)
			.limit(this.metaData().limit)
		return this
	}
}
