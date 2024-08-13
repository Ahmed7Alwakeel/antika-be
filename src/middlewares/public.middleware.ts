import { app } from "../app"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import cors from "cors"
import mongoSanitize from "express-mongo-sanitize"
import path from "path"
import compression from "compression"

// CORS configuration
app.use(cors({}))
app.set("trust proxy", 1)
app.set("views", path.join(__dirname, "views"))
app.set("views", "./src.views")
app.set("view engine", "pug")
app.use(
	helmet({
		hsts: false,
		crossOriginResourcePolicy: false, //for images at frontend
	})
)
//compress all responses
app.use(compression())
const limiter = rateLimit({
	max: 1000,
	windowMs: 60 * 60 * 1000,
	message: "Too many requests, please try again in an hour!",
})
app.use("/api", limiter)
app.use(express.json())
app.use(mongoSanitize())
app.use(express.static("src/public"))
