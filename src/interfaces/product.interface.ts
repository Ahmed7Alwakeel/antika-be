import mongoose from 'mongoose';

export default interface IProduct {
  slug: string;
  name: string;
  description: string;
  bannerImage: {
    path:string,
    name:string,
  };
  cardImage: {
    path:string,
    name:string,
  };
  createdAt: Date;
  published: boolean;
  category: mongoose.Types.ObjectId | null;
  quantity: number;
}
