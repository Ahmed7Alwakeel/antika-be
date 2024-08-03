import express from "express"
import dotenv from "dotenv"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import cors from "cors";
import mongoSanitize from "express-mongo-sanitize"
import hpp from "hpp"
import { categoryRouter } from "./routes/category.route"
import AppError from "./utils/appError"
import errorController from "./controllers/error.controller"
import { productRouter } from "./routes/product.route"
import { authRouter } from "./routes/auth.route"
import { userRouter } from "./routes/user.route"
import { favRouter } from "./routes/favorite.route"
import { restaurantRouter } from "./routes/restaurant.route";

dotenv.config()
export const app = express()

// CORS configuration
app.use(cors());


app.use(helmet({
	hsts: false,
	crossOriginResourcePolicy: false, //for images at frontend
}))
const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests, please try again in an hour!",
})
app.use("/api", limiter)
app.use(express.json())
app.use(mongoSanitize())
app.use(express.static('src/public'));
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/favorite", favRouter)
app.use("/api/v1/restaurant", restaurantRouter)
app.all(
	"*",
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		next(new AppError("Not Found", "FAIL", 404))
	}
)

//when pass that four params express knows that this entire function is an error handling middleware
app.use(errorController)
