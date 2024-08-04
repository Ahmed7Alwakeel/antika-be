import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../utils/catchAsync"
import userModel from "../models/user.model"
import jwt, { JwtPayload } from "jsonwebtoken"
import tokenModel from "../models/token.model"
import AppError from "../utils/appError"
import { Email } from "../utils/sendEmail"
import crypto from "crypto"
import IUser from "../interfaces/user.interface"

declare global {
	namespace Express {
		interface Request {
			currentUser: IUser // You can replace 'any' with the actual type of your user object
		}
	}
}
class Auth {
	createToken = async (id: string) => {
		const token = jwt.sign({ id }, process.env.JWT_SECRET as string)
		await tokenModel.findOneAndDelete({ user: id })
		await tokenModel.create({
			token,
			user: id,
		})
		return token
	}

	signup = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			await userModel.create({
				name: req.body.name,
				email: req.body.email,
				mobile: req.body.mobile,
				password: req.body.password,
				passwordConfirm: req.body.passwordConfirm,
				role: req.body.role,
			})
			const email = new Email(
				{ email: req.body.email, name: req.body.name },
				"https://www.udemy.com"
			)
			await email.sendWelcome()
			next()
		}
	)

	login = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const error = new AppError("Invalid credentials", "FAIL", 401)
			const { email, password } = req.body
			if (!email || !password) {
				return next(error)
			}
			let user = await userModel.findOne({ email }, { __v: 0 })
			if (
				!user ||
				!(await user?.comparePassword(password, user.password)) ||
				!user.isActive
			) {
				return next(error)
			}
			user = await userModel.findOne({ email }, { __v: 0, password: 0 })
			if (!user?.isVerified)
				return next(new AppError("Please verify your email", "FAIL", 401))
			const token = await this.createToken(user?.id)
			res.status(200).json({
				status: "Success",
				data: { user, token: token },
			})
		}
	)

	logout = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			if (req.currentUser)
				await tokenModel.deleteOne({ user: req.currentUser.id })
			res.status(200).json({
				status: "Success",
			})
		}
	)

	forgetPassword = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { email } = req.body
			if (!email) {
				return next(new AppError("Email is missing", "FAIL", 422))
			}

			const user = await userModel.findOne({ email }, { __v: 0 })

			if (!user) {
				return next(
					new AppError("There is no user with that email", "FAIL", 404)
				)
			}
			const resetToken = user?.createPasswordResetToken()
			try {
				await user.save({ validateBeforeSave: false })
				const resetURL = `${process.env.FRONTEND}/reset-password/${resetToken}`
				const email = new Email(
					{ email: user.email, name: user.name },
					resetURL
				)
				await email.sendReset()
				res.status(200).json({
					status: "success",
					message: "Reset link sent to email!",
				})
			} catch (err) {
				user.passwordResetToken = undefined
				user.passwordResetExpires = undefined
				await user.save({ validateBeforeSave: false })

				return next(
					new AppError(
						"There was an error sending the email. Try again later!",
						"FAIL",
						500
					)
				)
			}
		}
	)

	resetPassword = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { resetToken } = req.params
			if (!resetToken)
				return next(
					new AppError("Token is invalid or has expired", "FAIL", 400)
				)
			const hashedToken = crypto
				.createHash("sha256")
				.update(resetToken)
				.digest("hex")

			const user = await userModel.findOne({
				passwordResetToken: hashedToken,
				passwordResetExpires: { $gt: Date.now() },
			})
			if (!user)
				return next(
					new AppError("Token is invalid or has expired", "FAIL", 400)
				)
			const { password, passwordConfirm } = req.body
			if (!password || !passwordConfirm) {
				return next(new AppError("Passwords missing", "FAIL", 422))
			}
			user.password = password
			user.passwordConfirm = passwordConfirm
			user.passwordResetExpires = undefined
			user.passwordResetToken = undefined
			await user.save()
			res.status(200).json({
				status: "Success",
				message: "Password reset successfully",
			})
		}
	)

	changePassword = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { id } = req.currentUser
			const user = await userModel.findById(id).select("+password")
			if (!user || !id) return next(new AppError("User not found", "FAIL", 404))
			const { currentPassword, password, passwordConfirm } = req.body
			if (!currentPassword || !password || !passwordConfirm) {
				return next(new AppError("Passwords missing", "FAIL", 422))
			}
			if (!(await user?.comparePassword(currentPassword, user?.password))) {
				return next(
					new AppError("Your current password is wrong.", "FAIL", 401)
				)
			}
			user.password = password
			user.passwordConfirm = passwordConfirm
			await user.save()
			const token = await this.createToken(id)
			res.status(200).json({
				status: "Success",
				message: "Password changed successfully",
				token,
			})
		}
	)

	protect = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const { authorization } = req.headers
			const error = new AppError("Unauthenticated", "Fail", 401)
			const tokenExpires = new AppError("Token expires", "Fail", 401)
			let token

			if (authorization && authorization.startsWith("Bearer")) {
				token = authorization.split(" ")[1]
			}
			if (!token) return next(error)
			const decoded: JwtPayload | null = jwt.decode(token, { json: true })
			if (!decoded) return next(error)
			const userId = (decoded as { id: string }).id
			const gettingToken = await tokenModel.findOne({ user: userId })
			if (
				!gettingToken ||
				!(await gettingToken?.compareToken(token, gettingToken?.token))
			)
				return next(error)
			if (gettingToken?.tokenExpires < new Date()) {
				await tokenModel.deleteOne({ user: userId })
				return next(tokenExpires)
			}

			const user = await userModel.findOne(
				{ _id: userId },
				{ _v: 0, password: 0 }
			)
			if (!user) return next(error)
			req.currentUser = user

			next()
		}
	)

	permittedTo = (...roles: string[]) => {
		return (req: Request, res: Response, next: NextFunction) => {
			if (roles.includes(req.currentUser?.role)) {
				next()
			} else {
				return next(new AppError("Unauthorized", "FAIL", 403))
			}
		}
	}
}
export default new Auth()
