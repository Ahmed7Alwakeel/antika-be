import express from "express"
import "dotenv/config"
import { categoryRouter } from "./routes/category.route"
import AppError from "./utils/appError"
import errorController from "./controllers/error.controller"
import { productRouter } from "./routes/product.route"
import { authRouter } from "./routes/auth.route"
import { userRouter } from "./routes/user.route"
import { favRouter } from "./routes/favorite.route"
import { restaurantRouter } from "./routes/restaurant.route"
import { orderRouter } from "./routes/order.route"
import { dashboardRouter } from "./routes/dashboard.route"
export const app = express()
import "./middlewares/public.middleware"

// CORS configuration

app.use("/api/v1/order/checkout/webhook", express.raw({ type: "*/*" }))
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/product", productRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/favorite", favRouter)
app.use("/api/v1/restaurant", restaurantRouter)
app.use("/api/v1/order", orderRouter)
app.use("/api/v1/dashboard", dashboardRouter)
app.all(
	"*",
	(req: express.Request, res: express.Response, next: express.NextFunction) => {
		next(new AppError("Not Found", "FAIL", 404))
	}
)

//when pass that four params express knows that this entire function is an error handling middleware
app.use(errorController)
