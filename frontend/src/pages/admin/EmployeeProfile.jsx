import { Link, useParams, useOutletContext } from 'react-router-dom'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { formatCurrency } from './adminData.js'
import { employeeApi } from '../../services/payrollApi.js'

function EmployeeProfile() {
	const { employeeId } = useParams()
	const { employees } = useOutletContext()
	const [employee, setEmployee] = useState(
		employees.find((item) => (item.id || item._id) === employeeId) || null
	)
	const [newPromo, setNewPromo] = useState({ year: '', title: '', salary: '' })

	useEffect(() => {
		const fromContext = employees.find((item) => (item.id || item._id) === employeeId)
		if (fromContext) {
			setEmployee(fromContext)
			return
		}
		employeeApi.getById(employeeId)
			.then((res) => { if (res.data?.data) setEmployee(res.data.data) })
			.catch(() => {})
	}, [employeeId, employees])

	if (!employee) {
		return (
			<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
				<div className="flex flex-col items-center justify-center py-20">
					<p className="text-sm font-semibold uppercase tracking-[0.34em] text-slate-400">Employee profile</p>
					<p className="mt-4 text-2xl font-semibold text-slate-600">Employee not found</p>
					<Link to="/admin/employees" className="mt-6 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-amber-50">
						Back to employees
					</Link>
				</div>
			</section>
		)
	}

	const netSalary = employee.netSalary ?? employee.salary ?? 0

	const detailCards = [
		{ label: 'Employee ID', value: employee.id || employee._id },
		{ label: 'Company', value: employee.company ?? 'Bin Mishal Travells' },
		{ label: 'Branch', value: employee.branchName || employee.branch || '—' },
		{ label: 'Department', value: employee.department || '—' },
		{ label: 'Worker Type', value: employee.kafalaStatus || employee.workerType || '—' },
		{ label: 'Status', value: employee.status || 'Active' },
	]
	const promotionHistory = employee.promotionHistory ?? []

	const handleAddPromotion = async () => {
		if (!newPromo.year || !newPromo.title || !newPromo.salary) {
			return toast.error('Please fill year, title and salary')
		}
		const updated = [
			...promotionHistory,
			{ year: Number(newPromo.year), title: newPromo.title, salary: Number(newPromo.salary) },
		]
		try {
			const res = await employeeApi.update(employee._id, { promotionHistory: updated })
			if (res.data?.data) setEmployee(res.data.data)
			setNewPromo({ year: '', title: '', salary: '' })
			toast.success('Promotion added')
		} catch {
			toast.error('Failed to save')
		}
	}

	const handleDeletePromotion = async (index) => {
		const updated = promotionHistory.filter((_, i) => i !== index)
		try {
			const res = await employeeApi.update(employee._id, { promotionHistory: updated })
			if (res.data?.data) setEmployee(res.data.data)
			toast.success('Entry removed')
		} catch {
			toast.error('Failed to save')
		}
	}

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
						<p className="mt-2 text-sm text-slate-600">{employee.role || employee.designation || '—'} • {employee.branchName || employee.branch || '—'}</p>
						<div className="mt-4 flex flex-wrap gap-2">
							<span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">{employee.kafalaStatus || employee.workerType}</span>
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
							{employee.name} works as a {employee.role || employee.designation || '—'} in {employee.branchName || employee.branch || '—'} under {(employee.kafalaStatus || employee.workerType || '—').toLowerCase()}.
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

					<div className="mt-5 grid grid-cols-3 gap-3">
						<input
							type="number"
							placeholder="Year"
							value={newPromo.year}
							onChange={(e) => setNewPromo({ ...newPromo, year: e.target.value })}
							className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
						/>
						<input
							placeholder="Title / Post"
							value={newPromo.title}
							onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
							className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
						/>
						<input
							type="number"
							placeholder="Salary"
							value={newPromo.salary}
							onChange={(e) => setNewPromo({ ...newPromo, salary: e.target.value })}
							className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-amber-400"
						/>
					</div>
					<button
						onClick={handleAddPromotion}
						className="mt-3 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
					>
						Add Promotion
					</button>

					<div className="mt-5 space-y-3">
						{promotionHistory.map((entry, i) => (
							<div key={`${entry.year}-${entry.title}-${i}`} className="flex items-center justify-between gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4">
								<div>
									<p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{entry.year}</p>
									<p className="mt-1 text-base font-semibold text-slate-950">{entry.title}</p>
								</div>
								<div className="flex items-center gap-3">
									<p className="text-lg font-semibold text-slate-900">{formatCurrency(entry.salary)}</p>
									<button
										onClick={() => handleDeletePromotion(i)}
										className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
									>
										Delete
									</button>
								</div>
							</div>
						))}
						{promotionHistory.length === 0 && (
							<p className="text-center text-sm text-slate-400 py-6">No promotions recorded yet. Add one above.</p>
						)}
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