import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface LoginResponse {
  access_token: string;
  token_type: string;
  role: string;
}

export const LoginForm = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    try {
      // FastAPI OAuth2 uses form data, not JSON
      const formData = new FormData()
      formData.append('username', username)
      formData.append('password', password)
      
      const response = await fetch('http://localhost:8000/auth/token', {
        method: 'POST',
        body: formData,
      })
      
      if (response.ok) {
        const data = await response.json() as LoginResponse
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('role', data.role)
        navigate('/dashboard')
      } else {
        const errorData = await response.json().catch(() => ({}))
        setError(errorData.detail || 'Invalid username or password')
      }
    } catch (error) {
      console.error('Login failed:', error)
      setError('An error occurred during login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}