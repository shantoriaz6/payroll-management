function Header() {
	return (
		<header className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/70 bg-white/70 px-6 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:flex-row sm:items-start sm:justify-between sm:px-8">
			<div className="space-y-2">
				<p className="text-[0.7rem] font-semibold uppercase tracking-[0.38em] text-amber-700/80">
					Payroll access portal
				</p>
				<h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
					Bin Mishal Travells
				</h1>
			</div>

			<div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm">
				<span className="h-2 w-2 rounded-full bg-emerald-500" />
				Admin, branch manager, and employee access
			</div>
		</header>
	)
}

export default Header
