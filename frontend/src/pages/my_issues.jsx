
import {useEffect,useMemo,useState} from 'react'
import api from '../api/axios'
import {useQuery} from '@tanstack/react-query'
import toast from 'react-hot-toast'
import IssueDrawer from '../components/issue_drawer'
import { optimizeCloudinary } from '../utils/cloudinary'

const STATUS_OPTIONS = [
  {key: 'ALL', label: 'All'},
  {key: 'REPORTED', label: 'Reported'},
  {key: 'IN_PROGRESS', label: 'In Progress'},
  {key: 'RESOLVED', label: 'Resolved'},
]

const format_status = (s) => s ? s.replace('_',' ') : 'Unknown'

const StatusTimeline = ({status}) => {
  const steps = [
    {key: 'REPORTED', label: 'Reported'},
    {key: 'IN_PROGRESS', label: 'In Progress'},
    {key: 'RESOLVED', label: 'Resolved'}
  ]

  const currentIndex = steps.findIndex(st => st.key === status)

  return (
    <div className='flex items-center gap-3'>
      {steps.map((step,idx)=> (
        <div key={step.key} className='flex items-center gap-3'>
          <div className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-semibold ${idx<=currentIndex ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400'}`}>
            {idx+1}
          </div>
          <div className={`text-xs ${idx<=currentIndex ? 'text-white' : 'text-gray-400'}`}>{step.label}</div>
          {idx<steps.length-1 && <div className={`h-px w-6 ${idx<currentIndex ? 'bg-blue-600' : 'bg-gray-700'}`} />}
        </div>
      ))}
    </div>
  )
}

const MyIssues = ()=>{
  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(true)
  const [search,set_search]=useState('')
  const [status_filter,set_status_filter]=useState('ALL')
  const [selected_issue,set_selected_issue]=useState(null)

  const fetchMyIssues = async ()=>{
    const res = await api.get('/issues/my')
    return Array.isArray(res.data?.data) ? res.data.data : []
  }

  const { data: myIssuesData, isLoading: rqLoading, isError } = useQuery(['issues','my'], fetchMyIssues, { staleTime: 60000, retry:1 })

  useEffect(()=>{
    if(rqLoading) return
    if(isError){
      toast.error('Failed to load your issues')
      set_issues([])
      set_loading(false)
      return
    }

    set_issues(myIssuesData || [])
    set_loading(false)
  },[myIssuesData,isError,rqLoading])

  const issues_with_area = useMemo(()=>{
    return issues.map(i=>({
      ...i,
      area: i.area || 'Unknown',
      city: i.city || 'Unknown',
      state: i.state || null
    }))
  },[issues])

  const filtered = useMemo(()=>{
    const q = search.trim().toLowerCase()
    return issues_with_area.filter(i=>{
      const matchesStatus = status_filter==='ALL' ? true : i.status===status_filter
      const matchesQ = q ? (
        (i.title||'').toLowerCase().includes(q) ||
        (i.description||'').toLowerCase().includes(q) ||
        (i.type||'').toLowerCase().includes(q) ||
        (i.city||'').toLowerCase().includes(q) ||
        (i.area||'').toLowerCase().includes(q)
      ) : true
      return matchesStatus && matchesQ
    })
  },[issues_with_area,search,status_filter])

  const stats = useMemo(()=>{
    const total = issues.length
    const reported = issues.filter(i=>i.status==='REPORTED').length
    const in_progress = issues.filter(i=>i.status==='IN_PROGRESS').length
    const resolved = issues.filter(i=>i.status==='RESOLVED').length
    return {total,reported,in_progress,resolved}
  },[issues])

  const format_date=(date)=>{
    try{ return new Date(date).toLocaleDateString() }catch(e){ return date }
  }

  if(loading){
    return (
      <div className='flex min-h-[60vh] items-center justify-center text-xl'>
        Loading your issues...
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='mb-2 text-4xl font-bold'>My Reported Issues</h1>
        <p className='text-gray-400'>Monitor all issues you’ve submitted.</p>
      </div>

      {/* Metrics */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Total Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.total}</div>
        </div>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Reported</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.reported}</div>
        </div>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>In Progress</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.in_progress}</div>
        </div>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolved</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.resolved}</div>
        </div>
      </div>

      {/* Controls: search + status chips */}
      <div className='flex flex-wrap items-center gap-3'>
        <input type='search' value={search} onChange={(e)=>set_search(e.target.value)} placeholder='Search title, description, type, city, area' className='rounded-md bg-white border border-transparent px-3 py-2 text-sm text-primary placeholder:muted shadow-sm w-full md:w-1/2' />

          <div className='ml-auto flex items-center gap-2'>
          {STATUS_OPTIONS.map(opt=> (
            <button key={opt.key} onClick={()=>set_status_filter(opt.key)} className={`px-3 py-1 rounded-full text-sm ${status_filter===opt.key ? 'bg-white text-gray-800' : 'bg-white/5 muted'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Issue list */}
      {filtered.length===0 ? (
        <div className='rounded-2xl bg-gray-900 p-8 text-center text-gray-400'>No issues match your filters.</div>
      ) : (
        <div className='space-y-4'>
          {filtered.map(issue=> (
            <div key={issue.id} className='bg-gray-900 rounded-xl p-4 shadow-md flex flex-col md:flex-row gap-4 md:items-start'>
              <div className='flex-shrink-0 w-full md:w-44 h-36 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center'>
                {issue.imageUrl ? (
                  <img src={optimizeCloudinary(issue.imageUrl,{width:440})} alt='thumb' className='w-full h-full object-cover' />
                ) : (
                  <div className='text-gray-500 text-sm'>No image</div>
                )}
              </div>

              <div className='flex-1'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='min-w-0'>
                    <h3 className='text-lg font-semibold truncate cursor-pointer' onClick={()=>set_selected_issue(issue)}>{issue.title}</h3>
                    <p className='mt-1 text-sm text-gray-300 line-clamp-2'>{issue.description}</p>

                    <div className='mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-400'>
                      <div className='flex items-center gap-2'><span>📍</span><span className='truncate'>{issue.area && issue.city ? `${issue.area}, ${issue.city}${issue.state?`, ${issue.state}`:''}` : (issue.latitude && issue.longitude ? `${Number(issue.latitude).toFixed(3)}, ${Number(issue.longitude).toFixed(3)}` : 'Unknown location')}</span></div>
                      <div className='flex items-center gap-2'><span>🕒</span><span>{format_date(issue.createdAt)}</span></div>
                      <div className='flex items-center gap-2'><span>🏷</span><span>{issue.type||'—'}</span></div>
                    </div>
                  </div>

                    <div className='flex-shrink-0 flex flex-col items-end gap-3'>
                      <div className='text-sm px-3 py-1 rounded-full bg-gray-800 text-gray-300'>{format_status(issue.status)}</div>
                      <div className='hidden md:block'>
                        <StatusTimeline status={issue.status} />
                      </div>
                      <div className='flex flex-col items-end gap-2 mt-2'>
                        <button onClick={()=>set_selected_issue(issue)} className='bg-blue-500 hover:bg-blue-400 text-white text-sm px-3 py-1 rounded-md font-medium'>View details</button>
                      </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <IssueDrawer issue={selected_issue} on_close={()=>set_selected_issue(null)} format_date={(d)=>new Date(d).toLocaleString()} />
    </div>
  )
}

export default MyIssues