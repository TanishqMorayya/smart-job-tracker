import ProfileForm from '../components/profile/ProfileForm'
import PasswordForm from '../components/profile/PasswordForm'

export default function Profile() {
  return (
    <div>
      <div className="page-header">
        <h1>Profile</h1>
        <p className="muted">Manage your account details and password.</p>
      </div>
      <div className="profile-layout">
        <ProfileForm />
        <PasswordForm />
      </div>
    </div>
  )
}
