import { Link, useOutletContext } from 'react-router-dom'
import { formatCurrency, initialAccessRequests } from './adminData.js'

function Overview() {
	const { employees, branches, payrollRows } = useOutletContext()
	const totalEmployees = employees.length
	const companyPayrollTotal = payrollRows.reduce((sum, row) => sum + row.net, 0)

	return (
		<div className="grid gap-6">
			<section className="grid gap-4 grid-cols-1 md:grid-cols-2">
				<Link to="/admin/branches" className="group block rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-medium text-slate-500">Branches</p>
					<p className="mt-3 text-3xl font-semibold text-slate-950">{branches.length}</p>
					<p className="mt-2 text-sm text-slate-600">All active branches in one view.</p>
					<div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-300 to-sky-300" />
				</Link>
				<Link to="/admin/employees" className="group block rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-medium text-slate-500">Total Employees</p>
					<p className="mt-3 text-3xl font-semibold text-slate-950">{totalEmployees}</p>
					<p className="mt-2 text-sm text-slate-600">Employees across all branches.</p>
					<div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-sky-300 to-indigo-300" />
				</Link>
				<Link to="/admin/payroll" className="group block rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-medium text-slate-500">Company Payroll</p>
					<p className="mt-3 text-3xl font-semibold text-slate-950">{formatCurrency(companyPayrollTotal)}</p>
					<p className="mt-2 text-sm text-slate-600">Current net payroll total.</p>
					<div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-emerald-300 to-teal-300" />
				</Link>
				<Link to="/admin/access-control" className="group block rounded-[1.75rem] border border-slate-200/80 bg-white/85 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)]">
					<p className="text-sm font-medium text-slate-500">Access Requests</p>
					<p className="mt-3 text-3xl font-semibold text-slate-950">{initialAccessRequests.length}</p>
					<p className="mt-2 text-sm text-slate-600">Role approvals waiting for admin action.</p>
					<div className="mt-4 h-1 w-16 rounded-full bg-gradient-to-r from-amber-300 to-rose-300" />
				</Link>
			</section>

			{/*<section className="grid gap-6">
				<div className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
					<div className="flex items-start justify-between gap-4">
						<div>
							<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Branches</p>
							<h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Branch directory</h3>
							<p className="mt-2 text-sm text-slate-600">Open any branch to see its employee list and activity feed.</p>
						</div>
					</div>

					<div className="mt-5 grid gap-4 lg:grid-cols-3">
						{branches.map((branch) => (
							<Link key={branch.id} to={`/admin/branches/${branch.id}`} className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{branch.city}</p>
										<h4 className="mt-2 text-lg font-semibold text-slate-950">{branch.name}</h4>
									</div>
									<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{branch.status}</span>
								</div>
								<p className="mt-3 text-sm text-slate-600">Manager: {branch.manager}</p>
								<p className="mt-4 text-sm font-semibold text-slate-900">{branch.employees} employees</p>
							</Link>
						))}
					</div>
				</div>
			</section>*/}
		</div>
	)
}

export default Overview