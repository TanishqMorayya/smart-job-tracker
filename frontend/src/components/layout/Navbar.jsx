import { useAuth } from '../../hooks/useAuth'

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth()
  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="menu-btn" onClick={onToggleSidebar} aria-label="Toggle menu">
          &#9776;
        </button>
        <span className="brand">Smart Job Tracker</span>
      </div>
      <div className="navbar-right">
        <span className="user-name">{user.fullName}</span>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Log out</button>
      </div>
    </header>
  )
}
