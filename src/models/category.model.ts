import mongoose, { Query } from "mongoose"
import ICategory from "../interfaces/category.interface"
import slugify from "slugify"
import IProduct from "../interfaces/product.interface"

const categorySchema = new mongoose.Schema<ICategory>(
	{
		name: {
			type: String,
			unique: true,
			required: [true, "Category must have a name"],
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
            default:false
		},
        bannerImage: {
            path: {
                type: String,
                required: [true, "Banner image path is required"]
            },
            name: {
                type: String,
                required: [true, "Banner image name is required"]
            }
        },
        cardImage: {
            path: {
                type: String,
                required: [true, "card image path is required"]
            },
            name: {
                type: String,
                required: [true, "card image name is required"]
            }
        },
		createdAt: {
			type: Date,
			default: Date.now()
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
)


//for populate
categorySchema.virtual("products", {
	//name of the model
	ref: "Product",
	//name of the field in the other model
	foreignField: "category",
	//id of current model
	localField: "_id",
})

categorySchema.pre("save", function (next) {
	this.slug = slugify(this.name, { lower: true })
	next()
})

categorySchema.pre(/^find/, function (this: Query<ICategory, ICategory[]>, next) {
	this.select("-__v")
	next()
})

const categoryModel = mongoose.model("Category", categorySchema)

export default categoryModel
