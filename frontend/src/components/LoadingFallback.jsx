import React from 'react'

const LoadingFallback = ()=> (
  <div className='flex min-h-screen items-center justify-center' style={{background:'var(--page-bg)', color:'var(--text-primary)'}}>
    <div className='text-xl'>Loading…</div>
  </div>
)

export default LoadingFallback
