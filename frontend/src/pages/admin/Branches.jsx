import { Link, useOutletContext } from 'react-router-dom'

function Branches() {
	const { branches } = useOutletContext()
	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Branches</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">All branches</h2>
					<p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Select any branch to open its profile, view its activity log, and jump into the employee list inside that branch.</p>
				</div>
				<Link to="/admin/overview" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to overview
				</Link>
			</div>

			<div className="mt-5 grid gap-4 lg:grid-cols-3">
				{branches.map((branch) => (
					<Link key={branch.id} to={`/admin/branches/${branch.id}`} className="group rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 text-left transition hover:-translate-y-1 hover:border-amber-200 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
						<div className="flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{branch.city}</p>
								<h3 className="mt-2 text-lg font-semibold text-slate-950">{branch.name}</h3>
							</div>
							<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 transition group-hover:bg-amber-200">{branch.status}</span>
						</div>
						<p className="mt-2 text-sm text-slate-600">Manager: {branch.manager}</p>
						<p className="mt-4 text-sm font-semibold text-slate-900">{branch.employees} employees</p>
						<p className="mt-4 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700/80">Open branch</p>
					</Link>
				))}
			</div>
		</section>
	)
}

export default Branches