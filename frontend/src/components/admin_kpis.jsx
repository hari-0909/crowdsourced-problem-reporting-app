import React from 'react'

const AdminKPIs = ({issues, stats}) => {
  const openIssues = stats.reported + stats.in_progress

  const resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0

  const totalReporters = React.useMemo(() => {
    const setEmails = new Set(issues.map((i) => i.user?.email).filter(Boolean))
    return setEmails.size
  }, [issues])

  const mostCommonType = React.useMemo(() => {
    const counts = {}
    for (const i of issues) {
      if (!i.type) continue
      counts[i.type] = (counts[i.type] || 0) + 1
    }
    const entries = Object.entries(counts)
    if (entries.length === 0) return 'N/A'
    entries.sort((a, b) => b[1] - a[1])
    return entries[0][0]
  }, [issues])

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-4'>
      <div className='ct-card card-pad'>
        <div className='flex items-center justify-between'>
          <div>
            <div className='ct-sub'>Open Issues</div>
            <div className='mt-3 text-3xl font-extrabold'>{openIssues}</div>
          </div>
        </div>
      </div>

      <div className='ct-card card-pad'>
        <div>
          <div className='ct-sub'>Resolution Rate</div>
          <div className='mt-3 text-3xl font-extrabold'>{resolutionRate}%</div>
        </div>
      </div>

      <div className='ct-card card-pad'>
        <div>
          <div className='ct-sub'>Total Reporters</div>
          <div className='mt-3 text-3xl font-extrabold'>{totalReporters}</div>
        </div>
      </div>

      <div className='ct-card card-pad'>
        <div>
          <div className='ct-sub'>Most Common Type</div>
          <div className='mt-3 text-xl font-semibold'>{mostCommonType}</div>
        </div>
      </div>
    </div>
  )
}

export default AdminKPIs
