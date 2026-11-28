const BASE = import.meta.env.VITE_API_URL || ''

async function request(path, signal) {
  const res = await fetch(`${BASE}${path}`, { signal })
  const body = await res.json().catch(() => null)
  if (!res.ok || !body?.success) {
    throw new Error(body?.error?.message || 'Something went wrong. Please try again.')
  }
  return body.data
}

export function searchAttractions(params, signal) {
  const qs = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (Array.isArray(v) ? v.length : v) qs.set(k, Array.isArray(v) ? v.join(',') : v)
  })
  return request(`/api/attractions?${qs}`, signal)
}

export function fetchFilterOptions(signal) {
  return request('/api/attractions/filters', signal)
}
