import {useEffect,useMemo,useState} from 'react'
import toast from 'react-hot-toast'
import api from '../api/axios'
import IssueMap from '../components/issue_map'
import IssueDrawer from '../components/issue_drawer'
import ActivityFeed from '../components/activity_feed'
// area and city are provided by backend reverse geocoding (if available)

const Explore=()=>{
  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(false)
  const [initial_loading,set_initial_loading]=useState(true)
  const [error,set_error]=useState('')

  const [radius,set_radius]=useState(5)
  const [center,set_center]=useState(null)

  const [view_mode,set_view_mode]=useState('map')
  const [search,set_search]=useState('')
  const [type_filter,set_type_filter]=useState('ALL')
  const [area_filter,set_area_filter]=useState('ALL')
  const [sort_field,set_sort_field]=useState('createdAt')
  const [sort_direction,set_sort_direction]=useState('desc')
  const [selected_issue,set_selected_issue]=useState(null)

  const get_issue_list=(response)=>{
    const data=response?.data?.data
    return Array.isArray(data)?data:[]
  }

  const fetch_all_issues=async()=>{
    set_loading(true)
    set_error('')

    try{
      const res=await api.get('/issues')
      const issue_list=get_issue_list(res)

      set_issues(issue_list)
      set_center(null)
    }catch(err){
      set_issues([])
      set_error(err.response?.data?.message||'Failed to load issues')
      toast.error('Failed to load issues')
    }finally{
      set_loading(false)
      set_initial_loading(false)
    }
  }

  const fetch_nearby_issues=()=>{
    if(!navigator.geolocation){
      toast.error('Geolocation not supported')
      return
    }

    set_loading(true)
    set_error('')

    navigator.geolocation.getCurrentPosition(
      async(position)=>{
        try{
          const lat=position.coords.latitude
          const lng=position.coords.longitude

          set_center([lat,lng])

          const res=await api.get('/issues/nearby',{params:{lat,lng,radius}})

          const issue_list=get_issue_list(res)

          set_issues(issue_list)

          toast.success(`Found ${issue_list.length} nearby issues`)
          set_view_mode('map')
        }catch(err){
          set_issues([])
          set_error(err.response?.data?.message||'Failed to fetch nearby issues')
          toast.error('Failed to fetch nearby issues')
        }finally{
          set_loading(false)
        }
      },
      ()=>{
        set_loading(false)
        set_error('Failed to get location')
        toast.error('Failed to get location')
      }
    )
  }

  useEffect(()=>{
    let active=true

    const load_initial_issues=async()=>{
      try{
        const res=await api.get('/issues')
        const issue_list=get_issue_list(res)

        if(!active) return

        set_issues(issue_list)
        set_center(null)
      }catch(err){
        if(!active) return

        set_issues([])
        set_error(err.response?.data?.message||'Failed to load issues')
        toast.error('Failed to load issues')
      }finally{
        if(active) set_initial_loading(false)
      }
    }

    load_initial_issues()

    return ()=>{ active=false }
  },[])
  const type_options=useMemo(()=>{
    const unique=issues.map(i=>i.type).filter(Boolean)
    return ['ALL',...new Set(unique)]
  },[issues])

  // Use server-provided area/city when available; fallback to 'Unknown'
  const issues_with_area = useMemo(()=>{
    return issues.map(i=>({
      ...i,
      area: i.area || 'Unknown',
      city: i.city || 'Unknown',
      state: i.state || null
    }))
  },[issues])

  const area_options = useMemo(()=>{
    const unique = issues_with_area.map(i=>i.area).filter(Boolean)
    return ['ALL',...new Set(unique)]
  },[issues_with_area])

  const format_status=(status)=>status?status.replace('_',' '):'Unknown'

  const status_badge_class=(status)=>{
    if(status==='RESOLVED') return 'bg-green-500/15 text-green-300 ring-green-500/30'
    if(status==='IN_PROGRESS') return 'bg-blue-500/15 text-blue-300 ring-blue-500/30'
    return 'bg-yellow-500/15 text-yellow-300 ring-yellow-500/30'
  }

  const format_date=(date)=>{
    try{
      return new Date(date).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'})
    }catch(e){return date}
  }

  const filtered_issues=useMemo(()=>{
    const q=search.trim().toLowerCase()

    return issues_with_area.filter(issue=>{
      const matches_q = q ? (issue.title||'').toLowerCase().includes(q) || (issue.description||'').toLowerCase().includes(q) || (issue.area||'').toLowerCase().includes(q) : true
      const matches_type = type_filter==='ALL' ? true : issue.type===type_filter
      const matches_area = area_filter==='ALL' ? true : (issue.area===area_filter)
      return matches_q && matches_type && matches_area
    })
  },[issues_with_area,search,type_filter,area_filter])

  const sorted_issues=useMemo(()=>{
    const data=[...filtered_issues]

    data.sort((a,b)=>{
      const a_val=a[sort_field]
      const b_val=b[sort_field]

      if(a_val==null && b_val==null) return 0
      if(a_val==null) return 1
      if(b_val==null) return -1

      if(sort_field==='createdAt'){
        const av=new Date(a_val).getTime()
        const bv=new Date(b_val).getTime()
        return sort_direction==='asc' ? av-bv : bv-av
      }

      if(a_val<b_val) return sort_direction==='asc'?-1:1
      if(a_val>b_val) return sort_direction==='asc'?1:-1
      return 0
    })

    return data
  },[filtered_issues,sort_field,sort_direction])

  // Enhanced stats for Explore page
  const enhanced_stats = useMemo(()=>{
    const total = filtered_issues.length
    const open = filtered_issues.filter(i=>i.status==='REPORTED' || i.status==='IN_PROGRESS').length
    const resolved = filtered_issues.filter(i=>i.status==='RESOLVED').length
    const resolutionRate = total>0 ? Math.round((resolved/total)*100) : 0

    // Average resolution time requires a resolvedAt or similar field; check if available
    const resolvedWithTime = filtered_issues.filter(i=>i.status==='RESOLVED' && i.resolvedAt)
    let avgResolutionTime = null
    if(resolvedWithTime.length>0){
      const totalMs = resolvedWithTime.reduce((acc,i)=>{
        const created = new Date(i.createdAt).getTime()
        const resolvedAt = new Date(i.resolvedAt).getTime()
        return acc + Math.max(0, resolvedAt - created)
      },0)
      avgResolutionTime = Math.round(totalMs / resolvedWithTime.length / (1000*60*60*24)) // days
    }

    return { total, open, resolved, resolutionRate, avgResolutionTime }
  },[filtered_issues])

  const stats=useMemo(()=>{
    const total=issues.length
    const reported=issues.filter(i=>i.status==='REPORTED').length
    const in_progress=issues.filter(i=>i.status==='IN_PROGRESS').length
    const resolved=issues.filter(i=>i.status==='RESOLVED').length
    return {total,reported,in_progress,resolved}
  },[issues])

  const trending=useMemo(()=>{
    return issues.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,6)
  },[issues])

  // Trending areas: top 5 areas by issue count
  const trendingAreas = useMemo(()=>{
    const counts = {}
    issues_with_area.forEach(i=>{
      const a = i.area || 'Unknown'
      counts[a] = (counts[a]||0) + 1
    })
    const arr = Object.entries(counts).map(([area,count])=>({area,count}))
    arr.sort((x,y)=>y.count-x.count)
    return arr.slice(0,5)
  },[issues_with_area])

  if(initial_loading){
    return(
      <div className='flex min-h-[70vh] items-center justify-center text-xl'>
        Loading map...
      </div>
    )
  }

  return(
    <div className='space-y-6'>
      <div>
        <h1 className='text-4xl font-bold'>Explore Issues</h1>
        <p className='mt-2 text-gray-400'>Discover and track civic issues across the city.</p>
      </div>

      {/* Quick stats + resolution metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-5'>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Total Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{enhanced_stats.total}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Open Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{enhanced_stats.open}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolved Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{enhanced_stats.resolved}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolution Rate</div>
          <div className='mt-2 text-2xl font-extrabold'>{enhanced_stats.resolutionRate}%</div>
        </div>

        {enhanced_stats.avgResolutionTime!=null && (
          <div className='ct-card card-pad'>
            <div className='ct-sub'>Avg Resolution Time</div>
            <div className='mt-2 text-2xl font-extrabold'>{enhanced_stats.avgResolutionTime}d</div>
          </div>
        )}
      </div>

      {/* Controls: radius, location, search, filters, sort, view toggle */}
      <div className='flex flex-wrap items-center gap-3'>
        <select value={radius} onChange={(e)=>set_radius(Number(e.target.value))} className='rounded-lg bg-gray-900 px-3 py-2'>
          <option value={1}>1 KM</option>
          <option value={5}>5 KM</option>
          <option value={10}>10 KM</option>
          <option value={25}>25 KM</option>
        </select>

        <button onClick={fetch_nearby_issues} disabled={loading} className='rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60'>
          {loading?'Loading...':'Use My Location'}
        </button>

        <button onClick={fetch_all_issues} disabled={loading} className='rounded-lg bg-green-600 px-4 py-2 font-medium hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60'>
          Show All Issues
        </button>

        <div className='ml-auto flex items-center gap-2'>
          <input type='search' value={search} onChange={(e)=>set_search(e.target.value)} placeholder='Search titles, descriptions, or area' className='rounded-md bg-white border border-transparent px-3 py-2 text-sm text-primary placeholder:muted shadow-sm' />

          <select value={area_filter} onChange={(e)=>set_area_filter(e.target.value)} className='rounded-md bg-transparent border border-transparent text-sm px-2 py-2 muted'>
            {area_options.map(a=> <option key={a} value={a}>{a==='ALL' ? 'All Areas' : a}</option>)}
          </select>

          <select value={sort_field} onChange={(e)=>set_sort_field(e.target.value)} className='rounded-md bg-transparent border border-transparent text-sm px-2 py-2 muted'>
            <option value='createdAt'>Newest</option>
            <option value='title'>Title</option>
            <option value='type'>Type</option>
            <option value='status'>Status</option>
          </select>

          <button onClick={()=>set_sort_direction((d)=>d==='asc'?'desc':'asc')} className='btn btn-ghost'>
            {sort_direction==='asc' ? 'Asc' : 'Desc'}
          </button>

          <div className='rounded-md bg-white/5 p-1 flex items-center gap-1'>
            <button onClick={()=>set_view_mode('map')} className={`px-3 py-1 rounded ${view_mode==='map'?'bg-white text-black':'muted'}`}>Map</button>
            <button onClick={()=>set_view_mode('list')} className={`px-3 py-1 rounded ${view_mode==='list'?'bg-white text-black':'muted'}`}>List</button>
          </div>
        </div>
      </div>

      {/* Category pills */}
      <div className='flex flex-wrap gap-2'>
        {type_options.map((t)=> (
          <button key={t} onClick={()=>set_type_filter(t)} className={`px-3 py-1 rounded-full text-sm ${type_filter===t?'bg-white text-black':'bg-white/5 muted'}`}>
            {t==='ALL'?'All Types':t}
          </button>
        ))}
      </div>

      {error&&(
        <div className='rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-200'>
          {error}
        </div>
      )}

      {/* Main content: two-column layout: primary + sidebar */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4'>
          {/* Map or list */}
          {view_mode==='map' ? (
            <IssueMap issues={issues} center={center} />
          ) : (
            <div className='space-y-4'>
              {sorted_issues.length===0 ? (
                <div className='rounded-lg border border-gray-700 bg-gray-900 px-4 py-6 text-gray-300'>No issues found.</div>
              ) : (
                sorted_issues.map((issue)=> (
                  <div
                    key={issue.id}
                    className='bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-transform duration-150 ease-in-out hover:-translate-y-0.5 p-3 flex items-center gap-4'
                  >
                    <div className='flex-shrink-0'>
                      {issue.imageUrl ? (
                        <img src={issue.imageUrl} alt='thumb' className='h-16 w-24 rounded-md object-cover' />
                      ) : (
                        <div className='h-16 w-24 rounded-md bg-gray-100 flex items-center justify-center text-sm text-gray-500'>No image</div>
                      )}
                    </div>

                    <div className='flex-1 min-w-0'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='min-w-0'>
                          <h3 className='text-sm md:text-base font-semibold text-gray-900 truncate cursor-pointer' onClick={()=>set_selected_issue(issue)}>{issue.title}</h3>
                          <p className='mt-1 text-sm text-gray-600 line-clamp-2'>{issue.description}</p>

                          <div className='mt-2 flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                            <div className='flex items-center gap-1'><span aria-hidden>📍</span><span className='truncate'>{issue.area && issue.city ? `${issue.area}${issue.city && issue.city!=='Unknown' ? ` • ${issue.city}` : ''}` : (issue.latitude && issue.longitude ? `${Number(issue.latitude).toFixed(3)}, ${Number(issue.longitude).toFixed(3)}` : 'Unknown location')}</span></div>
                            <div className='flex items-center gap-1'><span aria-hidden>🕒</span><span>{format_date(issue.createdAt)}</span></div>
                            <div className='flex items-center gap-1'><span aria-hidden>🏷</span><span>{issue.type||'—'}</span></div>
                          </div>
                        </div>

                        <div className='flex-shrink-0 flex flex-col items-end gap-2'>
                          <div className={`text-xs px-2 py-1 rounded-full ${status_badge_class(issue.status)}`}>{format_status(issue.status)}</div>

                          <div className='flex flex-col items-end gap-2'>
                            <button onClick={()=>set_selected_issue(issue)} className='bg-blue-600 text-white text-sm px-3 py-1 rounded-md font-medium'>View details</button>
                            <button onClick={()=>{ set_center([Number(issue.latitude),Number(issue.longitude)]); set_view_mode('map') }} className='text-xs text-gray-500 hover:text-gray-700'>Center on map</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Inline message when there are no visible results */}
          {!loading && !error && issues.length===0 && (
            <div className='rounded-lg border border-gray-700 bg-gray-900 px-4 py-6 text-gray-300'>No issues reported yet.</div>
          )}
        </div>

        {/* Sidebar: Trending + small actions */}
        <div className='space-y-4'>
          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Trending</h3>
            <div className='mt-4'>
              <ActivityFeed activities={trending} />
            </div>
          </div>

          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Trending Areas</h3>
            <div className='mt-3 space-y-2'>
              {trendingAreas.length===0 ? (
                <div className='text-sm text-gray-400'>No area data yet.</div>
              ) : (
                trendingAreas.map(t=> (
                  <div key={t.area} className='flex items-center justify-between'>
                    <div className='text-sm truncate'>{t.area}</div>
                    <div className='text-sm font-semibold'>{t.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Quick Actions</h3>
            <div className='mt-3 flex flex-col gap-2'>
              <button onClick={()=>{ set_view_mode('map'); set_center(null); fetch_all_issues() }} className='btn btn-ghost'>Show full map</button>
              <button onClick={()=>{ set_view_mode('list') }} className='btn btn-ghost'>Show list</button>
            </div>
          </div>
        </div>
      </div>

      <IssueDrawer issue={selected_issue} on_close={()=>set_selected_issue(null)} format_date={format_date} />
    </div>
  )
}

export default Explore
