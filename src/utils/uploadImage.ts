import { NextFunction, Request, Response } from "express"
import multer from "multer"
import AppError from "./appError"
import sharp from "sharp"
import { catchAsync } from "./catchAsync"
import mongoose from "mongoose"

class UploadImage {
	multerStorage = multer.memoryStorage()

	multerFilter = (req: Request, file: any, cb: any) => {
		if (file.mimetype.startsWith("image")) {
			cb(null, true)
		} else {
			cb(new AppError("Please upload image", "FAIL", 400), false)
		}
	}

	upload = multer({
		storage: this.multerStorage,
		fileFilter: this.multerFilter,
	})

	uploadImage(imagesArray: any[]) {
		return this.upload.fields(imagesArray)
	}

  resizeHelper = async (
    key: any,
    folder: string,
    id: string,
    condition: any,
    imageName: string
  ) => {
    if (condition) {
      key.path = `images/${folder}/`;
      key.name = `${id}-${imageName}.jpeg`;
      
      await sharp(condition[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`src/public/images/${folder}/${key.name}`);
    }
  };  

	resizeImages = (folder: string) =>
    catchAsync(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.files) return next();
  
      const { bannerImage, cardImage } = req.files as { bannerImage: any; cardImage: any };
  
      // Process banner image
      if (bannerImage) {
        req.body.bannerImage = {}; // Initialize the object if necessary
        await this.resizeHelper(
          req.body.bannerImage,
          folder,
          req.params.id,
          bannerImage,
          'banner'
        );
      }
  
      // Process card image
      if (cardImage) {
        req.body.cardImage = {}; // Initialize the object if necessary
        await this.resizeHelper(
          req.body.cardImage,
          folder,
          req.params.id,
          cardImage,
          'card'
        );
      }
  
      next();
    });
  


	createResizeImages = (folder: string) =>
		catchAsync(async (req: Request, res: Response, next: NextFunction) => {
			if (!req.files) return next()
        const { bannerImage, cardImage } = req.files as { bannerImage: any; cardImage: any };
  
      // Process banner image
      if (bannerImage) {
        req.body.bannerImage = {}; // Initialize the object if necessary
        await this.resizeHelper(
          req.body.bannerImage,
          folder,
          req.body.name,
          bannerImage,
          'banner'
        );
      }
  
      // Process card image
      if (cardImage) {
        req.body.cardImage = {}; // Initialize the object if necessary
        await this.resizeHelper(
          req.body.cardImage,
          folder,
          req.body.name,
          cardImage,
          'card'
        );
      }

			next()
		})
}
export default new UploadImage()
