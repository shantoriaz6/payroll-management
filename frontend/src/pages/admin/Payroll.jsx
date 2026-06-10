import { useState, useCallback } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import toast from 'react-hot-toast'
import { payrollApi, employeeApi } from '../../services/payrollApi.js'

const TOTAL_MONTH_DAYS = 31

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

	const presentDays = wd - ad
	const perDayRate = (fields.perDayPayment ?? 0) > 0 ? fields.perDayPayment : 0
	const perDaysSalary = perDayRate > 0 ? perDayRate : (TOTAL_MONTH_DAYS > 0 ? +(basic / TOTAL_MONTH_DAYS).toFixed(2) : 0)
	const overTime = fields.overTime ?? 0
	const grossSalary = +(basic + hr + fd + comm + overTime).toFixed(2)
	const absentCost = +(ad * perDaysSalary).toFixed(2)
	const totalDeduction = +(la + absentCost + iq + fn).toFixed(2)
	const netSalary = +(grossSalary - totalDeduction - bp).toFixed(2)
	const remainingLoan = +(al - la).toFixed(2)
	return { presentDays, perDaysSalary, overTime, grossSalary, absentCost, totalDeduction, netSalary, remainingLoan }
}

function sumRows(rows, key) {
	return rows.reduce((s, r) => s + (Number(r[key]) || 0), 0)
}

function getRowId(row) {
	return row._id || row.employeeId || row.slNo
}

function getEmployeeName(row) {
	return row.employee?.name ?? row.name ?? ''
}

function getDesignation(row) {
	return row.employee?.designation ?? row.designation ?? ''
}

function getKafala(row) {
	return row.employee?.kafalaStatus ?? row.kafalaStatus ?? ''
}

function getBranch(row) {
	return row.employee?.branchName ?? row.branch ?? ''
}

function getJoiningDate(row) {
	const raw = row.employee?.joiningDate ?? row.joiningDate ?? ''
	if (!raw) return '—'
	try {
		const d = new Date(raw)
		if (!isNaN(d.getTime())) {
			return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
		}
	} catch {}
	return raw
}

const HEADER_EMPLOYEE = 6
const HEADER_ATTENDANCE = 6
const HEADER_EARNINGS = 7
const HEADER_DEDUCTION = 5
const HEADER_NET = 5

