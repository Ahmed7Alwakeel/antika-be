import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import userModel from "../models/user.model"
import AppError from "../utils/appError"
import APIService from '../services/API.service';

class User {
    
	profile = catchAsync(async (req: Request, res: Response) => {
		const user = await userModel.findById(req.currentUser.id, {
			password: 0,
			__v: 0,
		})
		res.status(200).json({
			status: "success",
			data: { user },
		})
	})

	editProfile = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			if (req.body.password || req.body.passwordConfirm || req.body.email) {
				return next(new AppError("Unauthorized", "FAIL", 403))
			}
			await userModel.findByIdAndUpdate({ _id: req.currentUser.id }, req.body)
			const user = await userModel
				.findById(req.currentUser.id)
				.select("-password -__v")
			res.status(200).json({
				status: "success",
				data: { user },
			})
		}
	)
	getAll = APIService.getAll(userModel);

}
export default new User()
