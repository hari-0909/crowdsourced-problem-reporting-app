
import {Link} from 'react-router-dom'

const Home=()=>{
  return(
    <div className='flex min-h-[85vh] flex-col items-center justify-center px-6 text-center'>
      <h1 className='mb-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl'>
        Crowdsourced Civic Issue Reporting For Smarter Communities
      </h1>

      <p className='mb-10 max-w-3xl text-lg text-gray-300 md:text-xl'>
        Report infrastructure issues, track resolutions, and help improve public services through transparent community-driven action.
      </p>

      <div className='flex flex-wrap justify-center gap-4'>
        <Link
          to='/report'
          className='rounded-xl bg-green-600 px-8 py-4 text-lg font-semibold transition hover:bg-green-700'
        >
          Report an Issue
        </Link>

        <Link
          to='/register'
          className='rounded-xl border border-gray-700 px-8 py-4 text-lg font-semibold transition hover:bg-gray-800'
        >
          Join Platform
        </Link>
      </div>

      <div className='mt-20 grid w-full max-w-6xl grid-cols-1 gap-8 md:grid-cols-3'>
        <div className='rounded-2xl bg-gray-900 p-8'>
          <h2 className='mb-3 text-2xl font-bold'>Community Powered</h2>
          <p className='text-gray-400'>
            Citizens actively identify and report local issues.
          </p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-8'>
          <h2 className='mb-3 text-2xl font-bold'>Real-Time Tracking</h2>
          <p className='text-gray-400'>
            Follow issue progress from report to resolution.
          </p>
        </div>

        <div className='rounded-2xl bg-gray-900 p-8'>
          <h2 className='mb-3 text-2xl font-bold'>Administrative Oversight</h2>
          <p className='text-gray-400'>
            Authorities and admins can prioritize and resolve faster.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home