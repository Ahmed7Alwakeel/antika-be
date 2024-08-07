import { Response, Request, NextFunction } from "express"
import { catchAsync } from "../utils/catchAsync"
import Stripe from "stripe"
import AppError from "../utils/appError"
import orderModel from "../models/order.model"
import restaurantModel from "../models/restaurant.model"
import APIService from "../services/API.service"
import { pushNotification } from "../middlewares/pusher.middleware"

type CheckoutSessionRequest = {
	cartItems: {
		_id: string
		name: string
		quantity: number
	}[]
	deliveryDetails: {
		email: string
		name: string
		addressLine1: string
		city: string
	}
	restaurantId: string
}

class Order {
	STRIPE = new Stripe((process.env.STRIPE_API_KEY as string) || "")
	FRONTEND = (process.env.REDIRECT as string) || ""
	STRIPE_ENDPOINT_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string

	createLineItems = (
		cartItems: {
			product: string
			name: string
			quantity: number
			price: number
		}[]
	) => {
		const lineItems = cartItems.map((item) => {
			const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
				price_data: {
					currency: "gbp",
					unit_amount: item?.price * 100,
					product_data: {
						name: item.name,
					},
				},
				quantity: item.quantity,
			}

			return line_item
		})

		return lineItems
	}

	createCheckoutSession = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const body = req.body
			const restaurant = await restaurantModel.findById(body.restaurant)
			if (!restaurant)
				return next(new AppError("Restaurant not found", "Fail", 404))

			const newOrder = new orderModel({
				restaurant: body.restaurant,
				user: req.currentUser.id,
				status: "placed",
				deliveryDetails: req.body.deliveryDetails,
				cartItems: req.body.cartItems,
			})

			// //create line items: items will display in stripe with its format
			// //get the price from menuItemId
			const lineItems = this.createLineItems(req.body.cartItems)
			const session = await this.createSession(
				lineItems,
				newOrder._id.toString(),
				body.deliveryPrice,
				body.restaurant.toString()
			)
			if (!session?.url) {
				return next(new AppError("Something went wrong", "Fail", 500))
			}
			await pushNotification(
				`order`,
				`New order created at ${restaurant.area} branch, Click to show order lists`,
				"/orders"
			)

			await newOrder.save()
			res.status(200).json({
				status: "Success",
				url: session.url,
			})
		}
	)

	createSession = async (
		lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
		orderId: string,
		deliveryPrice: number,
		restaurantId: string
	) => {
		const sessionData = await this.STRIPE.checkout.sessions.create({
			line_items: lineItems,
			shipping_options: [
				{
					shipping_rate_data: {
						display_name: "Delivery",
						type: "fixed_amount",
						fixed_amount: {
							amount: deliveryPrice * 100,
							currency: "gbp",
						},
					},
				},
			],
			mode: "payment",
			metadata: {
				orderId,
				restaurantId,
			},
			success_url: `${this.FRONTEND}/order-status/${orderId}`,
			cancel_url: `${this.FRONTEND}/detail/${restaurantId}?cancelled=true`,
		})

		return sessionData
	}

	stripeWebhook = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			let event
			const sig = req.headers["stripe-signature"]
			event = this.STRIPE.webhooks.constructEvent(
				req.body,
				sig as string,
				this.STRIPE_ENDPOINT_SECRET
			)

			if (event.type === "checkout.session.completed") {
				const order = await orderModel.findById(
					event.data.object.metadata?.orderId
				)

				if (!order) {
					return res.status(404).json({ message: "Order not found" })
				}

				order.totalAmount = (event.data.object.amount_total as number) / 100
				order.status = "paid"

				await order.save()
			}

			res.status(200).send()
		}
	)

	getUserOne = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.currentUser.id
			const order = await orderModel.findOne({
				user: userId,
				_id: req.params.id,
			})
			const restaurant = await restaurantModel.findById(order?.restaurant)
			res.status(200).json({
				status: "Success",
				data: {
					order,
					restaurant,
				},
			})
		}
	)
	getAll = APIService.getAll(orderModel)
	getOne = APIService.getOne(orderModel)
	updateOne = APIService.updateOne(orderModel)

	getUserOrders = catchAsync(
		async (req: Request, res: Response, next: NextFunction) => {
			const userId = req.currentUser.id
			const data = await orderModel.find({ user: userId })
			res.status(200).json({
				status: "Success",
				data,
			})
		}
	)
}
export default new Order()
