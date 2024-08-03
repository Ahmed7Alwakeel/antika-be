import mongoose from 'mongoose';

export default interface IProduct {
  name: string;
  price: number;
  cardImage: {
    path:string,
    name:string,
  };
  createdAt: Date;
  category: mongoose.Types.ObjectId | null;
}
