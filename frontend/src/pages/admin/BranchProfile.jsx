import { Link, useParams, useOutletContext } from 'react-router-dom'

function BranchProfile() {
	const { branchId } = useParams()
	const { branches, employees } = useOutletContext()
	const branch = branches.find((item) => item.id === branchId) ?? branches[0]
	const branchEmployees = employees.filter((employee) => employee.branch === branch.name)

	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Branch detail</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{branch.name}</h2>
					<p className="mt-2 text-sm text-slate-600">Manager: {branch.manager} • {branch.city}</p>
					<p className="mt-2 text-sm leading-6 text-slate-500">Review the full branch activity feed and jump into any employee profile from this branch.</p>
				</div>
				<Link to="/admin/branches" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to branches
				</Link>
			</div>

			<div className="mt-6 grid gap-4 sm:grid-cols-3">
				<div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
					<p className="text-sm text-slate-500">Employees</p>
					<p className="mt-2 text-2xl font-semibold text-slate-950">{branch.employees}</p>
				</div>
				<div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
					<p className="text-sm text-slate-500">Branch status</p>
					<p className="mt-2 text-2xl font-semibold text-slate-950">{branch.status}</p>
				</div>
				<div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
					<p className="text-sm text-slate-500">Activities</p>
					<p className="mt-2 text-2xl font-semibold text-slate-950">{branch.activity.length}</p>
				</div>
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
				<div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
					<p className="text-sm font-semibold text-slate-900">Recent branch activities</p>
					<ul className="mt-3 space-y-3">
						{branch.activity.map((item) => (
							<li key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">{item}</li>
						))}
					</ul>
				</div>

				<div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
					<p className="text-sm font-semibold text-slate-900">Employee list</p>
					<div className="mt-3 grid gap-3">
						{branchEmployees.map((employee) => (
							<Link key={employee.id} to={`/admin/employees/${employee.id}`} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-md">
								<p className="font-semibold text-slate-950">{employee.name}</p>
								<p className="text-sm text-slate-600">{employee.role} • {employee.status}</p>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	)
}

export default BranchProfile