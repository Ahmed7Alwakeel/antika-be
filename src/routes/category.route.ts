import { Router } from 'express';
import uploadImage from '../utils/uploadImage';
import categoryController from '../controllers/category.controller';
import { productRouter } from './product.route';
import authController from '../controllers/auth.controller';
import categoryModel from '../models/category.model';

export const categoryRouter = Router();

categoryRouter.use('/:categoryId/products', productRouter);
categoryRouter
  .route('/')
  .post(
    authController.protect,
    authController.permittedTo('admin'),
    categoryController.createOne
  )
  .get(categoryController.getAll);
categoryRouter
  .route('/:id')
  .get(categoryController.getOne)
  .delete(
    authController.protect,
    authController.permittedTo('admin'),
    categoryController.deleteOne
  )
  .patch(
    authController.protect,
    authController.permittedTo('admin'),
    categoryController.updateOne
  );
