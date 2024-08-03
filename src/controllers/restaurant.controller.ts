import { Response, Request, NextFunction } from "express"
import { catchAsync } from "../utils/catchAsync"
import APIService from "../services/API.service"
import restaurantModel from "../models/Restaurant.model"

class Restaurant {
	createOne = APIService.createOne(restaurantModel)
	getAll = APIService.getAll(restaurantModel)
	getOne = APIService.getOne(restaurantModel)
	deleteOne = APIService.deleteOne(restaurantModel)
	updateOne = APIService.updateOne(restaurantModel)
}
export default new Restaurant()
