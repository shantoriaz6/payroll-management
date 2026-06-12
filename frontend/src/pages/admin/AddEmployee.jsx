import { useState } from 'react'
import { useNavigate, useOutletContext, Link } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { employeeApi, payrollApi } from '../../services/payrollApi.js'

function getMonthDays(month, year) {
	return new Date(year, month, 0).getDate()
}

function recalcRow(fields) {
	const wd = fields.workingDays ?? 0
	const ad = fields.absentDays ?? 0
	const basic = fields.basic ?? 0
	const hr = fields.houseRent ?? 0
	const fd = fields.food ?? 0
	const comm = fields.commission ?? 0
	const la = fields.loanAdjust ?? 0
	const iq = fields.iqamaCost ?? 0
	const fn = fields.fine ?? 0
	const bp = fields.bankPay ?? 0
	const al = fields.advanceLoan ?? 0
	const monthDays = getMonthDays(fields.month ?? (new Date().getMonth() + 1), fields.year ?? new Date().getFullYear())
	const presentDays = wd - ad
	const perDayRate = (fields.perDayPayment ?? 0) > 0 ? fields.perDayPayment : 0
	const perDaysSalary = perDayRate > 0 ? perDayRate : (monthDays > 0 ? +(basic / monthDays).toFixed(2) : 0)
	const overTime = fields.overTime ?? 0
	const grossSalary = +(basic + hr + fd + comm + overTime).toFixed(2)
	const absentCost = +(ad * perDaysSalary).toFixed(2)
	const totalDeduction = +(la + absentCost + iq + fn).toFixed(2)
	const netSalary = +(grossSalary - totalDeduction - bp).toFixed(2)
	const remainingLoan = +(al - la).toFixed(2)
	return { presentDays, perDaysSalary, overTime, grossSalary, absentCost, totalDeduction, netSalary, remainingLoan }
}

