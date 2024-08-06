import mongoose from 'mongoose';

export default interface IProduct {
  _id?:string
  name: string;
  price: number;
  createdAt: Date;
  category: mongoose.Types.ObjectId | null;
}
