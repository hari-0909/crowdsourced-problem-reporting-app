// Lightweight utilities to derive area and detect potential duplicate issues
export const roundCoord = (v, precision = 2) => {
  if (v == null || v === '') return null
  const n = Number(v)
  if (Number.isNaN(n)) return null
  const p = Math.pow(10, precision)
  return Math.round(n * p) / p
}

export const deriveAreaFromCoords = (lat, lng, precision = 2) => {
  const rlat = roundCoord(lat, precision)
  const rlng = roundCoord(lng, precision)
  if (rlat == null || rlng == null) return 'Unknown'
  // Simple area representation: rounded lat/lng pair. This groups nearby points.
  return `${rlat}, ${rlng}`
}

// Haversine distance in kilometers
export const haversineKm = (lat1, lon1, lat2, lon2) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  if ([lat1,lon1,lat2,lon2].some((v)=>v==null||v==='')) return Infinity
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const normalizeText = (s) => (s||'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean)

// Simple Jaccard similarity on token sets
const jaccard = (aWords, bWords) => {
  const A = new Set(aWords)
  const B = new Set(bWords)
  if (A.size === 0 && B.size === 0) return 0
  const inter = [...A].filter(x=>B.has(x)).length
  const union = new Set([...A, ...B]).size
  return union === 0 ? 0 : inter / union
}

export const findSimilarIssues = (candidate, issues, opts = {}) => {
  // opts: {titleWeight, descWeight, typeWeight, proximityKm, proximityWeight, scoreThreshold}
  const {
    titleWeight = 0.45,
    descWeight = 0.25,
    typeWeight = 0.15,
    proximityKm = 0.5,
    proximityWeight = 0.15,
    scoreThreshold = 0.35
  } = opts

  const candTitleTokens = normalizeText(candidate.title)
  const candDescTokens = normalizeText(candidate.description)
  const candLat = candidate.latitude ? Number(candidate.latitude) : null
  const candLng = candidate.longitude ? Number(candidate.longitude) : null

  const results = issues.map(issue=>{
    const titleSim = jaccard(candTitleTokens, normalizeText(issue.title))
    const descSim = jaccard(candDescTokens, normalizeText(issue.description))
    const sameType = candidate.type && issue.type && candidate.type.trim().toLowerCase() === (issue.type||'').trim().toLowerCase() ? 1 : 0

    let proximityScore = 0
    if (candLat!=null && candLng!=null && issue.latitude!=null && issue.longitude!=null){
      const d = haversineKm(candLat, candLng, Number(issue.latitude), Number(issue.longitude))
      if (d <= proximityKm) proximityScore = 1
      else if (d <= proximityKm*2) proximityScore = 0.5
    }

    const score = (titleSim * titleWeight) + (descSim * descWeight) + (sameType * typeWeight) + (proximityScore * proximityWeight)

    return {
      issue,
      score,
      titleSim,
      descSim,
      sameType,
      proximityScore
    }
  })

  return results.filter(r=>r.score >= scoreThreshold).sort((a,b)=>b.score-a.score)
}
