import { useState } from 'react'
import { useOutletContext, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

function DeleteEmployee() {
	const { employees, setEmployees, branches, setBranches, payrollRows, setPayrollRows } = useOutletContext()
	
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedBranch, setSelectedBranch] = useState('All')
	const [confirmingDelete, setConfirmingDelete] = useState(null) // Holds employee object to delete

	// Filter employees based on search term and branch selection
	const filteredEmployees = employees.filter((emp) => {
		const matchesSearch =
			emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
			emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			emp.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
			emp.department.toLowerCase().includes(searchTerm.toLowerCase())

		const matchesBranch = selectedBranch === 'All' || emp.branch === selectedBranch

		return matchesSearch && matchesBranch
	})

	const handleDeleteConfirm = () => {
		if (!confirmingDelete) return

		const empToDelete = confirmingDelete

		// 1. Remove from employees list
		setEmployees((prev) => prev.filter((emp) => emp.id !== empToDelete.id))

		// 2. Remove from payroll calculations
		setPayrollRows((prev) => prev.filter((row) => row.employeeId !== empToDelete.id))

		// 3. Decrement branch employees count
		setBranches((prev) =>
			prev.map((b) =>
				b.name === empToDelete.branch
					? { ...b, employees: Math.max(0, b.employees - 1) }
					: b
			)
		)

		toast.success(`${empToDelete.name} has been deleted from records.`)
		setConfirmingDelete(null)
	}

	return (
		<section className="relative rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Employee Management</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Delete employee record</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">Search for employees and permanently remove their records from active payroll, lists, and directories.</p>
				</div>
				<Link to="/admin/employees" className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to list
				</Link>
			</div>

			{/* Filters & Search */}
			<div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/60 pb-6">
				<div className="relative flex-1 max-w-md">
					<span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
						</svg>
					</span>
					<input
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search by name, ID, title, or department..."
						className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
					/>
				</div>

				<div className="flex items-center gap-3">
					<span className="text-sm font-semibold text-slate-600">Branch:</span>
					<select
						value={selectedBranch}
						onChange={(e) => setSelectedBranch(e.target.value)}
						className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
					>
						<option value="All">All Branches</option>
						{branches.map((b) => (
							<option key={b.id} value={b.name}>{b.name}</option>
						))}
					</select>
				</div>
			</div>

			{/* Directory List */}
			<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{filteredEmployees.length > 0 ? (
					filteredEmployees.map((employee) => (
						<div key={employee.id} className="group rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5 transition hover:shadow-md">
							<div className="flex items-start gap-4">
								<div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
									<img src={employee.photoUrl} alt={employee.name} className="h-full w-full object-cover" />
								</div>
								<div className="min-w-0 flex-1">
									<h3 className="text-base font-bold text-slate-950 truncate">{employee.name}</h3>
									<p className="text-xs font-semibold text-amber-700 mt-0.5">{employee.id}</p>
									<p className="text-xs text-slate-600 mt-1 truncate">{employee.role} • {employee.department}</p>
									<p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-wider mt-1">{employee.branch}</p>
								</div>
							</div>
							
							<div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
								<span className="rounded-full bg-slate-100 px-3 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-slate-700">{employee.status}</span>
								<button
									type="button"
									onClick={() => setConfirmingDelete(employee)}
									className="rounded-xl bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-700 transition"
								>
									Delete Record
								</button>
							</div>
						</div>
					))
				) : (
					<div className="sm:col-span-2 xl:col-span-3 text-center py-12 rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/50">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-slate-400 mx-auto mb-3">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.197 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
						</svg>
						<p className="text-sm font-semibold text-slate-600">No matching employees found.</p>
						<p className="text-xs text-slate-400 mt-1">Try resetting the branch filter or typing a different search query.</p>
					</div>
				)}
			</div>

			{/* Confirm Modal Backdrop & Container */}
			{confirmingDelete && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
					<div className="w-full max-w-md transform rounded-[2rem] border border-slate-200 bg-white p-6 shadow-2xl transition-all duration-300 scale-100 animate-in fade-in zoom-in-95">
						<div className="flex items-center gap-3 text-rose-600">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
							</svg>
							<h4 className="text-lg font-bold text-slate-900">Confirm Deletion</h4>
						</div>

						<p className="mt-4 text-sm text-slate-600 leading-relaxed">
							Are you sure you want to permanently delete <strong className="text-slate-900">{confirmingDelete.name}</strong> (<strong className="text-slate-800">{confirmingDelete.id}</strong>) from company records?
						</p>

						<div className="mt-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs text-slate-500 space-y-1.5">
							<p className="flex items-center gap-1.5">
								<span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
								Removes employee profile card and document attachments.
							</p>
							<p className="flex items-center gap-1.5">
								<span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
								Clears active payroll row and calculations.
							</p>
							<p className="flex items-center gap-1.5">
								<span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500"></span>
								Decrements the employee count for branch: <strong>{confirmingDelete.branch}</strong>.
							</p>
						</div>

						<div className="mt-6 flex justify-end gap-3">
							<button
								type="button"
								onClick={() => setConfirmingDelete(null)}
								className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
							>
								Cancel
							</button>
							<button
								type="button"
								onClick={handleDeleteConfirm}
								className="rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm"
							>
								Yes, Delete Permanently
							</button>
						</div>
					</div>
				</div>
			)}
		</section>
	)
}

export default DeleteEmployee
