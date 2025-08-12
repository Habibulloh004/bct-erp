import api from '@/services/api'


export async function getProducts(params) {
  // backendga moslang (page, limit, search, period)
  const { data } = await api.get('/api/products', {
    params: {
      page: params.page,
      limit: params.perPage,
      search: params.q || undefined,
      period: params.period || undefined,
    },
  })
  return data
}
