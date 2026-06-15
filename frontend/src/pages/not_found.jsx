
import {Link} from 'react-router-dom'

const NotFound=()=>{
  return(
    <div className='flex min-h-[85vh] flex-col items-center justify-center px-6 text-center'>
  <h1 className='text-8xl font-extrabold' style={{color:'var(--text-primary)'}}>
        404
      </h1>

      <h2 className='mt-4 text-3xl font-bold'>
        Page Not Found
      </h2>

      <p className='mt-3 max-w-xl text-lg text-gray-400'>
        The page you’re looking for doesn’t exist or may have been moved.
      </p>

      <Link
        to='/'
        className='mt-8 rounded-xl bg-blue-600 px-8 py-4 text-lg font-semibold transition hover:bg-blue-700'
      >
        Return Home
      </Link>
    </div>
  )
}

export default NotFound