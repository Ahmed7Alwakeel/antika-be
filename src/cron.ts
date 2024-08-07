import cron from "node-cron"
import orderModel from "./models/order.model"

cron.schedule("* * * * *", async () => {
	await orderModel.deleteMany({
		status: "placed",

        //createdAt since 20min
		createdAt: { $lt: new Date(new Date().getTime() - 20 * 60 * 100) },
	})
})
