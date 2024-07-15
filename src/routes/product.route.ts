import { Router } from 'express';
import uploadImage from '../utils/uploadImage';
import productController from '../controllers/product.controller';
import authController from '../controllers/auth.controller';
import productModel from '../models/product.model';

export const productRouter = Router({ mergeParams: true });

productRouter
  .route('/')
  .post(
    authController.protect,
    authController.permittedTo('admin'),
    uploadImage.uploadImage([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'cardImage', maxCount: 1 },
    ]),
    uploadImage.resizeImages(
      productModel,
      'images/product/',
      'product',
      'src/public/images/product'
    ),
    productController.createOne
  )
  .get(productController.getAll);
productRouter
  .route('/:id')
  .get(productController.getOne)
  .delete(
    authController.protect,
    authController.permittedTo('admin'),
    productController.deleteOne
  )
  .patch(
    authController.protect,
    authController.permittedTo('admin'),
    uploadImage.uploadImage([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'cardImage', maxCount: 1 },
    ]),
    uploadImage.resizeImages(
      productModel,
      'images/product/',
      'product',
      'src/public/images/product'
    ),
    productController.updateOne
  );
