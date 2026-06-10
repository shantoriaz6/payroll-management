import { useState } from 'react'
import Header from '../components/header.jsx'

const roleAccess = {
	admin: ['Employee management', 'Payroll settings', 'Reports', 'User approvals'],
	branchManager: ['Branch roster', 'Attendance review', 'Team approvals', 'Payroll summaries'],
	employee: ['Profile', 'Payslip history', 'Leave status', 'Attendance'],
}

const roleOptions = [
	{ value: 'admin', label: 'Admin' },
	{ value: 'branchManager', label: 'Branch Manager' },
	{ value: 'employee', label: 'Employee' },
]

function LoginPage({ onCreateAccount, onLogin }) {
	const [view, setView] = useState('login')
	const [selectedRole, setSelectedRole] = useState('employee')
	const [formData, setFormData] = useState({ email: '', password: '' })
	const [statusMessage, setStatusMessage] = useState('')
	const isForgotView = view === 'forgot'

	function handleChange(event) {
		const { name, value } = event.target
		setFormData((current) => ({ ...current, [name]: value }))
	}

	function handleSubmit(event) {
		event.preventDefault()

		if (isForgotView) {
			setStatusMessage(
				`Password reset email sent to ${formData.email || 'your email address'}. Open the link in your inbox to set a new password.`,
			)
			return
		}

		onLogin?.({
			role: selectedRole,
			email: formData.email,
		})

		setStatusMessage(
			`Logged in as ${selectedRole}. Access granted to ${roleAccess[selectedRole].join(', ')}.`,
		)
	}

	return (
		<div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.16),_transparent_26%),linear-gradient(180deg,_#fff9f0_0%,_#eef4ff_100%)] px-4 py-6 sm:px-6 lg:px-10">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute left-[-5rem] top-[-4rem] h-64 w-64 rounded-full bg-amber-300/25 blur-3xl" />
				<div className="absolute right-[-4rem] top-24 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
				<div className="absolute bottom-[-6rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-indigo-300/15 blur-3xl" />
			</div>

			<div className="relative mx-auto flex w-full max-w-7xl flex-col gap-6">
				<Header />

				<main className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
					<section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950 p-7 text-white shadow-[0_32px_90px_rgba(15,23,42,0.2)] sm:p-9">
						<div className="absolute inset-0 bg-[linear-gradient(135deg,_rgba(251,191,36,0.16),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.18),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(99,102,241,0.16),_transparent_28%)]" />
						<div className="absolute -right-12 top-10 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-0" />
						<div className="absolute bottom-6 left-6 h-20 w-20 rounded-3xl border border-white/10 bg-white/5 rotate-12" />
						<div className="relative flex h-full flex-col justify-between gap-10">
							<div className="space-y-5">
								<p className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.4em] text-amber-200">
									Role based access
								</p>
								<h2 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
									A modern access point for payroll teams.
								</h2>
								<p className="max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
									Admin, branch manager, and employee each see a different path. The experience is designed
									to feel premium, calm, and easy to navigate.
								</p>
							</div>

							<div className="grid gap-3 sm:grid-cols-3">
								{roleOptions.map((role) => (
									<button
										key={role.value}
										type="button"
										className={`group rounded-[1.5rem] border p-4 text-left transition duration-200 ${selectedRole === role.value ? 'border-amber-300/70 bg-white/12 shadow-[0_18px_44px_rgba(15,23,42,0.28)]' : 'border-white/10 bg-white/5 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_18px_44px_rgba(15,23,42,0.28)]'}`}
										onClick={() => setSelectedRole(role.value)}
									>
										<span className="block text-base font-semibold text-white">{role.label}</span>
										<small className="mt-2 block text-sm leading-6 text-slate-300">
											{roleAccess[role.value].slice(0, 2).join(' • ')}
										</small>
										<div className="mt-4 h-1 w-10 rounded-full bg-gradient-to-r from-amber-300 to-sky-300 opacity-80 transition group-hover:w-16" />
									</button>
								))}
							</div>
						</div>
					</section>

					<section className="rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_28px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">
									{isForgotView ? 'Reset password' : 'Login'}
								</p>
								<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
									{isForgotView ? 'Recover your account password' : 'Sign in to continue'}
								</h2>
							</div>
							<button
								type="button"
								className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950"
								onClick={isForgotView ? () => setView('login') : onCreateAccount}
							>
								{isForgotView ? 'Back to login' : 'Not registered? Sign up'}
							</button>
						</div>

						<form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
							<label className="grid gap-2 text-sm font-semibold text-slate-700">
								Email
								<input
									type="email"
									name="email"
									value={formData.email}
									onChange={handleChange}
									placeholder="name@company.com"
									required
									className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
								/>
							</label>

							{isForgotView ? null : (
								<>
									<label className="grid gap-2 text-sm font-semibold text-slate-700">
										Password
										<input
											type="password"
											name="password"
											value={formData.password}
											onChange={handleChange}
											placeholder="Enter your password"
											required
											className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
										/>
									</label>

									<div className="flex items-center justify-between gap-4">
										<label className="grid gap-2 text-sm font-semibold text-slate-700">
											Role
											<select
												value={selectedRole}
												onChange={(event) => setSelectedRole(event.target.value)}
												className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
											>
												{roleOptions.map((role) => (
													<option key={role.value} value={role.value}>
														{role.label}
													</option>
												))}
											</select>
										</label>

										<button
											type="button"
											onClick={() => setView('forgot')}
											className="pt-6 text-left text-sm font-semibold text-amber-700 transition hover:text-amber-800"
										>
											Forgot password?
										</button>
									</div>

									<button
										className="mt-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.28)]"
										type="submit"
									>
										Login
									</button>
								</>
							)}

							{isForgotView ? (
								<>
									<p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
										Enter your email address and we will send a secure password reset link. Use that link to
										set a new password from your inbox.
									</p>
									<button
										className="mt-1 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 px-5 py-3.5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.28)]"
										type="submit"
									>
										Send reset link
									</button>
									<button
										type="button"
										onClick={() => setView('login')}
										className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
									>
										Back to login
									</button>
								</>
							) : null}
						</form>

						<div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50/90 p-5">
							<p className="text-sm font-semibold text-slate-900">
								Access for {roleOptions.find((role) => role.value === selectedRole)?.label}:
							</p>
							<div className="mt-4 flex flex-wrap gap-2">
								{roleAccess[selectedRole].map((item) => (
									<span
										key={item}
										className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm"
									>
										{item}
									</span>
								))}
							</div>
						</div>

						{statusMessage ? (
							<p className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
								{statusMessage}
							</p>
						) : null}
					</section>
				</main>
			</div>
		</div>
	)
}

export default LoginPage
