const productService = require('../services/product.service');
const { sendSuccess } = require('../utils/response');

const listProducts = async (req, res) => {
  const result = await productService.listProducts(req.tenant, req.query);
  sendSuccess(res, result);
};

const getProductById = async (req, res) => {
  const product = await productService.getProductById(req.tenant.id, req.params.id);
  sendSuccess(res, product);
};

const createProduct = async (req, res) => {
  const newProduct = await productService.createProduct(req.tenant.id, req.body);
  sendSuccess(res, newProduct, 201);
};

const updateProduct = async (req, res) => {
  const updatedProduct = await productService.updateProduct(req.tenant.id, req.params.id, req.body);
  sendSuccess(res, updatedProduct);
};

const deleteProduct = async (req, res) => {
  const result = await productService.deleteProduct(req.tenant.id, req.params.id);
  sendSuccess(res, result);
};

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
