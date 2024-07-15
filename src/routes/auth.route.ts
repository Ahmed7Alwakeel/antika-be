import { Router } from "express";
import authController from "../controllers/auth.controller";
import verificationController from "../controllers/verification.controller";

export const authRouter=Router()
authRouter.route("/signup").post(authController.signup,verificationController.sendVerifyEmail)
authRouter.route("/login").post(authController.login)
authRouter.route("/forget-password").post(authController.forgetPassword)
authRouter.route("/reset-password/:resetToken").post(authController.resetPassword)
authRouter.route("/change-password").post(authController.protect,authController.changePassword)
authRouter.route("/logout").post(authController.protect,authController.logout)
authRouter.route("/send/verify_email").post(verificationController.sendVerifyEmail)
authRouter.route("/send/email/verify/:token").get(verificationController.verifyEmail)