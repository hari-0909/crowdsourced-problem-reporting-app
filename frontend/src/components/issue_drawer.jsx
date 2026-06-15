const IssueDrawer=({
  issue,
  on_close,
  format_date
})=>{
  if(!issue){
    return null
  }

  return(
    <div className='fixed inset-0 z-50 bg-black/50'>
      <div className='absolute right-0 top-0 h-full w-full max-w-lg overflow-y-auto p-6'>
        <div className='ct-card p-6'>
          <div className='mb-5 flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>Issue Details</h2>

            <button onClick={on_close} className='text-2xl btn btn-ghost'>✕</button>
          </div>

          <h3 className='mb-2 text-xl font-semibold'>{issue.title}</h3>

          <p className='mb-5 muted'>{issue.description}</p>

          <div className='space-y-2'>
            <p><strong>Type:</strong> <span className='muted'> {issue.type}</span></p>
            <p><strong>Status:</strong> <span className='muted'> {issue.status}</span></p>
            <p><strong>Reporter:</strong> <span className='muted'> {issue.user?.email}</span></p>
            <p><strong>Created:</strong> <span className='muted'> {format_date(issue.createdAt)}</span></p>
            <p><strong>Latitude:</strong> <span className='muted'> {issue.latitude}</span></p>
            <p><strong>Longitude:</strong> <span className='muted'> {issue.longitude}</span></p>
          </div>

          {issue.imageUrl&&(
            <img src={issue.imageUrl} alt='Issue' className='mt-6 rounded-lg w-full object-cover' />
          )}
        </div>
      </div>
    </div>
  )
}

export default IssueDrawer