import mongoose from "mongoose"
import { IRestaurant } from "../interfaces/Restaurant.interface"

const restaurantSchema = new mongoose.Schema<IRestaurant>({
	name: { type: String, default: "Antika" },
	city: { type: String, required: true },
	area: { type: String, required: true },
	deliveryPrice: { type: Number, required: true },
	estimatedDeliveryTime: { type: Number, required: true },
	created_at: { type: Date, required: true, default: new Date() },
	published: {
		type: Boolean,
		default: false,
	},
})

const restaurantModel = mongoose.model("Restaurant", restaurantSchema)
export default restaurantModel
