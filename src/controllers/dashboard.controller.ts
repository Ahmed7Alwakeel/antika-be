import { Request, Response, NextFunction } from "express"
import { catchAsync } from "../utils/catchAsync"
import orderModel from "../models/order.model"

const now = new Date()
const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)

class Dashboard {
	getOrdersOfTheMonth = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				{
					$group: {
						_id: { $month: "$createdAt" },
						totalOrders: { $sum: 1 },
						totalAmount: { $sum: "$totalAmount" },
					},
				},
			])
			res.status(200).json({
				status: "Success",
				data,
			})
		}
	)

	getProductsData = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				{
					$match: {
						createdAt: { $gte: startDate, $lt: endDate },
					},
				},
				{
					$unwind: "$cartItems"
				},
				{
					$group: {
						_id: "$cartItems.product",
						quantity: { $sum: "$cartItems.quantity" }
					}
				},
				{
					$lookup: {
						from: "products",
						localField: "_id",
						foreignField: "_id",
						as: "productDetails"
					}
				},
				{
					$unwind: {
						path: "$productDetails",
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$project: {
						_id: 0,
						quantity: 1,
						productName: "$productDetails.name"
					}
				},
				{ $sort: { quantity: -1 } }
			])
			
			res.status(200).json({
				status: "Success",
				data,
			})
		}
	)

	getOrderBranchesGraph = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				{
					$addFields: {
						month: { $month: "$createdAt" }
					}
				},
				{
					$group: {
						_id: { branch: "$restaurant", month: "$month" },
						totalOrders: { $sum: 1 },
						totalAmount: { $sum: "$totalAmount" }
					}
				},
				{
					$lookup: {
						from: "restaurants",
						localField: "_id.branch",
						foreignField: "_id",
						as: "restaurantDetails"
					}
				},
				{
					$unwind: {
						path: "$restaurantDetails",
						preserveNullAndEmptyArrays: true
					}
				},
				{
					$group: {
						_id: "$restaurantDetails.area",
						monthlyData: {
							$push: {
								date: "$_id.month",
								totalOrders: "$totalOrders",
								totalAmount: "$totalAmount"
							}
						}
					}
				},
				{
					$group: {
						_id: null,
						data: {
							$push: {
								k: "$_id",
								v: "$monthlyData"
							}
						}
					}
				},
				{
					$project: {
						_id: 0,
						data: {
							$arrayToObject: "$data"
						}
					}
				},
				{
					$project: {
						data: ["$data"]
					}
				}
			])

			res.json({
				data: [...data[0].data],
			})
		}
	)

	getBranchedPercentage = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				{
					$group: {
						_id: "$restaurant",
						totalOrders: { $sum: 1 },
						totalAmount: { $sum: "$totalAmount" },
					},
				},
				{
					$lookup: {
						from: "restaurants",
						localField: "_id",
						foreignField: "_id",
						as: "restaurantDetails"
					}
				},
				{
					$unwind: "$restaurantDetails"
				},
				{
					$group: {
						_id: null,
						totalOrdersForAllBranches: { $sum: "$totalOrders" },
						totalAmountForAllBranches: { $sum: "$totalAmount" },
						branches: {
							$push: {
								branch: "$restaurantDetails.area",
								totalOrders: "$totalOrders",
								totalAmount: "$totalAmount"
							}
						}
					}
				},
				{
					$unwind: "$branches"
				},
				{
					$project: {
						_id: 0,
						branch: "$branches.branch",
						totalOrders: "$branches.totalOrders",
						totalAmount: "$branches.totalAmount",
						ordersPercentage: {
							$multiply: [
								{
									$divide: [
										"$branches.totalOrders",
										"$totalOrdersForAllBranches"
									]
								},
								100
							]
						},
						amountPercentage: {
							$multiply: [
								{
									$divide: [
										"$branches.totalAmount",
										"$totalAmountForAllBranches"
									]
								},
								100
							]
						}
					}
				},
				{
					$sort: { branch: 1 }
				}
			])

			res.json({
				data,
			})
		}
	)
}

export default new Dashboard()
