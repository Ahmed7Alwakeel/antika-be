import APIService from "../services/API.service"
import restaurantModel from "../models/restaurant.model"
import AppError from "../utils/appError"
import express from "express"
import { catchAsync } from "../utils/catchAsync"

class Restaurant {
	createOne = APIService.createOne(restaurantModel)
	getAll = APIService.getAll(restaurantModel)
	getOne = APIService.getOne(restaurantModel)
	deleteOne = APIService.deleteOne(restaurantModel)
	updateOne = APIService.updateOne(restaurantModel)

	 getBranchesWithin = catchAsync(
		async (
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			// Distance in km
			const { center } = req.query;
			if (!center) {
				return next(new AppError("User coordinates required", "FAIL", 422));
			}
	
			// Split center coordinates; expects "lat,lng"
			const [lng, lat] = (center as string)?.split(",");
			if (!lat || !lng) {
				return next(new AppError("User coordinates required", "FAIL", 422));
			}
	
			// Convert latitude and longitude to numbers
			const longitude = parseFloat(lng.trim());
			const latitude = parseFloat(lat.trim());
	
			// Radius in radians
			const radius = 22 / 6378.1; // 20km converted to radians
	
			// Perform the geospatial query
			const data = await restaurantModel.find({
				startLocation: {
					$geoWithin: {
						$centerSphere: [[longitude, latitude], radius],
					},
				},
			});
	
			res.status(200).json({
				status: "success",
				results: data.length,
				data,
			});
		}
	);
	
	// Example URL: /restaurant/branch-within?center=30.125186438850147,31.348034561046358
	
	
}
export default new Restaurant()
