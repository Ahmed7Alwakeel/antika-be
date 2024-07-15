import { NextFunction, Request } from 'express';
import multer from 'multer';
import AppError from './appError';
import sharp from 'sharp';
import { catchAsync } from './catchAsync';
import mongoose from 'mongoose';

class UploadImage {
  multerStorage = multer.memoryStorage();

  multerFilter = (req: Request, file: any, cb: any) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new AppError('Please upload image', 'FAIL', 400), false);
    }
  };

  upload = multer({
    storage: this.multerStorage,
    fileFilter: this.multerFilter,
  });

  uploadImage(imagesArray: any[]) {
    return this.upload.fields(imagesArray);
  }

  resizeImages = (model: any, path: string, folder: string, fullPath: string) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      let body = { ...req.body };
      if (!req.files) return next();
      if (req.params.id) {
        const category = await model.findById(req.params.id);
        if (!req.body.name && category) req.body.name = category.name;
      }
      if ((req.files as { bannerImage: any }).bannerImage) {
        req.body.bannerImage = {
          path: path,
          name: `${folder}-${req.body.name}-banner.jpeg`,
        };

        await sharp((req.files as { bannerImage: any }).bannerImage[0].buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`${fullPath}/${req.body.bannerImage.name}`);
      }

      if ((req.files as { cardImage: any }).cardImage) {
        req.body.cardImage = {
          path: 'images/category/',
          name: `category-${req.body.name}-card.jpeg`,
        };

        await sharp((req.files as { cardImage: any }).cardImage[0].buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`src/public/images/category/${req.body.cardImage.name}`);
      }
      if (req.params.id) {
        req.body = body;
      }

      next();
    });
    
}
export default new UploadImage();
