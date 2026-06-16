import {useEffect,useMemo,useState,useCallback} from 'react'
import api from '../api/axios'
import toast from 'react-hot-toast'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import AnalyticsCharts from '../components/analytics_charts'
import IssueDrawer from '../components/issue_drawer'
import {saveAs} from 'file-saver'
import AdminKPIs from '../components/admin_kpis'
import BulkActions from '../components/bulk_actions'
import ActivityFeed from '../components/activity_feed'
import AdminIssueMap from '../components/admin_issue_map'

const AdminDashboard=()=>{
  const default_stats={
    total:0,
    reported:0,
    in_progress:0,
    resolved:0
  }

  const [stats,set_stats]=useState({
    total:0,
    reported:0,
    in_progress:0,
    resolved:0
  })

  const [issues,set_issues]=useState([])
  const [loading,set_loading]=useState(true)
  const [search,set_search]=useState('')
  const [status_filter,set_status_filter]=useState('ALL')
  const [type_filter,set_type_filter]=useState('ALL')
  const [selected_issue,set_selected_issue]=useState(null)
  const [show_inline_modal,set_show_inline_modal]=useState(false)
  const [sort_field,set_sort_field]=useState('createdAt')
  const [sort_direction,set_sort_direction]=useState('desc')
  const [current_page,set_current_page]=useState(1)
  const items_per_page=10
  const [selected_ids,set_selected_ids]=useState([])
  const queryClient = useQueryClient()

  const fetchStats = async ()=>{
    const res = await api.get('/admin/stats')
    return res.data.data
  }

  const fetchIssues = async ()=>{
    const res = await api.get('/issues')
    return res.data.data
  }

  const { data: statsData, isLoading: statsLoading, isError: statsError } = useQuery({ queryKey: ['admin','stats'], queryFn: fetchStats, staleTime: 60000, retry:1 })
  const { data: issuesData, isLoading: issuesLoading, isError: issuesError } = useQuery({ queryKey: ['issues','all'], queryFn: fetchIssues, staleTime: 60000, retry:1 })

  useEffect(()=>{
    // populate local state when queries resolve
    if(statsData) set_stats(statsData)
    if(issuesData) set_issues(issuesData)
    if(statsLoading || issuesLoading) set_loading(true)
    else set_loading(false)
  },[statsData,issuesData,statsLoading,issuesLoading])

  const status_options=['ALL','REPORTED','IN_PROGRESS','RESOLVED']

  const type_options=useMemo(()=>{
    const unique_types=issues
      .map((issue)=>issue.type)
      .filter(Boolean)

    return ['ALL',...new Set(unique_types)]
  },[issues])

  const filtered_issues=useMemo(()=>{
    const normalized_search=search.trim().toLowerCase()

    return issues.filter((issue)=>{
      const matches_title=normalized_search
        ?issue.title.toLowerCase().includes(normalized_search)
        :true

      const matches_status=status_filter==='ALL'
        ?true
        :issue.status===status_filter

      const matches_type=type_filter==='ALL'
        ?true
        :issue.type===type_filter

      return matches_title&&matches_status&&matches_type
    })
  },[issues,search,status_filter,type_filter])
  const handle_sort=(field)=>{
    if(sort_field===field){
      set_sort_direction(
        sort_direction==='asc'
          ?'desc'
          :'asc'
      )
    }else{
      set_sort_field(field)
      set_sort_direction('asc')
    }
  }

  const sorted_issues=useMemo(()=>{
    const data=[...filtered_issues]

    data.sort((a,b)=>{
      const a_val=a[sort_field]
      const b_val=b[sort_field]

      if(a_val<b_val){
        return sort_direction==='asc'?-1:1
      }

      if(a_val>b_val){
        return sort_direction==='asc'?1:-1
      }

      return 0
    })

    return data
  },[
    filtered_issues,
    sort_field,
    sort_direction
  ])

  const total_pages=Math.ceil(
    sorted_issues.length/items_per_page
  )

  const paginated_issues=sorted_issues.slice(
    (current_page-1)*items_per_page,
    current_page*items_per_page
  )
  const fetch_admin_data=async()=>{
    try{
      const [stats_result,issues_result]=await Promise.allSettled([
        api.get('/admin/stats'),
        api.get('/issues')
      ])

      if(stats_result.status==='fulfilled'){
        set_stats(stats_result.value.data.data)
      }else{
        set_stats(default_stats)
        toast.error('Failed to load issue stats')
      }

      if(issues_result.status==='fulfilled'){
        set_issues(issues_result.value.data.data)
      }else{
        set_issues([])
        toast.error('Failed to load issues')
      }
    }finally{
      set_loading(false)
    }
  }

  // Reset pagination when filters or search change
  useEffect(()=>{
    set_current_page(1)
  },[search,status_filter,type_filter])

  const update_status=async(issue_id,status)=>{
    try{
      await api.patch(`/issues/${issue_id}/status`,{status})
      toast.success('Issue status updated')
      queryClient.invalidateQueries(['issues','all'])
      queryClient.invalidateQueries(['admin','stats'])
    }catch(err){
      toast.error('Failed to update status')
    }
  }

  const bulk_update_status=async(ids,status)=>{
    if(!ids||ids.length===0){
      toast.error('No issues selected')
      return
    }

    try{
      await Promise.all(ids.map(id=>api.patch(`/issues/${id}/status`,{status})))
      toast.success('Bulk update successful')
      set_selected_ids([])
      queryClient.invalidateQueries(['issues','all'])
      queryClient.invalidateQueries(['admin','stats'])
    }catch(err){
      toast.error('Bulk update failed')
    }
  }

  const format_status=(status)=>{
    return status.replace('_',' ')
  }

  const status_badge_class=(status)=>{
    if(status==='RESOLVED'){
      return 'bg-green-500/15 text-green-300 ring-green-500/30'
    }

    if(status==='IN_PROGRESS'){
      return 'bg-blue-500/15 text-blue-300 ring-blue-500/30'
    }

    return 'bg-yellow-500/15 text-yellow-300 ring-yellow-500/30'
  }

  const format_date=(date)=>{
    return new Date(date).toLocaleDateString(undefined,{
      year:'numeric',
      month:'short',
      day:'numeric'
    })
  }
  const export_csv=()=>{
    if(!issues||issues.length===0){
      toast.error('No issues to export')
      return
    }

    const rows=issues.map(issue=>({
      title:issue.title,
      type:issue.type,
      status:issue.status,
      reporter:issue.user?.email||'Unknown',
      createdAt:issue.createdAt
    }))

    const csv=[
      Object.keys(rows[0]).join(','),
      ...rows.map(row=>Object.values(row).join(','))
    ].join('\n')

    const blob=new Blob(
      [csv],
      {type:'text/csv;charset=utf-8;'}
    )

    saveAs(blob,'issues.csv')
  }

  if(loading){
    return(
      <div className='flex min-h-[60vh] items-center justify-center rounded-xl border border-gray-800 bg-gray-900 text-xl text-gray-200'>
        Loading admin dashboard...
      </div>
    )
  }

  return(
    <div className='space-y-8'>
      <div>
        <h1 className='ct-h1'>Admin Dashboard</h1>
        <p className='ct-sub mt-1'>Manage all reported issues across the platform.</p>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Total</div>
          <div className='mt-2 text-3xl font-extrabold'>{stats.total}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Reported</div>
          <div className='mt-2 text-3xl font-extrabold'>{stats.reported}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>In Progress</div>
          <div className='mt-2 text-3xl font-extrabold'>{stats.in_progress}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolved</div>
          <div className='mt-2 text-3xl font-extrabold'>{stats.resolved}</div>
        </div>
      </div>

  <AnalyticsCharts issues={issues}/>
  <AdminKPIs issues={issues} stats={stats} />

      <section className='ct-card'>
        <div className='p-4'>
          <div className='flex items-center gap-4'>
            <div className='flex-1'>
              <h2 className='ct-h2'>Issues</h2>
              <p className='ct-sub mt-1'>Showing {filtered_issues.length} of {issues.length} total issues</p>
            </div>

            {/* Toolbar */}
            <div className='flex items-center gap-3 w-full max-w-3xl'>
              <div className='flex-1'>
                <input
                  type='search'
                  value={search}
                  onChange={(e)=>set_search(e.target.value)}
                  placeholder='Search issues, titles, or descriptions'
                  className='w-full rounded-md bg-white border border-transparent px-3 py-2 text-sm text-primary placeholder:muted shadow-sm'
                />
              </div>

              <div className='flex items-center gap-2'>
                <select value={status_filter} onChange={(e)=>set_status_filter(e.target.value)} className='rounded-md bg-transparent border border-transparent text-sm px-2 py-2 muted'>
                  {status_options.map((status)=> (
                    <option key={status} value={status}>{status==='ALL' ? 'All' : format_status(status)}</option>
                  ))}
                </select>

                <select value={type_filter} onChange={(e)=>set_type_filter(e.target.value)} className='rounded-md bg-transparent border border-transparent text-sm px-2 py-2 muted'>
                  {type_options.map((type)=> (
                    <option key={type} value={type}>{type==='ALL' ? 'All types' : type}</option>
                  ))}
                </select>
              </div>

              <div className='ml-auto'>
                <button onClick={export_csv} className='btn btn-ghost text-sm px-3 py-2 rounded-md'>Export</button>
              </div>
            </div>
          </div>

          {/* Divider between controls and bulk actions */}
          <div className='my-3 border-t border-white/5'></div>

          <div className='flex items-center justify-between'>
            <BulkActions
              selectedCount={selected_ids.length}
              onBulkUpdate={(status)=>bulk_update_status(selected_ids,status)}
              clearSelection={()=>set_selected_ids([])}
            />

            <div className='muted text-sm'>
              {selected_ids.length>0? `${selected_ids.length} selected` : 'No selection'}
            </div>
          </div>
        </div>
        <IssueDrawer
          issue={selected_issue}
          on_close={()=>set_selected_issue(null)}
          format_date={format_date}
        />
        {filtered_issues.length===0?(
          <div className='p-10 text-center'>
            <h3 className='text-xl font-semibold'>No issues found</h3>
            <p className='mt-2 muted'>Try changing the search text or filters.</p>
          </div>
        ):(
          <div className='overflow-x-auto'>
            <table className='ct-table min-w-[980px]'>
              <thead className='text-xs uppercase tracking-wide'>
                <tr>
                  <th className='font-semibold'>
                    <input
                      type='checkbox'
                      checked={selected_ids.length>0 && selected_ids.length===sorted_issues.length}
                      onChange={(e)=>{
                        if(e.target.checked){
                          set_selected_ids(sorted_issues.map(i=>i.id))
                        }else{
                          set_selected_ids([])
                        }
                      }}
                    />
                  </th>
                  <th onClick={()=>handle_sort('title')} className='cursor-pointer font-semibold'>Title</th>
                  <th onClick={()=>handle_sort('type')} className='cursor-pointer font-semibold'>Type</th>
                  <th onClick={()=>handle_sort('status')} className='cursor-pointer font-semibold'>Status</th>
                  <th className='font-semibold'>Reporter Email</th>
                  <th onClick={()=>handle_sort('createdAt')} className='cursor-pointer font-semibold'>Created Date</th>
                  <th className='font-semibold'>Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginated_issues.map((issue)=> (
                  <tr key={issue.id} className='align-top transition'>
                    <td>
                      <input
                        type='checkbox'
                        checked={selected_ids.includes(issue.id)}
                        onChange={(e)=>{
                          e.stopPropagation()
                          if(e.target.checked){
                            set_selected_ids((s)=>[...s,issue.id])
                          }else{
                            set_selected_ids((s)=>s.filter(id=>id!==issue.id))
                          }
                        }}
                      />
                    </td>

                    <td onClick={()=>set_selected_issue(issue)} className='max-w-xs cursor-pointer'>
                      <p className='font-semibold text-white'>{issue.title}</p>
                      <p className='mt-1 line-clamp-2 text-sm muted'>{issue.description}</p>
                    </td>

                    <td className='text-sm muted'>{issue.type}</td>

                    <td>
                      <span className={`ct-badge ${issue.status==='RESOLVED' ? 'ct-badge--green' : issue.status==='IN_PROGRESS' ? 'ct-badge--blue' : 'ct-badge--yellow'}`}>
                        {format_status(issue.status)}
                      </span>
                    </td>

                    <td className='text-sm muted'>{issue.user?.email||'Unknown'}</td>

                    <td className='text-sm muted'>{format_date(issue.createdAt)}</td>

                    <td>
                      <div className='flex flex-wrap gap-2'>
                        <button onClick={(e)=>{e.stopPropagation(); update_status(issue.id,'REPORTED')}} disabled={issue.status==='REPORTED'} className='btn btn-reported'>Reported</button>
                        <button onClick={(e)=>{e.stopPropagation(); update_status(issue.id,'IN_PROGRESS')}} disabled={issue.status==='IN_PROGRESS'} className='btn btn-primary'>In Progress</button>
                        <button onClick={(e)=>{e.stopPropagation(); update_status(issue.id,'RESOLVED')}} disabled={issue.status==='RESOLVED'} className='btn btn-success'>Resolved</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className='flex items-center justify-between border-t border-transparent p-4'>
              <p className='text-sm muted'>Showing {(current_page-1)*items_per_page+1} - {Math.min(current_page*items_per_page, sorted_issues.length)} of {sorted_issues.length}</p>

              <div className='flex gap-2'>
                <button disabled={current_page===1} onClick={()=>set_current_page((p)=>p-1)} className='btn btn-ghost'>Previous</button>
                <button disabled={current_page===total_pages} onClick={()=>set_current_page((p)=>p+1)} className='btn btn-ghost'>Next</button>
              </div>
            </div>
          </div>
        )}
      </section>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <AdminIssueMap issues={issues} />
        </div>

        <div>
          <ActivityFeed activities={issues.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,10)} />
        </div>
      </div>
      {/* Ensure only one drawer/modal exists - IssueDrawer handles full details */}
    </div>
  )
}

export default AdminDashboard
