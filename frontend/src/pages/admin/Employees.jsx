import { Link, useOutletContext } from 'react-router-dom'

function Employees() {
	const { employees } = useOutletContext()
	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Employees</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">All employees</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">Every employee card is clickable and opens a dedicated profile page.</p>
				</div>
				<Link to="/admin/overview" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to overview
				</Link>
			</div>

			<div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
				{employees.map((employee) => (
					<Link key={employee.id || employee._id} to={`/admin/employees/${employee.id || employee._id}`} className="group rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_18px_44px_rgba(15,23,42,0.12)]">
						<div className="flex items-start justify-between gap-4">
							<div>
								<h3 className="text-lg font-semibold text-slate-950">{employee.name}</h3>
								<p className="mt-1 text-sm text-slate-600">{employee.role} • {employee.branch}</p>
							</div>
							<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 transition group-hover:bg-amber-200">{employee.branchName || employee.branch || '—'}</span>
						</div>
						<p className="mt-3 text-sm font-semibold text-slate-900">{employee.id}</p>
					</Link>
				))}
			</div>
		</section>
	)
}

export default Employees