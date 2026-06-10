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
	const otH = fields.otHours ?? 0
	const la = fields.loanAdjust ?? 0
	const iq = fields.iqamaCost ?? 0
	const fn = fields.fine ?? 0
	const bp = fields.bankPay ?? 0
	const al = fields.advanceLoan ?? 0

	const presentDays = wd - ad
	const perDaysSalary = TOTAL_MONTH_DAYS > 0 ? +(basic / TOTAL_MONTH_DAYS).toFixed(2) : 0
	const overTime = perDaysSalary > 0 ? +((perDaysSalary / 12) * otH * 1.5).toFixed(2) : 0
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

function EditableCell({ row, field, onChange, className = '' }) {
	const val = row[field] ?? 0
	return (
		<input
			type="number"
			value={val}
			onChange={(e) => onChange(row, field, Math.max(0, Number(e.target.value)))}
			className={`w-full bg-transparent text-right outline-none focus:rounded focus:bg-amber-50 focus:px-1 ${className}`}
			min="0"
			step="any"
		/>
	)
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

function Payroll() {
	const { payrollRows, setPayrollRows } = useOutletContext()

	const [adding, setAdding] = useState(false)
	const [form, setForm] = useState({
		name: '', designation: '', kafalaStatus: 'Under Kafala', branchName: '',
		basic: 0, houseRent: 0, food: 0, commission: 0,
	})

	const now = new Date()
	const currentMonth = now.getMonth() + 1
	const currentYear = now.getFullYear()
	const monthLabel = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now)

	const handleFieldChange = useCallback((row, field, value) => {
		const id = getRowId(row)
		setPayrollRows((prev) => {
			const updated = prev.map((r) => {
				if (getRowId(r) !== id) return r
				const next = { ...r, [field]: value }
				const calc = recalcRow(next)
				return { ...next, ...calc }
			})
			const changed = updated.find((r) => getRowId(r) === id)
			if (changed?._id) {
				payrollApi.update(changed._id, changed).catch(() => {})
			}
			return updated
		})
	}, [setPayrollRows])

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
				designation: form.designation,
				kafalaStatus: form.kafalaStatus,
				branchName: form.branchName,
				basic: form.basic,
				houseRent: form.houseRent,
				food: form.food,
				commission: form.commission,
			})
			const employee = empRes.data.data
			const entryData = {
				employee: employee._id,
				month: currentMonth,
				year: currentYear,
				workingDays: TOTAL_MONTH_DAYS,
				absentDays: 0,
				otHours: 0,
				advanceLoan: 0,
				basic: form.basic,
				houseRent: form.houseRent,
				food: form.food,
				commission: form.commission,
				loanAdjust: 0,
				iqamaCost: 0,
				fine: 0,
				bankPay: 0,
			}
			const calc = recalcRow(entryData)
			const payRes = await payrollApi.create({ ...entryData, ...calc })
			const newEntry = payRes.data.data
			setPayrollRows((prev) => [...prev, newEntry])
			setForm({ name: '', designation: '', kafalaStatus: 'Under Kafala', branchName: '', basic: 0, houseRent: 0, food: 0, commission: 0 })
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
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Company payroll</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Salary list and calculation</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">
						Payroll for {monthLabel} {currentYear}. All numeric fields are editable.
					</p>
				</div>
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => setAdding(!adding)}
						className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
					>
						{adding ? 'Cancel' : '+ Add Employee'}
					</button>
					<button
						type="button"
						onClick={handleGeneratePayroll}
						className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
					>
						Generate Payroll
					</button>
					<Link to="/admin/overview" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
						Back to overview
					</Link>
				</div>
			</div>

			{adding && (
				<div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50/60 p-5">
					<p className="text-sm font-semibold text-amber-900">Add new employee to {monthLabel} payroll</p>
					<div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
						<input placeholder="Full name *" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<input placeholder="Designation" value={form.designation} onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<input placeholder="Branch" value={form.branchName} onChange={(e) => setForm((p) => ({ ...p, branchName: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<select value={form.kafalaStatus} onChange={(e) => setForm((p) => ({ ...p, kafalaStatus: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400">
							<option>Under Kafala</option>
							<option>Outside Kafala</option>
							<option>Saudi</option>
							<option>Sariatul Binmishal</option>
						</select>
						<input type="number" placeholder="Basic" value={form.basic} onChange={(e) => setForm((p) => ({ ...p, basic: Number(e.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<input type="number" placeholder="House Rent" value={form.houseRent} onChange={(e) => setForm((p) => ({ ...p, houseRent: Number(e.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<input type="number" placeholder="Food" value={form.food} onChange={(e) => setForm((p) => ({ ...p, food: Number(e.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
						<input type="number" placeholder="Commission" value={form.commission} onChange={(e) => setForm((p) => ({ ...p, commission: Number(e.target.value) }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-400" />
					</div>
					<button type="button" onClick={handleAddToPayroll} className="mt-3 rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">
						Save & Add to Payroll
					</button>
				</div>
			)}

			<div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="min-w-max text-left text-xs">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-950 text-white">
								<th colSpan={6} className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em]">
									Bin Mishal Global Service Co. Ltd.
								</th>
								<th colSpan={7} className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em]">
									Earnings
								</th>
								<th colSpan={5} className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em]">
									Deduction
								</th>
								<th colSpan={5} className="px-3 py-2.5 text-center text-[0.65rem] font-bold uppercase tracking-[0.3em]">
									Net Payable &amp; Loan
								</th>
							</tr>

							<tr className="border-b border-slate-200 bg-slate-50 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
								<th className="px-2 py-2 text-center">SL</th>
								<th className="px-3 py-2 text-left">Staff Name</th>
								<th className="px-3 py-2 text-left">Designation</th>
								<th className="px-3 py-2 text-left">Kafala</th>
								<th className="px-3 py-2 text-left">Branch</th>
								<th className="px-2 py-2 text-center">Working<br />Days</th>
								<th className="px-2 py-2 text-center">Absent<br />Days</th>
								<th className="px-2 py-2 text-center">Present<br />Days</th>
								<th className="px-2 py-2 text-center">Per Day<br />Salary</th>
								<th className="px-2 py-2 text-center">O.T<br />Hours</th>
								<th className="px-2 py-2 text-center">Advance<br />Loan</th>
								<th className="px-2 py-2 text-center">Basic</th>
								<th className="px-2 py-2 text-center">H.Rent</th>
								<th className="px-2 py-2 text-center">Food</th>
								<th className="px-2 py-2 text-center">Comm.</th>
								<th className="px-2 py-2 text-center">O.T</th>
								<th className="px-2 py-2 text-center bg-emerald-50 text-emerald-800">Gross</th>
								<th className="px-2 py-2 text-center">Loan<br />Adjust</th>
								<th className="px-2 py-2 text-center">Absent<br />Cost</th>
								<th className="px-2 py-2 text-center">Iqama</th>
								<th className="px-2 py-2 text-center">Fine</th>
								<th className="px-2 py-2 text-center bg-rose-50 text-rose-800">Total<br />Ded.</th>
								<th className="px-2 py-2 text-center bg-emerald-50 text-emerald-800">Net<br />Payable</th>
								<th className="px-2 py-2 text-center">Rem.<br />Loan</th>
								<th className="px-2 py-2 text-center">Bank<br />Pay</th>
								<th className="px-2 py-2 text-center">Action</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100">
							{payrollRows.map((row, idx) => (
								<tr key={getRowId(row)} className="transition hover:bg-slate-50/70">
									<td className="px-2 py-1.5 text-center text-slate-500">{row.slNo || idx + 1}</td>
									<td className="px-3 py-1.5 font-semibold text-slate-950 whitespace-nowrap">
										{getEmployeeName(row)}
									</td>
									<td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{getDesignation(row)}</td>
									<td className="px-3 py-1.5 text-slate-600">{getKafala(row)}</td>
									<td className="px-3 py-1.5 text-slate-600 whitespace-nowrap">{getBranch(row)}</td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="workingDays" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="absentDays" onChange={handleFieldChange} className="text-rose-600" /></td>
									<td className="px-2 py-1.5 text-right font-medium text-slate-800">{row.presentDays}</td>
									<td className="px-2 py-1.5 text-right text-slate-600">{(row.perDaysSalary ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="otHours" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="advanceLoan" onChange={handleFieldChange} className="text-amber-700" /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="basic" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="houseRent" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="food" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="commission" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-right text-slate-700">{(row.overTime ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right font-semibold bg-emerald-50/60 text-emerald-800">{(row.grossSalary ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="loanAdjust" onChange={handleFieldChange} className="text-amber-700" /></td>
									<td className="px-2 py-1.5 text-right text-rose-600">{(row.absentCost ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="iqamaCost" onChange={handleFieldChange} className="text-rose-600" /></td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="fine" onChange={handleFieldChange} className="text-rose-600" /></td>
									<td className="px-2 py-1.5 text-right font-semibold bg-rose-50/60 text-rose-800">{(row.totalDeduction ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right font-bold bg-emerald-50/60 text-emerald-900">{(row.netSalary ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right text-amber-700">{(row.remainingLoan ?? 0).toFixed(2)}</td>
									<td className="px-2 py-1.5 text-right"><EditableCell row={row} field="bankPay" onChange={handleFieldChange} /></td>
									<td className="px-2 py-1.5 text-center">
										<button
											type="button"
											onClick={() => handleDeleteEntry(row)}
											className="text-xs text-rose-500 hover:text-rose-700"
											title="Remove entry"
										>
											✕
										</button>
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr className="border-t-2 border-slate-300 bg-slate-100 text-xs font-bold text-slate-900">
								<td colSpan={5} className="px-3 py-2.5 text-right uppercase tracking-wider">Total</td>
								<td className="px-2 py-2.5 text-right">{sumRows(payrollRows, 'workingDays')}</td>
								<td className="px-2 py-2.5 text-right">{sumRows(payrollRows, 'absentDays')}</td>
								<td className="px-2 py-2.5 text-right">{sumRows(payrollRows, 'presentDays')}</td>
								<td className="px-2 py-2.5 text-right">—</td>
								<td className="px-2 py-2.5 text-right">{sumRows(payrollRows, 'otHours')}</td>
								<td className="px-2 py-2.5 text-right">{t.advanceLoan.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.basic.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.houseRent.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.food.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.commission.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.overTime.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right bg-emerald-50">{t.grossSalary.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.loanAdjust.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.absentCost.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.iqamaCost.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.fine.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right bg-rose-50">{t.totalDeduction.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right bg-emerald-50">{t.netSalary.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.remainingLoan.toFixed(2)}</td>
								<td className="px-2 py-2.5 text-right">{t.bankPay.toFixed(2)}</td>
								<td />
							</tr>
						</tfoot>
					</table>
				</div>
			</div>

			<div className="mt-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
				<p className="font-semibold text-slate-700">Calculation rules:</p>
				<ul className="mt-1 list-inside list-disc space-y-0.5">
					<li>Present Days = Working Days − Absent Days</li>
					<li>Per Day Salary = Basic / {TOTAL_MONTH_DAYS} (month days)</li>
					<li>O.T = (Per Day Salary / 12) × O.T Hours × 1.5</li>
					<li>Gross Salary = Basic + House Rent + Food + Commission + O.T</li>
					<li>Absent Cost = Absent Days × Per Day Salary</li>
					<li>Total Deduction = Loan Adjust + Absent Cost + Iqama Cost + Fine</li>
					<li>Net Payable = Gross Salary − Total Deduction − Bank Pay</li>
					<li>Remaining Loan = Advance Loan − Loan Adjust</li>
				</ul>
			</div>
		</section>
	)
}

export default Payroll
