import mongoose from "mongoose"
import userModel from "../models/user.model"

const seedAdmin = async () => {
	// Connect to the database
	await mongoose
		.connect("mongodb://localhost:27017/e-commerce")
		.then(() => console.log("RunningDB"))
	const admin = await userModel.findOne({ role: "admin" })
	if (!admin) {
		const adminCredentials = {
			name: "Admin",
			password: "123",
			role: "admin",
			passwordConfirm: "123",
			isActive: true,
			isVerified: true,
			mobile: "01062551428",
			email: "admin@admin.com",
			// Add other fields as needed
		}
		const adminUser = await userModel.create(adminCredentials)
	}
	await mongoose.disconnect()
}

seedAdmin()
	.then(() => {
		console.log("Admin seeding completed")
		process.exit(0)
	})
	.catch((err) => {
		console.error("Error seeding admin:", err)
		process.exit(1)
	})
