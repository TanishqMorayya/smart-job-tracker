import { useAuth } from '../hooks/useAuth'

// TEMPORARY: the real dashboard (stats and charts) is built in Phase 13.
export default function Dashboard() {
  const { user } = useAuth()
  return (
    <div>
      <div className="page-header">
        <h1>Welcome, {user.fullName}</h1>
        <p className="muted">Your dashboard with stats and charts will appear here.</p>
      </div>
    </div>
  )
}
