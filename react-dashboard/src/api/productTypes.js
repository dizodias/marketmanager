import client from './client'

export async function fetchProductTypes() {
  const { data } = await client.get('/product-types')
  return data
}

export async function createProductType(payload) {
  const { data } = await client.post('/product-types', payload)
  return data
}

export async function updateProductType(id, payload) {
  const { data } = await client.put(`/product-types/${id}`, payload)
  return data
}

export async function deleteProductType(id) {
  await client.delete(`/product-types/${id}`)
}