function AddEmployee() {
	const navigate = useNavigate()
	const { employees, setEmployees, branches, setBranches, payrollRows, setPayrollRows } = useOutletContext()

	const now = new Date()
	const currentMonth = now.getMonth() + 1
	const currentYear = now.getFullYear()

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		contactNumber: '',
		branch: 'Dhaka HQ',
		designation: '',
		department: '',
		joiningDate: '',
		kafalaStatus: 'Under Kafala',
		basic: 0,
		houseRent: 0,
		food: 0,
		commission: 0,
		perDayPayment: 0,
	})

	const [docs, setDocs] = useState({
		photoUrl: null,
		photoFile: null,
	})

	const [docTitle, setDocTitle] = useState('')
	const [legalDocuments, setLegalDocuments] = useState([])

	const handleFileChange = (e, field) => {
		const file = e.target.files[0]
		if (!file) return
		setDocs((prev) => ({
			...prev,
			[field]: file,
		}))
		toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} document uploaded.`)
	}

	const handleLegalDocUpload = (e) => {
		const file = e.target.files[0]
		if (!file) return

		if (!docTitle.trim()) {
			toast.error('Please enter a document title before uploading.')
			e.target.value = ''
			return
		}

		setLegalDocuments((prev) => [
			...prev,
			{
				id: `doc-${Date.now()}`,
				title: docTitle.trim(),
				file,
			},
		])
		setDocTitle('')
		toast.success(`"${docTitle.trim()}" added to legal documents vault.`)
		e.target.value = ''
	}

	const removeLegalDoc = (id) => {
		setLegalDocuments((prev) => prev.filter((doc) => doc.id !== id))
		toast.success('Document removed from vault.')
	}

	const handleSubmit = async (e) => {
		e.preventDefault()

		if (!formData.name.trim()) return toast.error('Name is required')
		if (!formData.email.trim()) return toast.error('Email is required')
		if (!formData.contactNumber.trim()) return toast.error('Contact Number is required')
		if (!formData.designation.trim()) return toast.error('Designation is required')

		try {
			const fd = new FormData()
			fd.append('name', formData.name)
			fd.append('email', formData.email)
			fd.append('contactNumber', formData.contactNumber)
			if (formData.joiningDate) fd.append('joiningDate', formData.joiningDate)
			fd.append('designation', formData.designation)
			fd.append('kafalaStatus', formData.kafalaStatus)
			fd.append('branchName', formData.branch)
			fd.append('basic', Number(formData.basic) || 0)
			fd.append('houseRent', Number(formData.houseRent) || 0)
			fd.append('food', Number(formData.food) || 0)
			fd.append('commission', Number(formData.commission) || 0)
			fd.append('perDayPayment', Number(formData.perDayPayment) || 0)

			if (docs.photoFile) fd.append('photo', docs.photoFile)

			legalDocuments.forEach((doc) => {
				fd.append('legalDocTitle', doc.title)
				fd.append('legalDocFile', doc.file)
			})

			const empRes = await employeeApi.create(fd)
			const employee = empRes.data.data

			const entryData = {
				employee: employee._id,
				month: currentMonth,
				year: currentYear,
				workingDays: getMonthDays(currentMonth, currentYear),
				absentDays: 0,
				otHours: 0,
				advanceLoan: 0,
				basic: Number(formData.basic) || 0,
				houseRent: Number(formData.houseRent) || 0,
				food: Number(formData.food) || 0,
				commission: Number(formData.commission) || 0,
				perDayPayment: Number(formData.perDayPayment) || 0,
				loanAdjust: 0,
				iqamaCost: 0,
				fine: 0,
				bankPay: 0,
			}
			const calc = recalcRow(entryData)
			const payRes = await payrollApi.create({ ...entryData, ...calc })

			setEmployees((prev) => [...prev, employee])
			setPayrollRows((prev) => [...prev, payRes.data.data])

			setBranches((prev) =>
				prev.map((b) =>
					b.name === formData.branch
						? { ...b, employees: b.employees + 1 }
						: b
				)
			)

			toast.success(`${formData.name} added to payroll`)
			navigate('/admin/payroll')
		} catch {
			toast.error('Failed to save. Check server connection.')
		}
	}

	const photoPreview = docs.photoFile ? URL.createObjectURL(docs.photoFile) : null

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
							{photoPreview ? (
								<img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
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
							{docs.photoFile && (
								<p className="text-xs font-semibold text-slate-600 mt-2 flex items-center gap-1">
									<span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
									{docs.photoFile.name}
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

				{/* Part 3: Workspace & Assignment */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">3. Workspace & Assignment</h3>
					
					<div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Branch *
							<input
								required
								value={formData.branch}
								onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
								placeholder="e.g. Dhaka HQ"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
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

					</div>
				</div>

				{/* Part 4: Salary Breakdown */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">4. Salary Breakdown</h3>
					
					<div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Joining Date
							<input
								type="date"
								value={formData.joiningDate}
								onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Kafala Status
							<select
								value={formData.kafalaStatus}
								onChange={(e) => setFormData({ ...formData, kafalaStatus: e.target.value })}
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							>
								<option>Under Kafala</option>
								<option>Outside Kafala</option>
								<option>Saudi</option>
								<option>Sariatul Binmishal</option>
							</select>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Basic
							<input
								type="number"
								value={formData.basic || ''}
								onChange={(e) => setFormData({ ...formData, basic: Number(e.target.value) })}
								placeholder="0"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							House Rent
							<input
								type="number"
								value={formData.houseRent || ''}
								onChange={(e) => setFormData({ ...formData, houseRent: Number(e.target.value) })}
								placeholder="0"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Food
							<input
								type="number"
								value={formData.food || ''}
								onChange={(e) => setFormData({ ...formData, food: Number(e.target.value) })}
								placeholder="0"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Commission
							<input
								type="number"
								value={formData.commission || ''}
								onChange={(e) => setFormData({ ...formData, commission: Number(e.target.value) })}
								placeholder="0"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>

						<label className="grid gap-2 text-sm font-semibold text-slate-700">
							Per Day Payment
							<input
								type="number"
								value={formData.perDayPayment || ''}
								onChange={(e) => setFormData({ ...formData, perDayPayment: Number(e.target.value) })}
								placeholder="0 (auto-calc from Basic)"
								className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
							/>
						</label>
					</div>
				</div>

				{/* Part 5: Legal Documents Vault */}
				<div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
					<h3 className="text-base font-semibold text-slate-900">5. Legal Documents Vault</h3>
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
										<img src={URL.createObjectURL(doc.file)} alt={doc.title} className="h-full w-full object-cover" />
									</div>
									<div className="min-w-0 flex-1">
										<p className="text-sm font-semibold text-slate-900 truncate">{doc.title}</p>
										<p className="text-xs text-slate-500 truncate">{doc.file.name}</p>
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
