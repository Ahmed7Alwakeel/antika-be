import mongoose from "mongoose";
import IProduct from "./interfaces/product.interface";
import productModel from "./models/product.model";
import slugify from "slugify";
import { app } from "./app";

mongoose
	.connect(process.env.MONGO_LOCAL_URL || "")
	.then(() => console.log("RunningDB"))

  const server = app.listen(process.env.PORT, () => console.log("RunningSERVER"))

  const seedProducts=async(numProducts: number): Promise<void> =>{
    try {
        // Clear existing products (optional, depends on your needs)
        await productModel.deleteMany();

        // Generate 'numProducts' fake products
        const products: IProduct[] = [];
        for (let i = 0; i < numProducts; i++) {
            const productName: string = "dsad" + i;
            const productDescription: string = "dsad"
            const bannerImagePath: string = "dsad"
            const bannerImageName: string = "dsad"
            const cardImagePath: string = "dsad"
            const cardImageName: string = "dsad"
            const quantity: number = i
            const published: boolean = false


            const product: IProduct = new productModel({
                name: productName,
                description: productDescription,
                bannerImage: {
                    path: bannerImagePath,
                    name: bannerImageName,
                },
                cardImage: {
                    path: cardImagePath,
                    name: cardImageName,
                },
                quantity:quantity,
                published
            });

            product.slug = slugify(productName, { lower: true });

            products.push(product);
        }

        // Insert all generated products into the database
        await productModel.insertMany(products);

        console.log(`${numProducts} products seeded successfully.`);
        mongoose.connection.close();
    } catch (err) {
        console.error('Seeder error:', err);
        mongoose.connection.close();
    }
}

// Usage: Seed 10 products
seedProducts(10);