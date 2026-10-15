import api from './api';

export const getProducts = async (queryParams = {}) => {
  const params = {};

  if (queryParams.search && queryParams.search.trim() !== '') {
    params.search = queryParams.search.trim();
  }

  if (queryParams.category && queryParams.category !== 'all' && queryParams.category.trim() !== '') {
    params.category = queryParams.category.trim();
  }

  if (queryParams.sort && queryParams.sort.trim() !== '') {
    params.sort = queryParams.sort.trim();
  }

  const response = await api.get('/products', { params });
  return response.data;
};


export const getProductById = async (id) => {
  if (!id) {
    throw new Error('Product ID is required');
  }

  const response = await api.get(`/products/${id}`);
  return response.data;
};


export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export default {
  getProducts,
  getProductById,
  createProduct,
};
