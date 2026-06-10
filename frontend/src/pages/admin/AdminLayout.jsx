import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import Header from '../../components/header.jsx'
import {
	branches as fallbackBranches,
	employees as fallbackEmployees,
	payrollRows as fallbackPayroll,
} from './adminData.js'
import { employeeApi, payrollApi, branchApi } from '../../services/payrollApi.js'

const navItems = [
	{ to: '/admin/overview', label: 'Overview' },
	{ to: '/admin/branches', label: 'Branches' },
	{ to: '/admin/employees', label: 'Employees' },
]

const endNavItems = [
	{ to: '/admin/payroll', label: 'Company Payroll' },
	{ to: '/admin/access-control', label: 'Admin Functions' },
]

function AdminLayout({ role, onLogout }) {
	const location = useLocation()
	const isEmpMgmtRoute = location.pathname.includes('/admin/employee-management')
	const [empMenuOpen, setEmpMenuOpen] = useState(isEmpMgmtRoute)

	const [employees, setEmployees] = useState(fallbackEmployees)
	const [branches, setBranches] = useState(fallbackBranches)
	const [payrollRows, setPayrollRows] = useState(fallbackPayroll)

	useEffect(() => {
		employeeApi.getAll()
			.then((res) => { if (res.data?.data) setEmployees(res.data.data) })
			.catch(() => {})
		branchApi.getAll()
			.then((res) => { if (res.data?.data) setBranches(res.data.data) })
			.catch(() => {})
		const now = new Date()
		payrollApi.getAll(now.getMonth() + 1, now.getFullYear())
			.then((res) => { if (res.data?.data) setPayrollRows(res.data.data) })
			.catch(() => {})
	}, [])

	useEffect(() => {
		if (isEmpMgmtRoute) setEmpMenuOpen(true)
	}, [isEmpMgmtRoute])

	return (
		<div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.2),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.14),_transparent_30%),linear-gradient(180deg,_#fff9f1_0%,_#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-8">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-6rem] top-[-5rem] h-72 w-72 rounded-full bg-amber-300/25 blur-3xl" />
				<div className="absolute right-[-5rem] top-28 h-80 w-80 rounded-full bg-sky-300/18 blur-3xl" />
				<div className="absolute bottom-[-7rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-300/14 blur-3xl" />
			</div>
			<div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-6">
				<Header />

				<div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
					<aside className="rounded-[2rem] border border-white/70 bg-white/75 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl flex flex-col">
						<div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 px-4 py-5 text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)]">
							<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-200/90">Dashboard</p>
							<h2 className="mt-2 text-2xl font-semibold tracking-tight">Admin panel</h2>
							<p className="mt-2 text-sm leading-6 text-slate-300">Signed in as {role}. Manage branches, employees, payroll, and access controls.</p>
						</div>

						<nav className="mt-5 grid gap-2">
							{navItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									className={({ isActive }) =>
										`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950 hover:shadow-sm'}`
									}
								>
									{item.label}
								</NavLink>
							))}

							<div className="flex flex-col gap-1">
								<button
									type="button"
									onClick={() => setEmpMenuOpen(!empMenuOpen)}
									className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${isEmpMgmtRoute
										? 'bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]'
										: 'bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950 hover:shadow-sm'
										}`}
								>
									<span>Employee Management</span>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 20 20"
										fill="currentColor"
										className={`h-5 w-5 transform transition-transform duration-200 ${empMenuOpen ? 'rotate-180' : ''
											}`}
									>
										<path
											fillRule="evenodd"
											d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
											clipRule="evenodd"
										/>
									</svg>
								</button>
								<div
									className={`grid transition-all duration-300 ease-in-out ${empMenuOpen
										? 'grid-rows-[1fr] opacity-100 mt-1 max-h-[150px]'
										: 'grid-rows-[0fr] opacity-0 max-h-0 overflow-hidden pointer-events-none'
										}`}
								>
									<div className="overflow-hidden flex flex-col gap-1.5 pl-4 border-l-2 border-amber-300/50 py-1">
										<NavLink
											to="/admin/employee-management/add"
											className={({ isActive }) =>
												`rounded-xl px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition ${isActive
													? 'bg-amber-500 text-white shadow-sm'
													: 'bg-slate-50/60 text-slate-600 hover:bg-amber-50 hover:text-slate-950'
												}`
											}
										>
											Add Employee
										</NavLink>
										<NavLink
											to="/admin/employee-management/delete"
											className={({ isActive }) =>
												`rounded-xl px-4 py-2.5 text-left text-xs font-bold uppercase tracking-wider transition ${isActive
													? 'bg-rose-500 text-white shadow-sm'
													: 'bg-slate-50/60 text-slate-600 hover:bg-rose-50 hover:text-rose-950'
												}`
											}
										>
											Delete Employee
										</NavLink>
									</div>
								</div>
							</div>

							{endNavItems.map((item) => (
								<NavLink
									key={item.to}
									to={item.to}
									className={({ isActive }) =>
										`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-slate-950 text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)]' : 'bg-slate-50 text-slate-700 hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950 hover:shadow-sm'}`
									}
								>
									{item.label}
								</NavLink>
							))}
						</nav>

						<button
							type="button"
							onClick={onLogout}
							className="mt-auto w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
						>
							Logout
						</button>
					</aside>

					<main className="min-w-0 space-y-6">
						<Outlet context={{ employees, setEmployees, branches, setBranches, payrollRows, setPayrollRows }} />
					</main>
				</div>
			</div>
		</div>
	)
}

export default AdminLayout
