
import { useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AccessControl from './pages/admin/AccessControl.jsx'
import AdminOverview from './pages/admin/Overview.jsx'
import BranchProfile from './pages/admin/BranchProfile.jsx'
import Branches from './pages/admin/Branches.jsx'
import EmployeeProfile from './pages/admin/EmployeeProfile.jsx'
import Employees from './pages/admin/Employees.jsx'
import Payroll from './pages/admin/Payroll.jsx'
import LoginPage from './pages/login.jsx'
import RegisterPage from './pages/register.jsx'
import AddEmployee from './pages/admin/AddEmployee.jsx'
import DeleteEmployee from './pages/admin/DeleteEmployee.jsx'
import { Toaster } from 'react-hot-toast'

function App() {
  const [session, setSession] = useState(() => {
    const saved = localStorage.getItem('session')
    return saved ? JSON.parse(saved) : null
  })
  const navigate = useNavigate()

  function handleLogin(userSession) {
    setSession(userSession)
    localStorage.setItem('session', JSON.stringify(userSession))

    if (userSession.role === 'admin') {
      navigate('/admin/overview', { replace: true })
      return
    }

    navigate(userSession.role === 'branchManager' ? '/branch-manager' : '/employee', { replace: true })
  }

  function handleLogout() {
    setSession(null)
    localStorage.removeItem('session')
    navigate('/login', { replace: true })
  }

  function renderRoleLanding(role) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(180deg,_#fffaf3_0%,_#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-4xl items-center justify-center">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-8 text-center shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl sm:p-10">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">
              Access granted
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
              {role === 'branchManager' ? 'Branch manager dashboard is next.' : 'Employee dashboard is next.'}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              You are signed in as {role}. The separate routed pages are active for admin users.
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={session?.role ? <Navigate to={session.role === 'admin' ? '/admin/overview' : session.role === 'branchManager' ? '/branch-manager' : '/employee'} replace /> : <LoginPage onCreateAccount={() => navigate('/register')} onLogin={handleLogin} />}
        />
        <Route
          path="/register"
          element={session?.role ? <Navigate to={session.role === 'admin' ? '/admin/overview' : session.role === 'branchManager' ? '/branch-manager' : '/employee'} replace /> : <RegisterPage onBackToLogin={() => navigate('/login')} />}
        />
        <Route
          path="/admin"
          element={session?.role === 'admin' ? <AdminLayout role={session.role} onLogout={handleLogout} /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminOverview />} />
          <Route path="branches" element={<Branches />} />
          <Route path="branches/:branchId" element={<BranchProfile />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/:employeeId" element={<EmployeeProfile />} />
          <Route path="employee-management/add" element={<AddEmployee />} />
          <Route path="employee-management/delete" element={<DeleteEmployee />} />
          <Route path="payroll" element={<Payroll />} />
          <Route path="access-control" element={<AccessControl />} />
        </Route>
        <Route path="/branch-manager" element={renderRoleLanding('branchManager')} />
        <Route path="/employee" element={renderRoleLanding('employee')} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}

export default App
