import client from './client'

export async function fetchMetadata() {
  const { data } = await client.get('/products/metadata')
  return data
}

export async function fetchProducts() {
  const { data } = await client.get('/products')
  return data
}

export async function fetchProduct(id) {
  const { data } = await client.get(`/products/${id}`)
  return data
}

export async function fetchHistory(size = 50) {
  const { data } = await client.get('/products/history', { params: { size } })
  return data
}

export async function fetchProductHistory(id) {
  const { data } = await client.get(`/products/${id}/history`)
  return data
}

export async function createProduct(payload) {
  const { data } = await client.post('/products', payload)
  return data
}

export async function updateProduct(id, payload) {
  const { data } = await client.put(`/products/${id}`, payload)
  return data
}

export async function deleteProduct(id) {
  await client.delete(`/products/${id}`)
}
