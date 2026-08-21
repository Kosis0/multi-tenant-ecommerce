const categoryService = require('../services/category.service');
const { sendSuccess } = require('../utils/response');

const listCategories = async (req, res) => {
  const categories = await categoryService.listCategories(req.tenant.id);
  sendSuccess(res, categories);
};

const createCategory = async (req, res) => {
  const newCategory = await categoryService.createCategory(req.tenant.id, req.body);
  sendSuccess(res, newCategory, 201);
};

const updateCategory = async (req, res) => {
  const updatedCategory = await categoryService.updateCategory(req.tenant.id, req.params.id, req.body);
  sendSuccess(res, updatedCategory);
};

const deleteCategory = async (req, res) => {
  const result = await categoryService.deleteCategory(req.tenant.id, req.params.id);
  sendSuccess(res, result);
};

module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory
};
