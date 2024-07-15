import mongoose, { Query } from "mongoose"
import IFavorite from "../interfaces/favorite.interface"

const favoriteSchema = new mongoose.Schema<IFavorite>(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			default: null,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

// Ensure user can only favorite a product once
favoriteSchema.index({ product: 1, user: 1 }, { unique: true })

favoriteSchema.pre(
	/^find/,
	function (this: Query<IFavorite, IFavorite[]>, next) {
		this.select("-__v")
		next()
	}
)

const favoriteModel = mongoose.model("Favorite", favoriteSchema)

export default favoriteModel
