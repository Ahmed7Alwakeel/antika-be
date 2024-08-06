import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
	restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
	deliveryDetails: {
		email: { type: String, required: true },
		name: { type: String, required: true },
		address: { type: String, required: true },
	},
	cartItems: [
		{
			name: { type: String, required: true },
			product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
			quantity: { type: Number, required: true },
		},
	],
	totalAmount: Number,
	status: {
		type: String,
		enum: ["placed", "paid", "inProgress", "outForDelivery", "delivered"],
	},
	createdAt: { type: Date, default: Date.now },
})


const orderModel = mongoose.model("Order", orderSchema)
export default orderModel
