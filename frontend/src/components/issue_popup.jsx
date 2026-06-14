const IssuePopup=({issue})=>{
  return(
    <div className='min-w-[220px]'>
      <h3 className='mb-2 text-lg font-bold text-black'>
        {issue.title}
      </h3>

      <p className='mb-2 text-sm text-gray-700'>
        {issue.description}
      </p>

      <div className='space-y-1 text-sm text-gray-800'>
        <p><strong>Type:</strong> {issue.type}</p>
        <p><strong>Status:</strong> {issue.status}</p>
      </div>

      {issue.imageUrl&&(
        <img
          src={issue.imageUrl}
          alt='Issue'
          className='mt-3 h-32 w-full rounded-lg object-cover'
        />
      )}
    </div>
  )
}

export default IssuePopup