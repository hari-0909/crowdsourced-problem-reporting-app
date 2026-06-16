const IssueDrawer=({ issue, on_close, format_date })=>{
  if(!issue) return null

  const friendlyLocation = () => {
    if(issue.area && issue.city) return `${issue.area}, ${issue.city}${issue.state?`, ${issue.state}`:''}`
    if(issue.latitude!=null && issue.longitude!=null) return `${Number(issue.latitude).toFixed(5)}, ${Number(issue.longitude).toFixed(5)}`
    return 'Unknown location'
  }

  const steps = [
    {key: 'REPORTED', label: 'Reported'},
    {key: 'IN_PROGRESS', label: 'In Progress'},
    {key: 'RESOLVED', label: 'Resolved'}
  ]
  const currentIndex = steps.findIndex(s=>s.key===issue.status)

  return(
    <div className='fixed inset-0 z-50 bg-black/50'>
      <div className='absolute right-0 top-0 h-full w-full max-w-2xl sm:max-w-lg overflow-y-auto p-4 sm:p-6'>
        <div className='ct-card p-4 sm:p-6'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Issue Details</h2>
            <button onClick={on_close} className='text-2xl btn btn-ghost'>✕</button>
          </div>

          {issue.imageUrl && (
            <div className='mb-4 w-full h-60 sm:h-96 overflow-hidden rounded-lg bg-gray-800'>
                <img src={optimizeCloudinary(issue.imageUrl,{width:1200})} alt='Issue' className='w-full h-full object-cover' />
            </div>
          )}

          <h3 className='mb-2 text-xl font-semibold'>{issue.title}</h3>
          <p className='mb-4 muted'>{issue.description}</p>

          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
            <div>
              <p><strong>Type:</strong> <span className='muted'> {issue.type}</span></p>
              <p><strong>Created:</strong> <span className='muted'> {format_date(issue.createdAt)}</span></p>
              <p><strong>Location:</strong> <span className='muted'> {friendlyLocation()}</span></p>
            </div>

            <div>
              <p><strong>Status:</strong> <span className='muted'> {issue.status}</span></p>
              <p><strong>Reporter:</strong> <span className='muted'> {issue.user?.email || 'Unknown'}</span></p>
            </div>
          </div>

          <div className='mt-6'>
            <div className='text-sm text-gray-400 mb-3'>Status timeline</div>

            {/* Responsive timeline: stacks vertically on small screens, horizontal with flexible connectors on sm+ */}
            <div className='w-full'>
              <div className='flex flex-col sm:flex-row sm:items-center items-start gap-4 w-full'>
                {steps.map((s,idx)=>{
                  const stepState = idx < currentIndex ? 'completed' : (idx===currentIndex ? 'current' : 'pending')
                  const circleClass = stepState==='completed' ? 'bg-green-500 text-white' : (stepState==='current' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500')
                  const connectorClass = idx < currentIndex ? 'bg-green-500' : 'bg-gray-300'

                  return (
                    <div key={s.key} className='flex sm:flex-1 flex-col sm:flex-row items-start sm:items-center gap-3 w-full min-w-0'>
                      <div className='flex items-center gap-3 w-full sm:w-auto min-w-0'>
                        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center font-semibold ${circleClass}`}>{idx+1}</div>
                        <div className={`text-sm font-medium ${stepState!=='pending' ? 'text-gray-900' : 'text-gray-600'}`}>{s.label}</div>
                      </div>

                      {/* Connector: horizontal on sm+, vertical on small */}
                      {idx < steps.length-1 && (
                        <>
                          <div className={`hidden sm:block flex-1 h-0.5 ${connectorClass} rounded`} />
                          <div className={`block sm:hidden w-px h-4 ${connectorClass} rounded mx-auto`} />
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IssueDrawer