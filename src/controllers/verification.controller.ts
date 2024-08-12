import express from "express"
import speakeasy from "speakeasy"
import qrcode from "qrcode"
import { catchAsync } from "../utils/catchAsync"
import AppError from "../utils/appError"
import crypto from "crypto"
import userModel from "../models/user.model"
import { Email } from "../utils/sendEmail"

class Verify {
	sendVerifyEmail = catchAsync(
		async (
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			const { email } = req.body
			if (!email) {
				return next()
			}

			const user = await userModel.findOne({
				email: email,
			})

			if (user) {
				if (!user.isVerified) {
					const token = crypto.randomBytes(32).toString("hex")
					user.verifyToken = crypto
						.createHash("sha256")
						.update(token)
						.digest("hex")

					await user.save({ validateBeforeSave: false })

					let verifyUrl = `${req.protocol}://${req.get(
						"host"
					)}/api/v1/auth/send/email/verify/${token}`

					const email = new Email(
						{ email: req.body.email, name: req.body.name },
						verifyUrl
					)
					const x = await email.sendVerifyEmail()

					res.status(200).json({
						status: "success",
						message: "Verification email sent successfully",
					})
				} else {
					res.status(200).json({
						status: "success",
						message: "Email already verified",
					})
				}
			} else {
				return next(new AppError("not user", "FAIL", 404))
			}
		}
	)

	verifyEmail = catchAsync(
		async (
			req: express.Request,
			res: express.Response,
			next: express.NextFunction
		) => {
			const hashedToken = crypto
				.createHash("sha256")
				.update(req.params.token)
				.digest("hex")

			const user = await userModel.findOne({
				verifyToken: hashedToken,
			})

			if (user) {
				user.isVerified = true
				user.verifyToken = undefined

				await user.save({ validateBeforeSave: false })
				res.redirect(`https://antika-website.onrender.com/login?verified=true`)
				res.status(200).json({
					status: "success",
					message: "Email verified successfully",
				})
			}
			res.redirect(`https://antika-website.onrender.com/login?verified=false`)
		}
	)
}

export default new Verify()
