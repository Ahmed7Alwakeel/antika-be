import mongoose from "mongoose";

export default interface IFavorite {
    user:mongoose.Types.ObjectId | null; 
	product: mongoose.Types.ObjectId | null; 
}
