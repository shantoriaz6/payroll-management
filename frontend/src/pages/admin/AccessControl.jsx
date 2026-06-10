import { useState } from 'react'
import { Link } from 'react-router-dom'
import { initialAccessRequests } from './adminData.js'

function AccessControl() {
	const [requests, setRequests] = useState(initialAccessRequests)
	const [adminMessage, setAdminMessage] = useState('')
	const [newAdmin, setNewAdmin] = useState({ name: '', email: '', branch: 'Dhaka HQ' })

	function approveRequest(id) {
		setRequests((current) => current.filter((request) => request.id !== id))
		setAdminMessage('Role-based access approved.')
	}

	function createAdmin(event) {
		event.preventDefault()
		setAdminMessage(`New admin invite prepared for ${newAdmin.name || 'the selected user'}.`)
		setNewAdmin({ name: '', email: '', branch: 'Dhaka HQ' })
	}

	return (
		<section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
			<div className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
				<div className="flex items-start justify-between gap-4">
					<div>
						<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Admin functions</p>
						<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Role access approvals</h2>
						<p className="mt-2 text-sm leading-6 text-slate-600">Approve users, review access, and create new admins from this control area.</p>
					</div>
					<Link to="/admin/overview" className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-amber-50 hover:text-slate-950">
						Back to overview
					</Link>
				</div>

				<div className="mt-5 grid gap-3">
					{requests.length ? (
						requests.map((request) => (
							<div key={request.id} className="rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
								<div className="flex items-start justify-between gap-4">
									<div>
										<p className="font-semibold text-slate-950">{request.name}</p>
										<p className="text-sm text-slate-600">{request.role} • {request.branch}</p>
									</div>
									<span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">{request.status}</span>
								</div>
								<button type="button" onClick={() => approveRequest(request.id)} className="mt-4 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5 hover:bg-amber-700">
									Approve access
								</button>
							</div>
						))
					) : (
						<p className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">
							All role-based access requests are approved.
						</p>
					)}
				</div>
			</div>

			<div className="rounded-[2rem] border border-white/80 bg-white/82 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.1)] backdrop-blur-xl">
				<p className="text-[0.7rem] font-semibold uppercase tracking-[0.34em] text-amber-700/80">Create admin</p>
				<h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Make a new admin</h2>
				<p className="mt-2 text-sm leading-6 text-slate-600">Promote trusted users and connect them to a branch before sending the invite.</p>
				<form className="mt-5 grid gap-4" onSubmit={createAdmin}>
					<label className="grid gap-2 text-sm font-semibold text-slate-700">
						Name
						<input
							value={newAdmin.name}
							onChange={(event) => setNewAdmin((current) => ({ ...current, name: event.target.value }))}
							placeholder="Admin name"
							className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
						/>
					</label>
					<label className="grid gap-2 text-sm font-semibold text-slate-700">
						Email
						<input
							type="email"
							value={newAdmin.email}
							onChange={(event) => setNewAdmin((current) => ({ ...current, email: event.target.value }))}
							placeholder="admin@company.com"
							className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
						/>
					</label>
					<label className="grid gap-2 text-sm font-semibold text-slate-700">
						Branch
						<select
							value={newAdmin.branch}
							onChange={(event) => setNewAdmin((current) => ({ ...current, branch: event.target.value }))}
							className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
						>
							<option>Dhaka HQ</option>
							<option>Chattogram Branch</option>
							<option>Sylhet Branch</option>
						</select>
					</label>
					<button
						type="submit"
						className="rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-amber-700 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.24)]"
					>
						Create admin account
					</button>
				</form>
			</div>

			{adminMessage ? (
				<p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 xl:col-span-2">
					{adminMessage}
				</p>
			) : null}
		</section>
	)
}

export default AccessControl