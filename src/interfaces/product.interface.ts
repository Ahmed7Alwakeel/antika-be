import mongoose from 'mongoose';

export default interface IProduct {
  name: string;
  price: number;
  createdAt: Date;
  category: mongoose.Types.ObjectId | null;
}
