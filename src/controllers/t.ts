import { Request, Response, NextFunction } from "express"
import { catchAsync } from "../utils/catchAsync"
import orderModel from "../models/order.model"

const now = new Date()
const startDate = new Date(now.getFullYear(), now.getMonth(), 1) // First day of the current month
const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1)
class Dashboard {
	getOrdersOfTheMonth = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				// {
				// 	$match: {
				// 		createdAt: { $gte: startDate, $lt: endDate },
				// 	},
				// },
				{
					$group: {
						_id: { $month: "$createdAt" }, // Grouping all documents together
						totalOrders: { $sum: 1 }, // Count the number of orders
						totalAmount: { $sum: "$totalAmount" }, // Sum the totalAmount field
					},
				},
			])
			res.status(200).json({
				status: "Success",
				data,
			})
		}
	)

	getOrdersOfTheBranch = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const data = await orderModel.aggregate([
				// {
				// 	$match: {
				// 		createdAt: { $gte: startDate, $lt: endDate },
				// 	},
				// },
				{
					$group: {
						_id: "$restaurant", // Grouping all documents together
						totalOrders: { $sum: 1 }, // Count the number of orders
						totalAmount: { $sum: "$totalAmount" }, // Sum the totalAmount field
					},
				},
				{
					$lookup: {
						from: "restaurants", // The collection with restaurant details
						localField: "_id", // Field from the orders collection
						foreignField: "_id", // Field from the restaurants collection
						as: "restaurantDetails", // Output array field
					},
				},
				{
					$unwind: "$restaurantDetails", // Unwind the array to get the restaurant details
				},
				{
					$project: {
						branch: "$restaurantDetails.area", // Assuming restaurantDetails has a name field
						totalOrders: 1,
						totalAmount: 1,
					},
				},
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
						month: { $month: "$createdAt" },
					},
				},
				// Step 3: Group by month and branch
				{
					$group: {
						_id: { branch: "$restaurant", month: "$month" },
						totalOrders: { $sum: 1 },
						totalAmount: { $sum: "$totalAmount" },
					},
				},
                {
                    $lookup: {
                        from: "restaurants", // The collection with restaurant details
                        localField: "_id.restaurant", // Field from the orders collection
                        foreignField: "_id", // Field from the restaurants collection
                        as: "restaurantDetails", // Output array field
                    },
                },
                {
                    $unwind: "$restaurantDetails", // Unwind the array to get the restaurant details
                },
				// Step 4: Group by branch to aggregate monthly data into an array
				{
					$group: {
						_id: "$restaurantDetails.area",
						monthlyData: {
							$push: {
								date: "$_id.month",
								totalOrders: "$totalOrders",
								totalAmount: "$totalAmount",
							},
						},
					},
				},
				// Step 5: Project the final structure
				{
					$project: {
						_id: 0,
						branch: "$_id",
						monthlyData: "$monthlyData",
					},
				},
				// Optional: Sort by branch name if needed
				{
					$sort: { branch: 1 },
				},
			])

			res.json({
				data,
			})
		}
	)

	getBranchedPercentage = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			// Run the aggregation pipeline
			const result = await orderModel.aggregate([
				// Step 1: Group by branch to calculate total orders and total amount for each branch
				{
					$group: {
						_id: "$restaurant", // Group by branch (restaurant)
						totalOrders: { $sum: 1 }, // Count total orders for each branch
						totalAmount: { $sum: "$totalAmount" }, // Sum total amount for each branch
					},
				},
				{
					$lookup: {
						from: "restaurants", // The collection with restaurant details
						localField: "_id", // Field from the orders collection
						foreignField: "_id", // Field from the restaurants collection
						as: "restaurantDetails", // Output array field
					},
				},
				{
					$unwind: "$restaurantDetails", // Unwind the array to get the restaurant details
				},
				// Step 2: Calculate total orders across all branches
				{
					$group: {
						_id: null, // No specific grouping here
						totalOrdersForAllBranches: { $sum: "$totalOrders" }, // Sum of all orders
						branches: {
							$push: {
								branch: "$restaurantDetails.area", // Branch name
								totalOrders: "$totalOrders",
								totalAmount: "$totalAmount",
							},
						},
					},
				},
				// Step 3: Unwind branches to calculate percentage
				{
					$unwind: "$branches",
				},
				// Step 4: Calculate percentage of each branch's orders relative to total orders
				{
					$project: {
						_id: 0, // Exclude _id
						branch: "$branches.branch",
						totalOrders: "$branches.totalOrders",
						totalAmount: "$branches.totalAmount",
						percentage: {
							$multiply: [
								{
									$divide: [
										"$branches.totalOrders",
										"$totalOrdersForAllBranches",
									],
								}, // Percentage calculation
								100,
							],
						},
					},
				},
				// Step 5: Sort by branch name (optional)
				{
					$sort: { branch: 1 },
				},
			])

			console.log(result)
		}
	)
}

export default new Dashboard()
