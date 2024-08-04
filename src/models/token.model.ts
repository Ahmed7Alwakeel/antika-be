import mongoose from "mongoose"
import bcrypt from "bcrypt"
import IToken from "../interfaces/token.interface"

const tokenSchema = new mongoose.Schema<IToken>({
	token: {
		type: String,
		required: [true, "required"],
	},
	user: String,
	tokenExpires: {
		type: Date,
		default: new Date(Date.now() + 24 * 60 * 60 * 1000),
	},
})

tokenSchema.pre("save", async function (next) {
	this.token = await bcrypt.hash(this.token, 8)
	next()
})

tokenSchema.methods.compareToken = async (
	candidateToken: string,
	userToken: string
): Promise<boolean> => {
	return await bcrypt.compare(candidateToken, userToken)
}

const tokenModel = mongoose.model("Token", tokenSchema)

export default tokenModel
