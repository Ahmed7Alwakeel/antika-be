export default interface IUser extends Document {
	id?:string
	name: string
	password: string
	passwordConfirm?: string
	email: string
	address: string
	mobile: string
	role: string
	isActive: boolean
	isVerified: boolean
	passwordResetToken?: string
	passwordResetExpires?: Date
    verifyToken?:String
	comparePassword(p1: string, p2: string): Promise<string>
	createPasswordResetToken(): string
}
