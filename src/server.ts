import { app } from "./app"
import "./cron"
import mongoose from "mongoose"

mongoose
	.connect(process.env.MONGO_LOCAL_URL || "")
	.then(() => console.log("RunningDB"))
//to access .env file and read value inside it
const server = app.listen(process.env.PORT, () => console.log("RunningSERVER"))