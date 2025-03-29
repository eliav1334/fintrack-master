import axios, { AxiosResponse, AxiosError } from 'axios'
import { toast } from '@/components/ui/use-toast'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const message = error.response?.data?.message || 'An error occurred'
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive'
    })
    return Promise.reject(error)
  }
)

export default api 