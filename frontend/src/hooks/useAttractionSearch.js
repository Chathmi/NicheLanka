import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchFilterOptions, searchAttractions } from '../services/attractionApi'

const DEFAULTS = { q: '', district: '', town: '', category: '', activities: [], sort: 'featured', page: 1 }

// Read initial filters from the URL so results are shareable / back-button friendly
function readUrl() {
  const p = new URLSearchParams(window.location.search)
  return {
    q: p.get('q') || '',
    district: p.get('district') || '',
    town: p.get('town') || '',
    category: p.get('category') || '',
    activities: (p.get('activities') || '').split(',').filter(Boolean),
    sort: p.get('sort') || 'newest',
    page: Math.max(parseInt(p.get('page'), 10) || 1, 1),
  }
}

function writeUrl(filters) {
  const p = new URLSearchParams()
  Object.entries(filters).forEach(([k, v]) => {
    const val = Array.isArray(v) ? v.join(',') : v
    if (val && String(val) !== String(DEFAULTS[k]) ) p.set(k, val)
  })
  const qs = p.toString()
  window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
}

export function useAttractionSearch(pageSize = 9) {
  const [filters, setFilters] = useState(readUrl)
  const [options, setOptions] = useState({ districts: [], towns: [], categories: [], activities: [] })
  const [result, setResult] = useState({ items: [], pagination: { page: 1, totalPages: 1, total: 0 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [debouncedQ, setDebouncedQ] = useState(filters.q)
  const [reloadKey, setReloadKey] = useState(0)
  const firstRun = useRef(true)

  // Debounce typing in the search box
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 400)
    return () => clearTimeout(t)
  }, [filters.q])

  // Load filter options once
  useEffect(() => {
    const c = new AbortController()
    fetchFilterOptions(c.signal).then(setOptions).catch(() => {})
    return () => c.abort()
  }, [])

  // Fetch results whenever the (debounced) filters change
  useEffect(() => {
    const c = new AbortController()
    setLoading(true)
    setError('')
    const query = { ...filters, q: debouncedQ, limit: pageSize }
    searchAttractions(query, c.signal)
      .then((data) => { setResult(data); setLoading(false) })
      .catch((e) => { if (e.name !== 'AbortError') { setError(e.message); setLoading(false) } })
    writeUrl({ ...filters, q: debouncedQ })
    return () => c.abort()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQ, filters.district, filters.town, filters.category, filters.activities.join(','), filters.sort, filters.page, pageSize, reloadKey])

  useEffect(() => { firstRun.current = false }, [])

  // Any filter change (except page) resets to page 1
  const update = useCallback((patch) => {
    setFilters((f) => {
      const next = { ...f, ...patch }
      if (!('page' in patch)) next.page = 1
      if ('district' in patch && patch.district !== f.district) next.town = ''
      return next
    })
  }, [])

  const reset = useCallback(() => setFilters({ ...DEFAULTS }), [])
  const retry = useCallback(() => setReloadKey((k) => k + 1), [])

  const activeCount =
    (filters.district ? 1 : 0) + (filters.town ? 1 : 0) + (filters.category ? 1 : 0) + filters.activities.length

  return { filters, update, reset, retry, options, result, loading, error, activeCount }
}
