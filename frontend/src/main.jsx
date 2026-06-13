
import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {QueryClient,QueryClientProvider} from '@tanstack/react-query'
import {Toaster} from 'react-hot-toast'
import App from './App'
import './index.css'

const query_client=new QueryClient({
  defaultOptions:{
    queries:{
      refetchOnWindowFocus:false,
      retry:1
    }
  }
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={query_client}>
      <App/>
      <Toaster
        position='top-right'
        toastOptions={{
          duration:3000
        }}
      />
    </QueryClientProvider>
  </StrictMode>
)