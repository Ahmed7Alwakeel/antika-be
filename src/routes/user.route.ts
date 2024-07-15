import { Router } from 'express';
import authController from '../controllers/auth.controller';
import userController from '../controllers/user.controller';
import favoriteController from '../controllers/favorite.controller';

export const userRouter = Router();
userRouter.use(authController.protect);
userRouter.route('/profile').get(userController.profile);
userRouter
  .route('/')
  .get(authController.permittedTo('admin'), userController.getAll);
userRouter.route('/edit-profile').patch(userController.editProfile);
userRouter.route('/favorite').get(favoriteController.getAllFavProducts);
userRouter.route('/favorite').delete(favoriteController.removeFromFav);
userRouter.route('/favorite').post(favoriteController.addToFav);
