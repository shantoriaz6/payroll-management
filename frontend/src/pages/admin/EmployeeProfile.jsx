import { Link, useParams, useOutletContext } from 'react-router-dom'
import { formatCurrency } from './adminData.js'

	function EmployeeProfile() {
	const { employeeId } = useParams()
	const { employees } = useOutletContext()
	const employee = employees.find((item) => (item.id || item._id) === employeeId) ?? employees[0]
	const netSalary = employee.netSalary ?? employee.salary ?? 0

	const detailCards = [
		{ label: 'Employee ID', value: employee.id || employee._id },
		{ label: 'Company', value: employee.company ?? 'Bin Mishal Travells' },
		{ label: 'Branch', value: employee.branch },
		{ label: 'Department', value: employee.department ?? '—' },
		{ label: 'Worker Type', value: employee.workerType ?? '—' },
		{ label: 'Status', value: employee.status },
	]
	const promotionHistory = employee.promotionHistory ?? []

	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center">
					<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.8rem] border border-slate-200 bg-slate-100 shadow-lg">
						{employee.photoUrl ? (
							<img src={employee.photoUrl} alt={employee.name} className="h-full w-full object-cover" />
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 to-blue-600 text-4xl font-bold text-white">
								{employee.name?.charAt(0)?.toUpperCase()}
							</div>
						)}
					</div>
					<div>
						<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Employee profile</p>
						<h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{employee.name}</h2>
						<p className="mt-2 text-sm text-slate-600">{employee.role || employee.designation || '—'} • {employee.branch || employee.branchName || '—'}</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">{employee.workerType}</span>
							<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-amber-800">{employee.department}</span>
							<span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">{employee.status}</span>
						</div>
					</div>
				</div>
				<Link to="/admin/employees" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to employees
				</Link>
			</div>

			<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{detailCards.map((item) => (
					<div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4 shadow-sm">
						<p className="text-sm text-slate-500">{item.label}</p>
						<p className="mt-2 text-lg font-semibold text-slate-950">{item.value}</p>
					</div>
				))}
			</div>

			<div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
				<div className="rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Net salary</p>
					<div className="mt-4 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5">
						<p className="text-sm text-emerald-800">Current monthly net salary</p>
						<p className="mt-3 text-4xl font-semibold tracking-tight text-emerald-950">{formatCurrency(netSalary)}</p>
						<p className="mt-2 text-sm leading-6 text-emerald-900/80">This is the current amount paid to the employee after adjustments already stored in the profile data.</p>
					</div>

					<div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
						<p className="text-sm font-semibold text-slate-900">Company Investment</p>
						<p className="mt-2 text-2xl font-semibold text-slate-950">{formatCurrency(employee.companyInvestment ?? 0)}</p>
						<p className="mt-2 text-sm leading-6 text-slate-600">The amount the company has invested for this employee.</p>
					</div>

					<div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
						<p className="text-sm font-semibold text-slate-900">Employee snapshot</p>
						<p className="mt-2 text-sm leading-7 text-slate-600">
							{employee.name} works as a {employee.role || employee.designation || '—'} in {employee.branch || employee.branchName || '—'} under {(employee.workerType || employee.kafalaStatus || '—').toLowerCase()}.
						</p>
					</div>
				</div>

				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
					<div className="flex items-start justify-between gap-3">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Promotion history</p>
							<h3 className="mt-2 text-xl font-semibold text-slate-900">Yearly promotion and salary changes</h3>
						</div>
					</div>

					<div className="mt-5 space-y-3">
						{promotionHistory.map((entry) => (
							<div key={`${entry.year}-${entry.title}`} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{entry.year}</p>
									<p className="mt-1 text-base font-semibold text-slate-950">{entry.title}</p>
								</div>
								<p className="text-lg font-semibold text-slate-900">{formatCurrency(entry.salary)}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{employee.legalDocuments?.length > 0 && (
				<div className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Legal documents vault</p>
					<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{employee.legalDocuments.map((doc, i) => (
							<div key={doc._id || i} className="overflow-hidden rounded-[1.25rem] border border-slate-200 bg-slate-50">
								<img src={doc.url || doc.dataUrl} alt={doc.title} className="h-40 w-full object-cover" />
								<div className="p-3">
									<p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
									<p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</section>
	)
}

export default EmployeeProfile