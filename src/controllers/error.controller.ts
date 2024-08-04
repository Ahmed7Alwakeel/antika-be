import express from "express"
import AppError from "../utils/appError"

class ErrorHandler {
	//like invalid object id mongo format
	handleCastErrorDB = (err: any) => {
		const message = `Invalid ${err.path} value.`
		return new AppError(message, "FAIL", 400)
	}

	//like unique inputs value
	handleDuplicateFieldsDB = (err: any) => {
		const keyName = Object.keys(err.keyPattern)[0]
		const message = `${keyName} already exits!`
		return new AppError(message, "FAIL", 400)
	}

	//like required inputs
	handleValidationErrorDB = (err: any) => {
		const errors = Object.values(err.errors).map((el: any) => ({
			[`${el.path}`]: el.message,
		}))
		const message = Object.values(err.errors)
			.map((el: any) => el.message)
			?.join(". ")
		return new AppError(message, "FAIL", 422, errors)
	}

	handleGeneralError = (message: string, code: number = 401) => {
		return new AppError(message, "FAIL", code)
	}

	sendError = (error: any, res: express.Response) => {
		res.status(error?.statusCode || 500).json({
			status: error?.status || "FAIL",
			status_code: error?.statusCode || 500,
			errors: error.errors || null,
			message: error.message,
		})
	}

	//when pass that four params express knows that this entire function is an error handling middleware
	globalError = (
		err: any,
		req: express.Request,
		res: express.Response,
		next: express.NextFunction
	) => {
		let error = { ...err }
		// console.log(err)
		if (err.name === "CastError") error = this.handleCastErrorDB(error)
		if (error.code === 11000) error = this.handleDuplicateFieldsDB(error)
		if (
			error.name === "ValidationError" ||
			(error.errors != null &&
				Object.values(error.errors).map((el: any) => el.message))
		)
			error = this.handleValidationErrorDB(error)
		if (error.name === "JsonWebTokenError")
			error = this.handleGeneralError("Invalid token.!")
		if (error.name === "TokenExpiredError")
			error = this.handleGeneralError("Token expired! Please log in again.")
		this.sendError(error, res)
	}
}
export default new ErrorHandler().globalError
