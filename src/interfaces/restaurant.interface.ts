export interface IRestaurant {
	name: string
	city: string
	area: string
	deliveryPrice: number
	estimatedDeliveryTime: number
	created_at?: Date
	published: boolean
	startLocation: {
		// GeoJSON
		type: string
		coordinates: [Number]
	}
}
