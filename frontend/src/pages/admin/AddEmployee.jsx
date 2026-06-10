import { useState, useEffect } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'

function AddEmployee() {
	const navigate = useNavigate()
	const { employees, setEmployees, branches, setBranches, payrollRows, setPayrollRows } = useOutletContext()

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		contactNumber: '',
		branch: 'Dhaka HQ',
		designation: '',
		department: '',
		workerType: 'Under Kafala',
		salary: '',
		netSalary: '',
		status: 'Active',
	})

	const [docs, setDocs] = useState({
		photo: null,
		photoName: '',
	})

	const [docTitle, setDocTitle] = useState('')
	const [legalDocuments, setLegalDocuments] = useState([])

	// Auto-compute Net Salary as 90% of Gross Salary by default, but allow custom overrides
	useEffect(() => {
		if (formData.salary) {
			const calculated = Math.round(Number(formData.salary) * 0.9)
			setFormData((prev) => ({
				...prev,
				netSalary: prev.netSalary && prev.netSalary !== String(Math.round(Number(prev.salary) * 0.9))
					? prev.netSalary 
					: String(calculated)
			}))
		} else {
			setFormData((prev) => ({ ...prev, netSalary: '' }))
		}
	}, [formData.salary])

	// File to Base64 utility for local state preservation
	const handleFileChange = (e, field) => {
		const file = e.target.files[0]
		if (!file) return

		const reader = new FileReader()
		reader.onloadend = () => {
			setDocs((prev) => ({
				...prev,
				[field]: reader.result,
				[`${field}Name`]: file.name,
			}))
			toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} document uploaded.`)
		}
		reader.readAsDataURL(file)
	}

	const handleLegalDocUpload = (e) => {
		const file = e.target.files[0]
		if (!file) return

		if (!docTitle.trim()) {
			toast.error('Please enter a document title before uploading.')
			e.target.value = ''
			return
		}

		const reader = new FileReader()
		reader.onloadend = () => {
			setLegalDocuments((prev) => [
				...prev,
				{
					id: `doc-${Date.now()}`,
					title: docTitle.trim(),
					fileName: file.name,
					dataUrl: reader.result,
				},
			])
			setDocTitle('')
			toast.success(`"${docTitle.trim()}" added to legal documents vault.`)
		}
		reader.readAsDataURL(file)
		e.target.value = ''
	}

	const removeLegalDoc = (id) => {
		setLegalDocuments((prev) => prev.filter((doc) => doc.id !== id))
		toast.success('Document removed from vault.')
	}

	const handleSubmit = (e) => {
		e.preventDefault()

		// Validations
		if (!formData.name.trim()) return toast.error('Name is required')
		if (!formData.email.trim()) return toast.error('Email is required')
		if (!formData.contactNumber.trim()) return toast.error('Contact Number is required')
		if (!formData.designation.trim()) return toast.error('Designation is required')
		if (!formData.department.trim()) return toast.error('Department is required')
		if (!formData.salary || isNaN(formData.salary)) return toast.error('Valid Salary is required')

		// Generate dynamic Employee ID
		const numericIds = employees
			.map((emp) => parseInt(emp.id.replace('e-', ''), 10))
			.filter((num) => !isNaN(num))
		const nextNumericId = numericIds.length > 0 ? Math.max(...numericIds) + 1 : 101
		const newEmployeeId = `e-${nextNumericId}`

		// Create default avatar SVG if none provided
		const fallbackAvatar = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23f59e0b"/><stop offset="1" stop-color="%231d4ed8"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>`

		const newEmployee = {
			id: newEmployeeId,
			name: formData.name,
			email: formData.email,
			contactNumber: formData.contactNumber,
			company: 'Bin Mishal Travells',
			branch: formData.branch,
			department: formData.department,
			role: formData.designation,
			workerType: formData.workerType,
			salary: Number(formData.salary),
			netSalary: Number(formData.netSalary),
			status: formData.status,
			photoUrl: docs.photo || fallbackAvatar,
			legalDocuments,
			promotionHistory: [
				{ year: new Date().getFullYear(), salary: Number(formData.salary), title: formData.designation }
			]
		}

		// Update Employees State
		setEmployees((prev) => [...prev, newEmployee])

		// Increment Branch Count
		setBranches((prev) =>
			prev.map((b) =>
				b.name === formData.branch
					? { ...b, employees: b.employees + 1 }
					: b
			)
		)

		// Create and add default Payroll Row
		const newPayrollRow = {
			employeeId: newEmployeeId,
			name: formData.name,
			branch: formData.branch,
			dailyFee: Math.round(Number(formData.salary) / 30),
			presentDays: 25,
			leaveDays: 1,
			absentDays: 4,
			overtimeHours: 10,
			incentive: 0,
			bonus: 0,
			fine: 0,
			fineWaived: 0,
			loan: 0,
			loanPaid: 0,
			gross: Number(formData.salary),
			deduction: Math.round(Number(formData.salary) * 0.1),
			net: Number(formData.netSalary),
			attendance: ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'L', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P', 'P', 'P', 'P', 'P', 'A', 'P', 'P', 'P', 'P'],
		}
		setPayrollRows((prev) => [...prev, newPayrollRow])

		toast.success(`Successfully onboarded ${formData.name}!`)
		navigate('/admin/employees')
	}

	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Employee Management</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Add new employee</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">Onboard a new employee to the system with their personal information, branch assignments, legal document vault, and salaries.</p>
				</div>
				<Link to="/admin/employees" className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Cancel & Back
				</Link>
			</div>

			<form className="mt-8 space-y-8" onSubmit={handleSubmit}>
				{/* Part 1: Profile Image Drag-and-Drop */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/60 p-6">
					<h3 className="text-base font-semibold text-slate-900">1. Avatar & Profile Photo</h3>
					<p className="mt-1 text-sm text-slate-500">Provide a profile picture to help identify the employee across branch rosters and payroll sheets.</p>
					
					<div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
						<div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[1.8rem] border-2 border-dashed border-slate-300 bg-slate-100 shadow-inner flex items-center justify-center">
							{docs.photo ? (
								<img src={docs.photo} alt="Preview" className="h-full w-full object-cover" />
							) : (
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-slate-400">
									<path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
								</svg>
							)}
						</div>
						<div className="flex-1 w-full">
							<label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-amber-400 bg-white rounded-2xl p-5 cursor-pointer transition hover:bg-amber-50/30 group">
								<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-400 group-hover:text-amber-500 transition mb-2">
									<path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
								</svg>
								<span className="text-sm font-semibold text-slate-700">Click to upload photo</span>
								<span className="text-xs text-slate-400 mt-1">PNG, JPG or SVG (Max 1MB)</span>
								<input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'photo')} />
							</label>
							{docs.photoName && (
								<p className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-1">
									<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									{docs.photoName}
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Part 2: Personal Info */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">2. Personal Information</h3>
					
					<div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Full Name *
							<input
								required
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder="John Doe"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Email Address *
							<input
								required
								type="email"
								value={formData.email}
								onChange={(e) => setFormData({ ...formData, email: e.target.value })}
								placeholder="john.doe@company.com"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Contact Number *
							<input
								required
								value={formData.contactNumber}
								onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
								placeholder="+880 1712-345678"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>
					</div>
				</div>

				{/* Part 3: Job Hierarchy & Salaries */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">3. Workspace & Assignment</h3>
					
					<div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Branch Assignment *
							<select
								value={formData.branch}
								onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							>
								{branches.map((b) => (
									<option key={b.id} value={b.name}>{b.name}</option>
								))}
							</select>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Department *
							<input
								required
								value={formData.department}
								onChange={(e) => setFormData({ ...formData, department: e.target.value })}
								placeholder="e.g. Operations, Finance"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Designation / Role *
							<input
								required
								value={formData.designation}
								onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
								placeholder="e.g. Officer, Lead Developer"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Worker Type *
							<select
								value={formData.workerType}
								onChange={(e) => setFormData({ ...formData, workerType: e.target.value })}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							>
								<option>Under Kafala</option>
								<option>Outside Kafala</option>
								<option>Sariatul Binmishal</option>
							</select>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Gross Salary (Monthly) *
							<input
								required
								type="number"
								value={formData.salary}
								onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
								placeholder="e.g. 50000"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Net Salary (Monthly)
							<input
								type="number"
								value={formData.netSalary}
								onChange={(e) => setFormData({ ...formData, netSalary: e.target.value })}
								placeholder="e.g. 45000"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>
					</div>
				</div>

				{/* Part 4: Legal Documents Vault */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">4. Legal Documents Vault</h3>
					<p className="mt-1 text-sm text-slate-500">Add regulatory documents with a title — passport, visa, work permit, or any other legal file. Use the same upload to add as many as needed.</p>

					<div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Document Title
							<input
								value={docTitle}
								onChange={(e) => setDocTitle(e.target.value)}
								placeholder="e.g. Passport, Visa, Work Permit"
								className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="mt-4 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-amber-400 bg-white rounded-xl p-5 cursor-pointer transition hover:bg-amber-50/10 group">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-slate-400 group-hover:text-amber-500 mb-2">
								<path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
							</svg>
							<span className="text-sm font-semibold text-slate-700">Click to upload document image</span>
							<span className="text-xs text-slate-400 mt-1">PNG, JPG or JPEG — enter a title first</span>
							<input type="file" accept="image/*" className="hidden" onChange={handleLegalDocUpload} />
						</label>
					</div>

					{legalDocuments.length > 0 && (
						<div className="mt-5 space-y-3">
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
								Uploaded documents ({legalDocuments.length})
							</p>
							{legalDocuments.map((doc) => (
								<div key={doc.id} className="flex items-center gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-3">
									<div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
										<img src={doc.dataUrl} alt={doc.title} className="h-full w-full object-cover" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
										<p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
									</div>
									<span className="shrink-0 text-[0.65rem] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">Uploaded</span>
									<button
										type="button"
										onClick={() => removeLegalDoc(doc.id)}
										className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
									>
										Remove
									</button>
								</div>
							))}
						</div>
					)}
				</div>

				{/* Submit Button wrapper */}
				<div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
					<Link to="/admin/employees" className="rounded-2xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
						Cancel
					</Link>
					<button
						type="submit"
						className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.24)]"
					>
						Complete Onboarding
					</button>
				</div>
			</form>
		</section>
	)
}

export default AddEmployee
