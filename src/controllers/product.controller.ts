import productModel from '../models/product.model';
import APIService from '../services/API.service';

class Product {

  createOne = APIService.createOne(productModel);
  getAll = APIService.getAll(productModel);
  getOne = APIService.getOne(productModel);
  deleteMany = APIService.deleteMany(productModel, 'product');
  updateMany = APIService.updateMany(productModel);

}

export default new Product();