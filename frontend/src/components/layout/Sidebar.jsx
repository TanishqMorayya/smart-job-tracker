import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/applications', label: 'Applications' },
  { to: '/companies', label: 'Companies' },
  { to: '/interviews', label: 'Interviews' },
  { to: '/profile', label: 'Profile' },
]

export default function Sidebar({ open, onNavigate }) {
  return (
    <nav className={`sidebar ${open ? 'open' : ''}`}>
      {LINKS.map((link) => (
        <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate}>
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
