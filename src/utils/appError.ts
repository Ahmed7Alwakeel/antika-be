export default class AppError extends Error{
    message: string
	statusCode: number
	status: string
	errors?: any[] | undefined
	constructor(
		message: string,
		status: string = "FAIL",
		statusCode: number = 500,
		errors: any[] | undefined = undefined
	) {
		super()
		this.message = message
		this.status = status
		this.statusCode = statusCode
		this.errors = errors
	}

}
