import mongoose, { Query } from "mongoose"
import IUser from "../interfaces/user.interface"
import validator from "validator"
import bcrypt from "bcrypt"
import crypto from "crypto"

const userSchema = new mongoose.Schema<IUser>({
	name: {
		type: String,
		required: [true, "Name is missing"],
	},
	address: {
		type: String,
		required: [true, "address is missing"],
	},
	email: {
		type: String,
		unique: true,
		required: [true, "User email is required"],
		validate: [validator.isEmail, "Please enter valid email"],
		lowercase: true,
	},
	mobile: {
		type: String,
		required: [true, "Please provide a mobile"],
		minlength: 10,
	},
	role: {
		type: String,
		enum: ["user", "admin"],
		default: "user",
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 3,
	},
	passwordConfirm: {
		type: String,
		required: [true, "Please confirm your password"],
		validate: {
			validator: function (this: IUser, val: string) {
				const password = this.password
				return val === password
			},
			message: "Passwords are not the same!",
		},
	},
	isActive: {
		type: Boolean,
		default: true,
	},
	isVerified: {
		type: Boolean,
		default: false,
	},

	verifyToken: String,
	passwordResetToken: String,
	passwordResetExpires: Date,
})

userSchema.virtual("favorites", {
	//name of the model
	ref: "Favorite",
	//name of the field in the other model
	foreignField: "user",
	//id of current model
	localField: "_id",
})

userSchema.pre("save", async function (next) {
	if (!this.isModified("password")) return next()
	this.password = await bcrypt.hash(this.password, 8)
	this.passwordConfirm = undefined
	next()
})

userSchema.methods.comparePassword = async (
	candidatePassword: string,
	userPassword: string
): Promise<boolean> => {
	return await bcrypt.compare(candidatePassword, userPassword)
}
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString("hex")
	this.passwordResetToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex")
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000
	return resetToken
}
userSchema.pre(/^find/, function (this: Query<IUser, IUser[]>, next) {
	this.select("-__v")
	next()
})

const userModel = mongoose.model("User", userSchema)

export default userModel
