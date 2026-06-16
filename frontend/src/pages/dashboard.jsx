
import {useEffect,useMemo,useState} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import ActivityFeed from '../components/activity_feed'
import AnalyticsCharts from '../components/analytics_charts'
import { useQuery } from '@tanstack/react-query'

const Dashboard=()=>{
  const [issues,set_issues]=useState([])
  const [my_issues_count,set_my_issues_count]=useState(0)
  const [loading,set_loading]=useState(true)

  const fetchMyIssues = async ()=>{
    const res = await api.get('/issues/my')
    return Array.isArray(res.data?.data) ? res.data.data : []
  }

  const { data: myIssuesData, isLoading: rqLoading, isError } = useQuery(['issues','my'], fetchMyIssues, { staleTime: 60000, retry: 1 })

  useEffect(()=>{
    if(rqLoading) return
    if(isError){
      toast.error('Failed to load dashboard')
      set_loading(false)
      return
    }

    const issue_list = myIssuesData || []
    set_issues(issue_list)
    set_my_issues_count(issue_list.length)
    set_loading(false)
  },[myIssuesData,rqLoading,isError])

  const issues_with_area = useMemo(()=>{
    return issues.map(i=>({
      ...i,
      area: i.area || 'Unknown',
      city: i.city || 'Unknown',
      state: i.state || null
    }))
  },[issues])

  // Summary stats
  const stats = useMemo(()=>{
    const total = issues.length
    const reported = issues.filter(i=>i.status==='REPORTED').length
    const in_progress = issues.filter(i=>i.status==='IN_PROGRESS').length
    const resolved = issues.filter(i=>i.status==='RESOLVED').length
    const resolutionRate = total>0 ? Math.round((resolved/total)*100) : 0
    return { total, reported, in_progress, resolved, resolutionRate }
  },[issues])

  // Top areas (by count) - top 5
  const topAreas = useMemo(()=>{
    const counts = {}
    issues_with_area.forEach(i=>{
      const a = i.area || 'Unknown'
      counts[a] = (counts[a]||0) + 1
    })
    const arr = Object.entries(counts).map(([area,count])=>({area,count}))
    arr.sort((x,y)=>y.count-x.count)
    return arr.slice(0,5)
  },[issues_with_area])

  // Category mapping for requested categories
  const categoryCounts = useMemo(()=>{
    const cats = { Road:0, Electricity:0, Water:0, Garbage:0, Drainage:0, Others:0 }
    issues.forEach(issue=>{
      const t = (issue.type||'').toString().toLowerCase()
      if(t.includes('road')) cats.Road++
      else if(t.includes('electric') || t.includes('power')) cats.Electricity++
      else if(t.includes('water')) cats.Water++
      else if(t.includes('garbage') || t.includes('waste')) cats.Garbage++
      else if(t.includes('drain')) cats.Drainage++
      else cats.Others++
    })
    return cats
  },[issues])

  // Recent 5 reports (latest)
  const recentReports = useMemo(()=>{
    return issues.slice().sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5)
  },[issues])

  // Simple insights
  const insights = useMemo(()=>{
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const thisMonthIssues = issues.filter(i=>{
      try{
        const d = new Date(i.createdAt)
        return d.getMonth()===currentMonth && d.getFullYear()===currentYear
      }catch(e){ return false }
    })

    // most reported category this month
    const catCounts = {}
    thisMonthIssues.forEach(i=>{ const key = (i.type||'Others') ; catCounts[key]=(catCounts[key]||0)+1 })
    const mostReportedCategoryThisMonth = Object.entries(catCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A'

    // area with highest complaints overall
    const areaCounts = {}
    issues_with_area.forEach(i=>{ const a = i.area || 'Unknown'; areaCounts[a] = (areaCounts[a]||0)+1 })
    const topArea = Object.entries(areaCounts).sort((a,b)=>b[1]-a[1])[0]?.[0] || 'N/A'

    const unresolved = issues.filter(i=>i.status!=='RESOLVED').length

    return {
      mostReportedCategoryThisMonth,
      topArea,
      resolutionRate: stats.resolutionRate,
      unresolved
    }
  },[issues,issues_with_area,stats])

  const formatDate=(d)=>{ try{ return new Date(d).toLocaleDateString() }catch(e){ return d } }

  if(loading){
    return(
      <div className='flex min-h-[60vh] items-center justify-center text-xl'>
        Loading dashboard...
      </div>
    )
  }

  return(
    <div className='space-y-6'>
      <div>
        <h1 className='mb-2 text-4xl font-bold'>Dashboard</h1>
        <p className='text-gray-400'>Track your {my_issues_count} civic {my_issues_count===1?'report':'reports'} and issue progress.</p>
      </div>

      {/* Personal summary cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
        <div className='ct-card card-pad'>
          <div className='ct-sub'>Total Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.total}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolved Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.resolved}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Open Issues</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.reported + stats.in_progress}</div>
        </div>

        <div className='ct-card card-pad'>
          <div className='ct-sub'>Resolution Rate</div>
          <div className='mt-2 text-2xl font-extrabold'>{stats.resolutionRate}%</div>
        </div>
      </div>

      {/* Main grid: analytics + sidebar */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2 space-y-4'>
          {/* Charts */}
          <AnalyticsCharts issues={issues} />

          {/* Category breakdown */}
          <div className='ct-card card-pad'>
            <div className='flex items-center justify-between'>
              <h3 className='ct-h2'>Issue Categories</h3>
            </div>

            <div className='mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {Object.entries(categoryCounts).map(([name,count])=> (
                <div key={name} className='rounded-lg bg-gray-900 p-4'>
                  <div className='text-sm text-gray-400'>{name}</div>
                  <div className='mt-2 text-2xl font-bold'>{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Insights</h3>
            <div className='mt-4 space-y-3 text-sm text-gray-300'>
              <div>Most reported category this month: <strong className='text-white'>{insights.mostReportedCategoryThisMonth}</strong></div>
              <div>Area with highest complaints: <strong className='text-white'>{insights.topArea}</strong></div>
              <div>Current resolution rate: <strong className='text-white'>{insights.resolutionRate}%</strong></div>
              <div>Active unresolved issues: <strong className='text-white'>{insights.unresolved}</strong></div>
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          {/* Top Areas */}
          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Most Reported Areas</h3>
            <div className='mt-3 space-y-2'>
              {topAreas.length===0 ? (
                <div className='text-sm muted'>No area data yet.</div>
              ) : (
                topAreas.map(t=> (
                  <div key={t.area} className='flex items-center justify-between'>
                    <div className='text-sm truncate'>{t.area}</div>
                    <div className='text-sm font-semibold'>{t.count}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent reports */}
          <div>
            <ActivityFeed activities={recentReports} />
          </div>

          {/* Quick actions */}
          <div className='ct-card card-pad'>
            <h3 className='ct-h2'>Quick Actions</h3>
            <div className='mt-3 flex flex-col gap-2'>
              <Link to='/report' className='btn btn-ghost'>Report New Issue</Link>
              <Link to='/my-issues' className='btn btn-ghost'>View My Issues</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state guidance when user has no issues */}
      {issues.length===0 && (
        <div className='ct-card card-pad'>
          <h3 className='ct-h2'>No reports yet</h3>
          <p className='mt-2 text-gray-300'>You haven't reported any issues yet. Use the button below to file your first civic report.</p>
          <div className='mt-4 flex gap-2'>
            <Link to='/report' className='rounded-lg bg-green-600 px-4 py-2 font-medium hover:bg-green-700'>Report an Issue</Link>
            <Link to='/explore' className='rounded-lg bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700'>Browse City Issues</Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
