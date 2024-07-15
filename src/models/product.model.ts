import mongoose from "mongoose"
import IProduct from "../interfaces/product.interface"
import { Query } from "mongoose"
import slugify from "slugify"

const productSchema = new mongoose.Schema<IProduct>(
	{
		name: {
			type: String,
			unique: true,
			required: [true, "Category must have a name"],
		},
        quantity: {
			type: Number,
			required: [true, "Category must have a quantity"],
		},
		slug: {
			type: String,
			unique: true,
		},
		description: {
			type: String,
			required: [true, "Category must have a description"],
		},
		published: {
			type: Boolean,
			default: false,
		},
		bannerImage: {
			path: {
				type: String,
				required: [true, "Banner image path is required"],
			},
			name: {
				type: String,
				required: [true, "Banner image name is required"],
			},
		},
		cardImage: {
			path: {
				type: String,
				required: [true, "card image path is required"],
			},
			name: {
				type: String,
				required: [true, "card image name is required"],
			},
		},
		createdAt: {
			type: Date,
			default: Date.now(),
			select: false,
		},
		category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            default:null
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)

productSchema.virtual("favorites", {
	//name of the model
	ref: "Favorite",
	//name of the field in the other model
	foreignField: "product",
	//id of current model
	localField: "_id",
})

productSchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

productSchema.pre(/^find/, function (this: Query<IProduct, IProduct[]>, next) {
	this.select("-__v")
	next()
})

const productModel = mongoose.model("Product", productSchema)

export default productModel
