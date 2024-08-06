import categoryModel from '../models/category.model';
import APIService from '../services/API.service';
class Category {

  createOne = APIService.createOne(categoryModel);
  getAll = APIService.getAll(categoryModel,"products");
  getOne = APIService.getOne(categoryModel, 'products');
  deleteOne = APIService.deleteOne(categoryModel, 'category');
  updateOne = APIService.updateOne(categoryModel);

}
export default new Category();
