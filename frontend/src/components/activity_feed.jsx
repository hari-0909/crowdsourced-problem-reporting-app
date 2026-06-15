import React from 'react'

const ActivityFeed = ({activities}) => {
  return (
    <div className='ct-card card-pad'>
  <h3 className='ct-h2'>Recent Activity</h3>
      <div className='mt-4 space-y-4'>
        {activities.length === 0 && (
          <div className='text-sm muted'>No recent activity</div>
        )}

        {activities.map((a) => (
          <div key={a.id} className='flex items-start gap-4'>
            <div className='mt-1'>
              <div className='w-3 h-3 rounded-full' style={{background: a.status === 'RESOLVED' ? 'var(--success)' : a.status === 'IN_PROGRESS' ? 'var(--primary)' : 'var(--warning)'}}></div>
            </div>

            <div className='flex-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='font-semibold' style={{color:'var(--text-primary)'}}>{a.title}</div>
                  <div className='text-sm muted'>{a.user?.email || 'Unknown'}</div>
                </div>

                <div className='text-sm muted text-right'>
                  <div className='ct-sub'>{a.status.replace('_',' ')}</div>
                  <div className='text-xs muted'>{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ActivityFeed
