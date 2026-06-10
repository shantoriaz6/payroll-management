import { Link, useOutletContext } from 'react-router-dom'
import { formatCurrency } from './adminData.js'

function Payroll() {
	const { payrollRows } = useOutletContext()
	const currentMonthLabel = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())
	const attendanceSummary = payrollRows.reduce(
		(summary, row) => {
			summary.present += row.presentDays ?? 0
			summary.leave += row.leaveDays ?? 0
			summary.absent += row.absentDays ?? 0
			summary.overtime += row.overtimeHours ?? 0
			return summary
		},
		{ present: 0, leave: 0, absent: 0, overtime: 0 },
	)

	return (
		<section className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
			<div className="flex items-start justify-between gap-4">
				<div>
					<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Company payroll</p>
					<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Salary list and calculation</h2>
					<p className="mt-2 text-sm leading-6 text-slate-600">Payroll for {currentMonthLabel}. The salary list is calculated from daily fee, attendance, overtime, bonuses, loans, and fines.</p>
				</div>
				<Link to="/admin/overview" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
					Back to overview
				</Link>
			</div>

			<div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{[
					{ label: 'Present Days', value: attendanceSummary.present, tone: 'from-emerald-300 to-teal-300' },
					{ label: 'Leave Days', value: attendanceSummary.leave, tone: 'from-amber-300 to-orange-300' },
					{ label: 'Absent Days', value: attendanceSummary.absent, tone: 'from-rose-300 to-red-300' },
					{ label: 'Overtime Hours', value: attendanceSummary.overtime, tone: 'from-sky-300 to-indigo-300' },
				].map((item) => (
					<div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
						<p className="text-sm text-slate-500">{item.label}</p>
						<p className="mt-2 text-2xl font-semibold text-slate-950">{item.value}</p>
						<div className={`mt-4 h-1 w-16 rounded-full bg-gradient-to-r ${item.tone}`} />
					</div>
				))}
			</div>

			<div className="mt-6 overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm">
				<div className="overflow-x-auto">
					<table className="min-w-full text-left text-sm">
						<thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
							<tr>
								<th className="px-5 py-4">Employee</th>
								<th className="px-5 py-4">Branch</th>
								<th className="px-5 py-4">Daily Fee</th>
								<th className="px-5 py-4">Attendance</th>
								<th className="px-5 py-4">Leave</th>
								<th className="px-5 py-4">OT</th>
								<th className="px-5 py-4">Incentive</th>
								<th className="px-5 py-4">Bonus</th>
								<th className="px-5 py-4">Fine</th>
								<th className="px-5 py-4">Fine Mercy</th>
								<th className="px-5 py-4">Loan</th>
								<th className="px-5 py-4">Loan Paid</th>
								<th className="px-5 py-4">Net Salary</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-200 bg-white">
							{payrollRows.map((row) => (
								<tr key={`${row.name}-${row.branch}`} className="transition hover:bg-slate-50">
									<td className="px-5 py-4 font-semibold text-slate-950">
										<Link to={`/admin/employees/${row.employeeId}`} className="transition hover:text-amber-700">
											{row.name}
										</Link>
									</td>
									<td className="px-5 py-4 text-slate-700">{row.branch}</td>
									<td className="px-5 py-4 text-slate-700">{formatCurrency(row.dailyFee ?? 0)}</td>
									<td className="px-5 py-4 text-slate-700">{row.presentDays ?? 0}</td>
									<td className="px-5 py-4 text-slate-700">{row.leaveDays ?? 0}</td>
									<td className="px-5 py-4 text-slate-700">{row.overtimeHours ?? 0}</td>
									<td className="px-5 py-4 text-emerald-700">{formatCurrency(row.incentive ?? 0)}</td>
									<td className="px-5 py-4 text-slate-700">{formatCurrency(row.bonus ?? 0)}</td>
									<td className="px-5 py-4 text-rose-700">{formatCurrency(row.fine ?? 0)}</td>
									<td className="px-5 py-4 text-sky-700">{formatCurrency(row.fineWaived ?? 0)}</td>
									<td className="px-5 py-4 text-amber-700">{formatCurrency(row.loan ?? 0)}</td>
									<td className="px-5 py-4 text-amber-700">{formatCurrency(row.loanPaid ?? 0)}</td>
									<td className="px-5 py-4 font-semibold text-slate-950">{formatCurrency(row.net)}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}

export default Payroll