function Payroll() {
	const { payrollRows, setPayrollRows } = useOutletContext()

	const [adding, setAdding] = useState(false)
	const [editingRow, setEditingRow] = useState(null)
	const [editForm, setEditForm] = useState(null)
	const [form, setForm] = useState({
		name: '', joiningDate: '', designation: '', kafalaStatus: 'Under Kafala', branchName: '',
		basic: 0, houseRent: 0, food: 0, commission: 0, perDayPayment: 0,
	})

	const now = new Date()
	const currentMonth = now.getMonth() + 1
	const currentYear = now.getFullYear()
	const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)
	const yearShort = String(currentYear).slice(2)

	const handleEditOpen = useCallback((row) => {
		setEditForm({ ...row })
		setEditingRow(getRowId(row))
	}, [])

	const handleEditFormChange = useCallback((field, value) => {
		setEditForm((prev) => {
			const next = { ...prev, [field]: value }
			const calc = recalcRow(next)
			return { ...next, ...calc }
		})
	}, [])

	const handleEditSave = useCallback(async () => {
		if (!editForm?._id) return
		try {
			await payrollApi.update(editForm._id, editForm)
			setPayrollRows((prev) => prev.map((r) => (r._id === editForm._id ? editForm : r)))
			setEditingRow(null)
			setEditForm(null)
			toast.success('Entry updated')
		} catch {
			toast.error('Update failed')
		}
	}, [editForm, setPayrollRows])

	const handleEditCancel = useCallback(() => {
		setEditingRow(null)
		setEditForm(null)
	}, [])

	const handleGeneratePayroll = useCallback(async () => {
		try {
			const res = await payrollApi.generate(currentMonth, currentYear)
			if (res.data?.data) {
				setPayrollRows(res.data.data)
				toast.success('Payroll generated from active employees')
			}
		} catch {
			toast.error('Could not generate payroll. Is the server running?')
		}
	}, [currentMonth, currentYear, setPayrollRows])

	const handleAddToPayroll = useCallback(async () => {
		if (!form.name.trim()) {
			toast.error('Employee name is required')
			return
		}
		try {
			const empRes = await employeeApi.create({
				name: form.name,
				joiningDate: form.joiningDate || undefined,
				designation: form.designation,
				kafalaStatus: form.kafalaStatus,
				branchName: form.branchName,
				basic: form.basic, houseRent: form.houseRent, food: form.food, commission: form.commission,
				perDayPayment: form.perDayPayment,
			})
			const employee = empRes.data.data
			const entryData = {
				employee: employee._id,
				month: currentMonth, year: currentYear,
				workingDays: TOTAL_MONTH_DAYS, absentDays: 0, otHours: 0, advanceLoan: 0,
				basic: form.basic, houseRent: form.houseRent, food: form.food, commission: form.commission,
				perDayPayment: form.perDayPayment,
				loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0,
			}
			const calc = recalcRow(entryData)
			const payRes = await payrollApi.create({ ...entryData, ...calc })
			const newEntry = payRes.data.data
			setPayrollRows((prev) => [...prev, newEntry])
			setForm({ name: '', joiningDate: '', designation: '', kafalaStatus: 'Under Kafala', branchName: '', basic: 0, houseRent: 0, food: 0, commission: 0, perDayPayment: 0 })
			setAdding(false)
			toast.success(`${form.name} added to payroll`)
		} catch {
			toast.error('Failed to add employee. Check server connection.')
		}
	}, [form, currentMonth, currentYear, setPayrollRows])

	const handleDeleteEntry = useCallback(async (row) => {
		const id = row._id
		if (!id) return
		try {
			await payrollApi.delete(id)
			setPayrollRows((prev) => prev.filter((r) => r._id !== id))
			toast.success('Entry removed')
		} catch {
			toast.error('Delete failed')
		}
	}, [setPayrollRows])

	const handlePaymentStatusChange = useCallback(async (id, status) => {
		try {
			await payrollApi.update(id, { paymentStatus: status })
			setPayrollRows((prev) =>
				prev.map((r) => (r._id === id ? { ...r, paymentStatus: status } : r))
			)
			toast.success(status === 'paid' ? 'Marked as paid' : 'Marked as unpaid')
		} catch {
			toast.error('Failed to update payment status')
		}
	}, [setPayrollRows])

	const handlePrintInvoice = useCallback((row) => {
		const name = getEmployeeName(row)
		const designation = getDesignation(row)
		const branch = getBranch(row)
		const month = monthLabel
		const year = currentYear

		const printWin = window.open('', '_blank')
		printWin.document.write(`
			<html>
			<head>
				<title>Salary Invoice - ${name}</title>
				<style>
					body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; }
					.invoice { max-width: 700px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; }
					h1 { font-size: 22px; margin: 0 0 4px; color: #1e293b; }
					.sub { color: #64748b; font-size: 13px; margin-bottom: 20px; }
					table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
					th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
					th { background: #f8fafc; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
					td:last-child, th:last-child { text-align: right; }
					.total td { font-weight: 700; border-top: 2px solid #1e293b; border-bottom: none; font-size: 15px; }
					.meta { display: flex; justify-content: space-between; font-size: 13px; color: #64748b; margin-top: 16px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
					.footer { text-align: center; margin-top: 32px; font-size: 12px; color: #94a3b8; }
				</style>
			</head>
			<body>
				<div class="invoice">
					<h1>Bin Mishal Global Service Co. Ltd.</h1>
					<div class="sub">Salary Invoice — ${month} ${year}</div>
					<table>
						<tr><th>Employee</th><td>${name}</td></tr>
						<tr><th>Designation</th><td>${designation}</td></tr>
						<tr><th>Branch</th><td>${branch}</td></tr>
					</table>
					<table>
						<tr><th>Earnings</th><th></th></tr>
						<tr><td>Basic</td><td>${(row.basic ?? 0).toFixed(2)}</td></tr>
						<tr><td>House Rent</td><td>${(row.houseRent ?? 0).toFixed(2)}</td></tr>
						<tr><td>Food</td><td>${(row.food ?? 0).toFixed(2)}</td></tr>
						<tr><td>Commission</td><td>${(row.commission ?? 0).toFixed(2)}</td></tr>
						<tr><td>Overtime Pay</td><td>${(row.overTime ?? 0).toFixed(2)}</td></tr>
						<tr class="total"><td>Gross Salary</td><td>${(row.grossSalary ?? 0).toFixed(2)}</td></tr>
					</table>
					<table>
						<tr><th>Deductions</th><th></th></tr>
						<tr><td>Loan Adjust</td><td>${(row.loanAdjust ?? 0).toFixed(2)}</td></tr>
						<tr><td>Absent Cost</td><td>${(row.absentCost ?? 0).toFixed(2)}</td></tr>
						<tr><td>Iqama Cost</td><td>${(row.iqamaCost ?? 0).toFixed(2)}</td></tr>
						<tr><td>Fine</td><td>${(row.fine ?? 0).toFixed(2)}</td></tr>
						<tr class="total"><td>Total Deduction</td><td>${(row.totalDeduction ?? 0).toFixed(2)}</td></tr>
					</table>
					<table>
						<tr class="total"><td>Net Payable</td><td>${(row.netSalary ?? 0).toFixed(2)}</td></tr>
						<tr><td>Bank Pay</td><td>${(row.bankPay ?? 0).toFixed(2)}</td></tr>
						<tr><td>Remaining Loan</td><td>${(row.remainingLoan ?? 0).toFixed(2)}</td></tr>
					</table>
					<div class="meta">
						<span>Payment Status: <strong>Paid</strong></span>
						<span>Printed: ${new Date().toLocaleDateString('en-GB')}</span>
					</div>
					<div class="footer">This is a computer-generated invoice.</div>
				</div>
				<script>window.print();window.onafterprint=()=>window.close();<\\/script>
			</body>
			</html>
		`)
		printWin.document.close()
	}, [monthLabel, currentYear])

	const rowCount = payrollRows.length
	const t = {
		advanceLoan: sumRows(payrollRows, 'advanceLoan'),
		basic: sumRows(payrollRows, 'basic'),
		houseRent: sumRows(payrollRows, 'houseRent'),
		food: sumRows(payrollRows, 'food'),
		commission: sumRows(payrollRows, 'commission'),
		overTime: sumRows(payrollRows, 'overTime'),
		grossSalary: sumRows(payrollRows, 'grossSalary'),
		loanAdjust: sumRows(payrollRows, 'loanAdjust'),
		absentCost: sumRows(payrollRows, 'absentCost'),
		iqamaCost: sumRows(payrollRows, 'iqamaCost'),
		fine: sumRows(payrollRows, 'fine'),
		totalDeduction: sumRows(payrollRows, 'totalDeduction'),
		netSalary: sumRows(payrollRows, 'netSalary'),
		remainingLoan: sumRows(payrollRows, 'remainingLoan'),
		bankPay: sumRows(payrollRows, 'bankPay'),
	}

	return (
		<section className="space-y-8">
			<div className="rounded-2xl border border-slate-200/80 bg-white/85 p-8 shadow-lg shadow-slate-200/30 backdrop-blur-xl">
				<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-2">
						<span className="inline-block rounded-full bg-amber-100 px-4 py-1 text-xs font-bold uppercase tracking-[0.28em] text-amber-800">
							Payroll · {monthLabel} {currentYear}
						</span>
						<h2 className="text-3xl font-bold tracking-tight text-slate-900">
							Salary Sheet
						</h2>
						<p className="text-base text-slate-500">
							Bin Mishal Global Service Co. Ltd. · Period {monthLabel}&rsquo;{yearShort}
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-3">
						<button
							type="button"
							onClick={() => setAdding(!adding)}
							className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
								adding
									? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
									: 'bg-amber-600 text-white shadow-md shadow-amber-200/50 hover:bg-amber-700 hover:shadow-lg'
							}`}
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
							{adding ? 'Cancel' : 'Add Employee'}
						</button>
						<button
							type="button"
							onClick={handleGeneratePayroll}
							className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
							Generate
						</button>
						<Link
							to="/admin/overview"
							className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:bg-amber-50 hover:text-amber-800 hover:shadow-md"
						>
							<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
							Back
						</Link>
					</div>
				</div>

				{adding && (
					<div className="mt-6 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50/50 p-6 shadow-inner">
						<div className="flex items-center gap-2.5 text-amber-900">
							<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
							<span className="text-base font-semibold">New Employee — {monthLabel} {currentYear}</span>
						</div>
						<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Full name *</label>
								<input placeholder="e.g. Md. Ariful Haque" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Joining Date</label>
								<input type="date" value={form.joiningDate} onChange={(e) => setForm((p) => ({ ...p, joiningDate: e.target.value }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Designation</label>
								<input placeholder="e.g. General Staff" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Kafala Status</label>
								<select value={form.kafalaStatus} onChange={(e) => setForm((p) => ({ ...p, kafalaStatus: e.target.value }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50">
									<option>Under Kafala</option>
									<option>Outside Kafala</option>
									<option>Saudi</option>
									<option>Sariatul Binmishal</option>
								</select>
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Branch</label>
								<input placeholder="e.g. Riyadh" value={form.branchName} onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Basic</label>
								<input type="number" placeholder="0" value={form.basic || ''} onChange={(e) => setForm((p) => ({ ...p, basic: Number(e.target.value) }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">House Rent</label>
								<input type="number" placeholder="0" value={form.houseRent || ''} onChange={(e) => setForm((p) => ({ ...p, houseRent: Number(e.target.value) }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Food</label>
								<input type="number" placeholder="0" value={form.food || ''} onChange={(e) => setForm((p) => ({ ...p, food: Number(e.target.value) }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Commission</label>
								<input type="number" placeholder="0" value={form.commission || ''} onChange={(e) => setForm((p) => ({ ...p, commission: Number(e.target.value) }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
							<div>
								<label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-amber-800/70">Per Day Payment</label>
								<input type="number" placeholder="0 (auto-calc from Basic)" value={form.perDayPayment || ''} onChange={(e) => setForm((p) => ({ ...p, perDayPayment: Number(e.target.value) }))} className="w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm outline-none transition-all focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
							</div>
						</div>
						<div className="mt-5 flex items-center gap-3">
							<button
								type="button"
								onClick={handleAddToPayroll}
								className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg"
							>
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
								Save &amp; Add to Payroll
							</button>
							<button
								type="button"
								onClick={() => setAdding(false)}
								className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				<div className="mt-6 -mx-8">
					<div className="overflow-x-auto pb-2">
						<table className="w-full border-separate border-spacing-0 text-sm">
							<thead>
								<tr>
									<th colSpan={6} className="sticky top-0 z-10 border-r border-slate-700 bg-slate-900 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
										Employee
									</th>
									<th colSpan={6} className="sticky top-0 z-10 border-r border-slate-700 bg-slate-900 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-slate-300">
										Attendance
									</th>
									<th colSpan={HEADER_EARNINGS} className="sticky top-0 z-10 border-r border-emerald-800/40 bg-emerald-900 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">
										Earnings
									</th>
									<th colSpan={HEADER_DEDUCTION} className="sticky top-0 z-10 border-r border-rose-800/40 bg-rose-900 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-rose-200">
										Deductions
									</th>
									<th colSpan={HEADER_NET} className="sticky top-0 z-10 bg-indigo-900 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.25em] text-indigo-200">
										Net Payable
									</th>
								</tr>
								<tr>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										#
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Staff Name
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Joining Date
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Designation
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Kafala
									</th>
									<th className="sticky top-[3rem] z-10 border-r border-slate-200 bg-slate-100 px-3 py-3 text-left text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Branch
									</th>

									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Work Days
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Absent
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Present
									</th>
									<th className="sticky top-[3rem] z-10 bg-slate-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										Per Day
									</th>
									<th className="sticky top-[3rem] z-10 border-r border-slate-200 bg-slate-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
										OT Hrs
									</th>
									<th className="sticky top-[3rem] z-10 border-r border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
										Adv. Loan
									</th>

									<th className="sticky top-[3rem] z-10 bg-emerald-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
										Basic
									</th>
									<th className="sticky top-[3rem] z-10 bg-emerald-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
										H.Rent
									</th>
									<th className="sticky top-[3rem] z-10 bg-emerald-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
										Food
									</th>
									<th className="sticky top-[3rem] z-10 bg-emerald-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
										Comm.
									</th>
									<th className="sticky top-[3rem] z-10 bg-emerald-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
										O.T Pay
									</th>
									<th className="sticky top-[3rem] z-10 border-r border-emerald-200 bg-emerald-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">
										Gross
									</th>

									<th className="sticky top-[3rem] z-10 bg-rose-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
										Loan Adj.
									</th>
									<th className="sticky top-[3rem] z-10 bg-rose-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
										Absent Cost
									</th>
									<th className="sticky top-[3rem] z-10 bg-rose-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
										Iqama
									</th>
									<th className="sticky top-[3rem] z-10 bg-rose-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-rose-700">
										Fine
									</th>
									<th className="sticky top-[3rem] z-10 border-r border-rose-200 bg-rose-100 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-rose-800">
										Total Ded.
									</th>

									<th className="sticky top-[3rem] z-10 bg-indigo-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
										Net Payable
									</th>
									<th className="sticky top-[3rem] z-10 bg-indigo-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
										Rem. Loan
									</th>
									<th className="sticky top-[3rem] z-10 bg-indigo-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
										Bank Pay
									</th>
									<th className="sticky top-[3rem] z-10 bg-indigo-50 px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
										Payment Status
									</th>
									<th className="sticky top-[3rem] z-10 bg-indigo-50 px-3 py-3 text-center text-xs font-bold uppercase tracking-[0.2em] text-indigo-500">
										Action
									</th>
								</tr>
							</thead>
							<tbody>
								{payrollRows.map((row, idx) => {
									const isEven = idx % 2 === 0
									return (
										<tr
											key={getRowId(row)}
											className={`transition-colors ${
												isEven ? 'bg-white' : 'bg-slate-50/40'
											} hover:bg-amber-50/40`}
										>
											<td className="border-b border-slate-100 px-3 py-3 text-center text-slate-400 font-mono text-xs">
												{row.slNo || idx + 1}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 font-bold text-slate-900 whitespace-nowrap text-sm">
												{getEmployeeName(row)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-slate-500 whitespace-nowrap text-sm font-mono">
												{getJoiningDate(row)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-slate-600 whitespace-nowrap text-sm">
												{getDesignation(row)}
											</td>
											<td className="border-b border-slate-100 px-3 py-3 text-slate-500 text-sm">
												{getKafala(row)}
											</td>
											<td className="border-b border-r border-slate-100 px-3 py-3 text-slate-600 whitespace-nowrap text-sm">
												{getBranch(row)}
											</td>

											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-slate-800 text-sm">
												{row.workingDays}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-rose-600 text-sm">
												{row.absentDays}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-semibold text-slate-800 text-sm">
												{row.presentDays}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-slate-500 text-sm">
												{(row.perDaysSalary ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-r border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-slate-800 text-sm">
												{row.otHours}
											</td>
											<td className="border-b border-r border-amber-100 bg-amber-50/20 px-4 py-3 text-right font-mono tabular-nums text-amber-700 text-sm">
												{(row.advanceLoan ?? 0).toFixed(2)}
											</td>

											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-emerald-700 text-sm">
												{(row.basic ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-emerald-700 text-sm">
												{(row.houseRent ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-emerald-700 text-sm">
												{(row.food ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-emerald-700 text-sm">
												{(row.commission ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-emerald-700 text-sm">
												{(row.overTime ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-r border-emerald-100 bg-emerald-50/30 px-4 py-3 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">
												{(row.grossSalary ?? 0).toFixed(2)}
											</td>

											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-amber-700 text-sm">
												{(row.loanAdjust ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-rose-600 text-sm">
												{(row.absentCost ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-rose-700 text-sm">
												{(row.iqamaCost ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-rose-700 text-sm">
												{(row.fine ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-r border-rose-100 bg-rose-50/30 px-4 py-3 text-right font-bold font-mono tabular-nums text-rose-800 text-sm">
												{(row.totalDeduction ?? 0).toFixed(2)}
											</td>

											<td className="border-b border-slate-100 bg-indigo-50/30 px-4 py-3 text-right font-bold font-mono tabular-nums text-indigo-900 text-base">
												{(row.netSalary ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-amber-700 text-sm">
												{(row.remainingLoan ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-4 py-3 text-right font-mono tabular-nums text-slate-800 text-sm">
												{(row.bankPay ?? 0).toFixed(2)}
											</td>
											<td className="border-b border-slate-100 px-3 py-3 text-center whitespace-nowrap">
												<select
													value={row.paymentStatus || 'unpaid'}
													onChange={(e) => handlePaymentStatusChange(row._id, e.target.value)}
													className={`rounded-lg px-2 py-1 text-xs font-semibold border outline-none ${
														row.paymentStatus === 'paid'
															? 'bg-emerald-50 text-emerald-700 border-emerald-200'
															: 'bg-amber-50 text-amber-700 border-amber-200'
													}`}
												>
													<option value="unpaid">Unpaid</option>
													<option value="paid">Paid</option>
												</select>
												{row.paymentStatus === 'paid' && (
													<button
														type="button"
														onClick={() => handlePrintInvoice(row)}
														className="ml-1.5 rounded-md p-1.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700"
														title="Print invoice"
													>
														<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
															<path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
														</svg>
													</button>
												)}
											</td>
											<td className="border-b border-slate-100 px-3 py-3 text-center">
												<div className="flex items-center justify-center gap-1">
													<button
														type="button"
														onClick={() => handleEditOpen(row)}
														className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-amber-100 hover:text-amber-700"
														title="Edit entry"
													>
														<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
													</button>
													<button
														type="button"
														onClick={() => handleDeleteEntry(row)}
														className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-100 hover:text-rose-600"
														title="Remove entry"
													>
														<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
													</button>
												</div>
											</td>
										</tr>
									)
								})}
							</tbody>
							<tfoot>
								<tr className="bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100">
									<td colSpan={6} className="border-t-2 border-slate-300 px-4 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-600">
										{rowCount} employees · Total
									</td>

									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold text-slate-800 text-sm">{sumRows(payrollRows, 'workingDays')}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold text-rose-700 text-sm">{sumRows(payrollRows, 'absentDays')}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold text-slate-800 text-sm">{sumRows(payrollRows, 'presentDays')}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right text-slate-400 text-sm">—</td>
									<td className="border-t-2 border-r border-slate-300 px-4 py-4 text-right font-bold text-slate-800 text-sm">{sumRows(payrollRows, 'otHours')}</td>
									<td className="border-t-2 border-r border-amber-200 bg-amber-50/30 px-4 py-4 text-right font-bold font-mono tabular-nums text-amber-800 text-sm">{t.advanceLoan.toFixed(2)}</td>

									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">{t.basic.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">{t.houseRent.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">{t.food.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">{t.commission.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-800 text-sm">{t.overTime.toFixed(2)}</td>
									<td className="border-t-2 border-emerald-300 bg-emerald-100/50 px-4 py-4 text-right font-bold font-mono tabular-nums text-emerald-900 text-sm">{t.grossSalary.toFixed(2)}</td>

									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-amber-800 text-sm">{t.loanAdjust.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-rose-700 text-sm">{t.absentCost.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-rose-700 text-sm">{t.iqamaCost.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-rose-700 text-sm">{t.fine.toFixed(2)}</td>
									<td className="border-t-2 border-rose-300 bg-rose-100/50 px-4 py-4 text-right font-bold font-mono tabular-nums text-rose-900 text-sm">{t.totalDeduction.toFixed(2)}</td>

									<td className="border-t-2 border-indigo-300 bg-indigo-100/50 px-4 py-4 text-right font-bold font-mono tabular-nums text-indigo-900 text-base">{t.netSalary.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-amber-800 text-sm">{t.remainingLoan.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-4 py-4 text-right font-bold font-mono tabular-nums text-slate-800 text-sm">{t.bankPay.toFixed(2)}</td>
									<td className="border-t-2 border-slate-300 px-3 py-4 text-center text-xs text-slate-400">—</td>
									<td className="border-t-2 border-slate-300" />
								</tr>
							</tfoot>
						</table>
					</div>
				</div>

				{editingRow && editForm && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={handleEditCancel}>
					<div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
								<span className="text-xl font-bold text-slate-900">{getEmployeeName(editForm)} — Edit Salary Entry</span>
							</div>
							<button onClick={handleEditCancel} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
							</button>
						</div>

						<div className="mt-6 grid gap-6 sm:grid-cols-3">
							<div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Attendance</p>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500">Work Days</label>
									<input type="number" value={editForm.workingDays || ''} onChange={(e) => handleEditFormChange('workingDays', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500">Absent Days</label>
									<input type="number" value={editForm.absentDays || ''} onChange={(e) => handleEditFormChange('absentDays', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500">OT Hours</label>
									<input type="number" step="any" value={editForm.otHours || ''} onChange={(e) => handleEditFormChange('otHours', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500">Advance Loan</label>
									<input type="number" step="any" value={editForm.advanceLoan || ''} onChange={(e) => handleEditFormChange('advanceLoan', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-amber-200 px-4 py-2.5 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200/50" />
								</div>
							</div>

							<div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/30 p-4">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Earnings</p>
								<div>
									<label className="mb-1 block text-xs font-semibold text-emerald-600">Basic</label>
									<input type="number" step="any" value={editForm.basic || ''} onChange={(e) => handleEditFormChange('basic', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-emerald-600">House Rent</label>
									<input type="number" step="any" value={editForm.houseRent || ''} onChange={(e) => handleEditFormChange('houseRent', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-emerald-600">Food</label>
									<input type="number" step="any" value={editForm.food || ''} onChange={(e) => handleEditFormChange('food', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-emerald-600">Commission</label>
									<input type="number" step="any" value={editForm.commission || ''} onChange={(e) => handleEditFormChange('commission', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-emerald-600">O.T Pay</label>
									<input type="number" step="any" value={editForm.overTime || ''} onChange={(e) => handleEditFormChange('overTime', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-emerald-200 px-4 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200/50" />
								</div>
							</div>

							<div className="space-y-3 rounded-xl border border-rose-200 bg-rose-50/30 p-4">
								<p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Deductions</p>
								<div>
									<label className="mb-1 block text-xs font-semibold text-rose-600">Loan Adjust</label>
									<input type="number" step="any" value={editForm.loanAdjust || ''} onChange={(e) => handleEditFormChange('loanAdjust', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-rose-600">Iqama Cost</label>
									<input type="number" step="any" value={editForm.iqamaCost || ''} onChange={(e) => handleEditFormChange('iqamaCost', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-rose-600">Fine</label>
									<input type="number" step="any" value={editForm.fine || ''} onChange={(e) => handleEditFormChange('fine', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50" />
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-rose-600">Bank Pay</label>
									<input type="number" step="any" value={editForm.bankPay || ''} onChange={(e) => handleEditFormChange('bankPay', Math.max(0, Number(e.target.value)))} className="w-full rounded-lg border border-rose-200 px-4 py-2.5 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200/50" />
								</div>
							</div>
						</div>

						<div className="mt-4 grid gap-4 rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 sm:grid-cols-4">
							<div>
								<p className="text-xs font-semibold text-indigo-500">Present Days</p>
								<p className="text-lg font-bold text-indigo-900 font-mono">{editForm.presentDays}</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-indigo-500">Gross Salary</p>
								<p className="text-lg font-bold text-indigo-900 font-mono">{editForm.grossSalary?.toFixed(2)}</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-indigo-500">Total Deduction</p>
								<p className="text-lg font-bold text-rose-700 font-mono">{editForm.totalDeduction?.toFixed(2)}</p>
							</div>
							<div>
								<p className="text-xs font-semibold text-indigo-500">Net Payable</p>
								<p className="text-lg font-bold text-indigo-900 font-mono">{editForm.netSalary?.toFixed(2)}</p>
							</div>
						</div>

						<div className="mt-6 flex items-center justify-end gap-3">
							<button onClick={handleEditCancel} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-slate-500 transition-all hover:bg-slate-100">Cancel</button>
							<button onClick={handleEditSave} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-amber-700 hover:shadow-lg">
								<svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
								Save Changes
							</button>
						</div>
					</div>
				</div>
			)}

			<div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">Total Earnings</p>
						<p className="mt-2 text-2xl font-bold text-emerald-900 font-mono tabular-nums">
							{t.grossSalary.toFixed(2)}
						</p>
						<p className="mt-1 text-sm text-emerald-600">Gross salary before deductions</p>
					</div>
					<div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-white p-5">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-600">Total Deductions</p>
						<p className="mt-2 text-2xl font-bold text-rose-900 font-mono tabular-nums">
							{t.totalDeduction.toFixed(2)}
						</p>
						<p className="mt-1 text-sm text-rose-600">Loan, absent, iqama, fines</p>
					</div>
					<div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-white p-5">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Total Net Payable</p>
						<p className="mt-2 text-2xl font-bold text-indigo-900 font-mono tabular-nums">
							{t.netSalary.toFixed(2)}
						</p>
						<p className="mt-1 text-sm text-indigo-600">After all deductions &amp; bank pay</p>
					</div>
					<div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-5">
						<p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Remaining Loans</p>
						<p className="mt-2 text-2xl font-bold text-amber-900 font-mono tabular-nums">
							{t.remainingLoan.toFixed(2)}
						</p>
						<p className="mt-1 text-sm text-amber-600">Total outstanding loan balance</p>
					</div>
				</div>

				<div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
					<div className="flex items-center gap-2.5 text-slate-600">
						<svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
						<span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Calculation Rules</span>
					</div>
					<div className="mt-3 grid gap-x-10 gap-y-1.5 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-4">
						<span>Present Days = Working Days − Absent Days</span>
						<span>Per Day Salary = Per Day Payment or Basic / {TOTAL_MONTH_DAYS}</span>
						<span>O.T = Manually entered by admin</span>
						<span>Gross = Basic + H.Rent + Food + Comm. + O.T</span>
						<span>Absent Cost = Absent Days × Per Day Salary</span>
						<span>Total Ded. = Loan Adj. + Absent Cost + Iqama + Fine</span>
						<span>Net Payable = Gross − Total Ded. − Bank Pay</span>
						<span>Rem. Loan = Advance Loan − Loan Adjust</span>
					</div>
				</div>
			</div>
		</section>
	)
}

export default Payroll
