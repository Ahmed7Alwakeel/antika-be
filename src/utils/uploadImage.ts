import { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import AppError from './appError';
import sharp from 'sharp';
import { catchAsync } from './catchAsync';

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

  resizeImages = (model: any, reqType: string,folder:string) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.files) return next();
      if ((req.files as { bannerImage: any }).bannerImage) {
        req.body.bannerImage = {
          path: `images/${folder}`,
          name: `${req.params.id}-banner.jpeg`,
        };

        await sharp((req.files as { bannerImage: any }).bannerImage[0].buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`src/public/images/${folder}/${req.body.bannerImage.name}`);
      }

      if ((req.files as { cardImage: any }).cardImage) {
        req.body.cardImage = {
          path: `images/${folder}`,
          name: `${req.params.id}-card.jpeg`,
        };

        await sharp((req.files as { cardImage: any }).cardImage[0].buffer)
          .resize(2000, 1333)
          .toFormat('jpeg')
          .jpeg({ quality: 90 })
          .toFile(`src/public/images/${folder}/${req.body.cardImage.name}`);
      }
      if (reqType == 'update') return next();
      const data = await model.findById(req.params.id);

      res.status(200).json({
				status: "Success",
				data: { data },
			})
    });
}
export default new UploadImage();
