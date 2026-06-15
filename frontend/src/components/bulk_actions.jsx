import React from 'react'

const BulkActions = ({selectedCount, onBulkUpdate, clearSelection}) => {
  return (
    <div className='flex items-center gap-3 p-2'>
      <div className='text-sm muted'>Selected: {selectedCount}</div>

      <button onClick={() => onBulkUpdate('REPORTED')} className='btn btn-reported text-sm px-2 py-1 rounded-md'>Reported</button>
      <button onClick={() => onBulkUpdate('IN_PROGRESS')} className='btn btn-primary text-sm px-2 py-1 rounded-md'>In Progress</button>
      <button onClick={() => onBulkUpdate('RESOLVED')} className='btn btn-success text-sm px-2 py-1 rounded-md'>Resolved</button>

      <button onClick={clearSelection} className='ml-auto btn btn-ghost text-sm px-2 py-1 rounded-md'>Clear</button>
    </div>
  )
}

export default BulkActions
