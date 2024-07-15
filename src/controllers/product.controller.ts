import productModel from '../models/product.model';
import APIService from '../services/API.service';

class Product {

  createOne = APIService.createOne(productModel);
  getAll = APIService.getAll(productModel);
  getOne = APIService.getOne(productModel);
  deleteOne = APIService.deleteOne(productModel, 'product');
  updateOne = APIService.updateOne(productModel);

}

export default new Product();