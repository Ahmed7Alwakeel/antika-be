import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync';
import favoriteModel from '../models/favorite.model';
import productModel from '../models/product.model';
import userModel from '../models/user.model';

class Favorite {
	
  getAllFavProducts = catchAsync(async (req: Request, res: Response) => {
    const favorites = await favoriteModel.find({ user: req.currentUser.id });
    const productIds = favorites.map((favorite) => favorite.product);
    const products = await productModel.find({ _id: { $in: productIds } });
    res.status(200).json({
      status: 'success',
      data: { products },
    });
  });

  addToFav = catchAsync(async (req: Request, res: Response) => {
    await favoriteModel.create({
      user: req.currentUser.id,
      product: req.body.product,
    });
    res.status(200).json({
      status: 'success',
      message: 'Product added successfully',
    });
  });

  removeFromFav = catchAsync(async (req: Request, res: Response) => {
    await favoriteModel.findOneAndDelete({
      user: req.currentUser.id,
      product: req.body.product,
    });
    res.status(200).json({
      status: 'success',
      message: 'Product removed successfully',
    });
  });

  topFav = catchAsync(async (req: Request, res: Response) => {
    const { search } = req.query
    const top = await favoriteModel.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 } } }, //group each product get [{prod:,count:}]
      { $sort: { count: -1 } }, //descending order
      { $limit: 5 }, //for top 5
    ]);

    const products = await productModel.find({
      _id: { $in: top.map((fav) => fav._id) },
    }); //in take array of data

    const topUsers = await favoriteModel.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } }, //group each product get [{prod:,count:}]
      { $sort: { count: -1 } }, //descending order
      { $limit: 5 }, //for top 5
    ]);

    const users = await userModel.find({
      _id: { $in: topUsers.map((fav) => fav._id) },
    });

    res.status(200).json({
      status: 'success',
      data: { data: search == 'users' ? users : products },
    });
  });

}
export default new Favorite();
