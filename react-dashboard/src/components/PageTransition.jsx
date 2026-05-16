import { useLocation, Outlet } from 'react-router-dom'

export default function PageTransition() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="page-transition">
      <Outlet />
    </div>
  )
}
