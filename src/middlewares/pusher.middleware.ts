import Pusher from "pusher"
import mongoose from "mongoose"

const pusher = new Pusher({
	appId: process.env.PUSHER_APP_ID!,
	key: process.env.PUSHER_KEY!,
	secret: process.env.PUSHER_SECRET!,
	cluster: "eu",
	useTLS: true,
})

export const pushNotification = async (
	channel: string,
	message: string,
	url?: string
) => {
	await pusher.trigger(channel, "message", {
		message: message,
		url: url,
		created_at: new Date(),
		id: () => new mongoose.Types.ObjectId(),
	})
}
