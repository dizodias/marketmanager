import client from './client'

export async function fetchMovements(size = 50) {
  const { data } = await client.get('/movements', { params: { size } })
  return data
}

export async function fetchProductMovements(productId) {
  const { data } = await client.get(`/products/${productId}/movements`)
  return data
}

export async function registerMovement(productId, payload) {
  const { data } = await client.post(`/products/${productId}/movements`, payload)
  return data
}
