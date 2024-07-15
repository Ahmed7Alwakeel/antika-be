import { Router } from 'express';
import favoriteController from '../controllers/favorite.controller';

export const favRouter = Router();
favRouter.route("/top").get(favoriteController.topFav)
