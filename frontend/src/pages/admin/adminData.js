export const branches = [
	{
		id: 'dhaka-hq',
		name: 'Dhaka HQ',
		city: 'Dhaka',
		manager: 'Arafat Khan',
		employees: 54,
		status: 'Active',
		activity: ['Payroll closed for July', 'New joiner onboarding completed', 'Attendance audit passed'],
	},
	{
		id: 'chattogram',
		name: 'Chattogram Branch',
		city: 'Chattogram',
		manager: 'Nusrat Jahan',
		employees: 28,
		status: 'Active',
		activity: ['Shift roster updated', 'Overtime approvals reviewed', 'Local payroll prepared'],
	},
	{
		id: 'sylhet',
		name: 'Sylhet Branch',
		city: 'Sylhet',
		manager: 'Imran Hossain',
		employees: 17,
		status: 'Attention',
		activity: ['Pending document verification', 'Branch meeting scheduled', 'Employee transfer request open'],
	},
]

export const employees = [
	{
		id: 'e-101',
		name: 'Tanvir Rahman',
		company: 'Bin Mishal Travells',
		branch: 'Dhaka HQ',
		department: 'Finance',
		role: 'Payroll Executive',
		workerType: 'Under Kafala',
		salary: 54000,
		netSalary: 48600,
		incentive: 3500,
		loan: 2500,
		fine: 1000,
		fineWaived: 500,
		companyInvestment: 12000,
		promotionHistory: [
			{ year: 2022, salary: 36000, title: 'Junior Payroll Officer' },
			{ year: 2024, salary: 47000, title: 'Payroll Executive' },
			{ year: 2026, salary: 54000, title: 'Senior Payroll Executive' },
		],
		status: 'Active',
		photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23f59e0b"/><stop offset="1" stop-color="%231d4ed8"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>',
	},
	{
		id: 'e-102',
		name: 'Sadia Islam',
		company: 'Bin Mishal Travells',
		branch: 'Dhaka HQ',
		department: 'Human Resources',
		role: 'HR Officer',
		workerType: 'Outside Kafala',
		salary: 47000,
		netSalary: 42300,
		incentive: 2200,
		loan: 1000,
		fine: 0,
		fineWaived: 0,
		companyInvestment: 8500,
		promotionHistory: [
			{ year: 2021, salary: 31000, title: 'HR Assistant' },
			{ year: 2024, salary: 39000, title: 'HR Officer' },
			{ year: 2026, salary: 47000, title: 'Senior HR Officer' },
		],
		status: 'Active',
		photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23ec4899"/><stop offset="1" stop-color="%23f59e0b"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>',
	},
	{
		id: 'e-203',
		name: 'Rakib Hossain',
		company: 'Bin Mishal Travells',
		branch: 'Chattogram Branch',
		department: 'Operations',
		role: 'Operations Lead',
		workerType: 'Sariatul Binmishal',
		salary: 51000,
		netSalary: 45900,
		incentive: 2800,
		loan: 3000,
		fine: 1200,
		fineWaived: 0,
		companyInvestment: 15000,
		promotionHistory: [
			{ year: 2020, salary: 36000, title: 'Operations Officer' },
			{ year: 2023, salary: 43000, title: 'Senior Operations Lead' },
			{ year: 2026, salary: 51000, title: 'Operations Lead' },
		],
		status: 'Active',
		photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%2310b981"/><stop offset="1" stop-color="%230f172a"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>',
	},
	{
		id: 'e-204',
		name: 'Mim Akter',
		company: 'Bin Mishal Travells',
		branch: 'Chattogram Branch',
		department: 'Accounts',
		role: 'Accountant',
		workerType: 'Under Kafala',
		salary: 43000,
		netSalary: 38700,
		incentive: 1800,
		loan: 0,
		fine: 800,
		fineWaived: 300,
		companyInvestment: 9200,
		promotionHistory: [
			{ year: 2022, salary: 32000, title: 'Accounts Assistant' },
			{ year: 2025, salary: 38000, title: 'Accountant' },
			{ year: 2026, salary: 43000, title: 'Senior Accountant' },
		],
		status: 'On leave',
		photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%23f97316"/><stop offset="1" stop-color="%23be185d"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>',
	},
	{
		id: 'e-305',
		name: 'Tahmid Karim',
		company: 'Bin Mishal Travells',
		branch: 'Sylhet Branch',
		department: 'Branch Operations',
		role: 'Branch Officer',
		workerType: 'Outside Kafala',
		salary: 39000,
		netSalary: 35100,
		incentive: 1500,
		loan: 500,
		fine: 600,
		fineWaived: 0,
		companyInvestment: 7800,
		promotionHistory: [
			{ year: 2021, salary: 28000, title: 'Branch Assistant' },
			{ year: 2024, salary: 33000, title: 'Branch Coordinator' },
			{ year: 2026, salary: 39000, title: 'Branch Officer' },
		],
		status: 'Active',
		photoUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="%231d4ed8"/><stop offset="1" stop-color="%2306b6d4"/></linearGradient></defs><rect width="200" height="200" rx="100" fill="url(%23g)"/><circle cx="100" cy="78" r="38" fill="%23fff" fill-opacity="0.94"/><path d="M42 174c13-33 38-49 58-49s45 16 58 49" fill="%23fff" fill-opacity="0.94"/></svg>',
	},
]

export const initialAccessRequests = [
	{ id: 1, name: 'Nadia Karim', role: 'Branch Manager', branch: 'Sylhet Branch', status: 'Pending approval' },
	{ id: 2, name: 'Farhan Chowdhury', role: 'Employee', branch: 'Dhaka HQ', status: 'Pending approval' },
]

function calcRow(fields) {
	const totalMonthDays = 31
	const presentDays = fields.workingDays - fields.absentDays
	const perDayRate = (fields.perDayPayment ?? 0) > 0 ? fields.perDayPayment : 0
	const perDaysSalary = perDayRate > 0 ? perDayRate : +(fields.basic / totalMonthDays).toFixed(2)
	const overTime = fields.overTime ?? 0
	const grossSalary = +(fields.basic + fields.houseRent + fields.food + fields.commission + overTime).toFixed(2)
	const absentCost = +(fields.absentDays * perDaysSalary).toFixed(2)
	const totalDeduction = +(fields.loanAdjust + absentCost + fields.iqamaCost + fields.fine).toFixed(2)
	const netSalary = +(grossSalary - totalDeduction - fields.bankPay).toFixed(2)
	const remainingLoan = +(fields.advanceLoan - fields.loanAdjust).toFixed(2)
	return {
		...fields,
		presentDays,
		perDaysSalary,
		overTime,
		grossSalary,
		absentCost,
		totalDeduction,
		netSalary,
		remainingLoan,
	}
}

export const payrollRows = [
	calcRow({ slNo: 1, employeeId: 'e-101', name: 'Tanvir Rahman', joiningDate: '15-Mar-2022', designation: 'Central Manager', kafalaStatus: 'Under Kafala', branch: 'Head Office', workingDays: 31, absentDays: 2, otHours: 12, advanceLoan: 2500, basic: 3000, houseRent: 0, food: 0, commission: 0, loanAdjust: 500, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 2, employeeId: 'e-102', name: 'Sadia Islam', joiningDate: '10-Jun-2021', designation: 'Accounts Manager', kafalaStatus: 'Outside Kafala', branch: 'Head Office', workingDays: 31, absentDays: 1, otHours: 8, advanceLoan: 1000, basic: 2700, houseRent: 0, food: 0, commission: 0, loanAdjust: 300, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 3, employeeId: 'e-203', name: 'Rakib Hossain', joiningDate: '05-Jan-2020', designation: 'Operations Lead', kafalaStatus: 'Sariatul Binmishal', branch: 'Chattogram Branch', workingDays: 31, absentDays: 3, otHours: 14, advanceLoan: 3000, basic: 2500, houseRent: 0, food: 0, commission: 0, loanAdjust: 400, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 4, employeeId: 'e-204', name: 'Mim Akter', joiningDate: '12-Aug-2022', designation: 'Accountant', kafalaStatus: 'Under Kafala', branch: 'Chattogram Branch', workingDays: 31, absentDays: 4, otHours: 8, advanceLoan: 0, basic: 1800, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 5, employeeId: 'e-305', name: 'Tahmid Karim', joiningDate: '20-Nov-2021', designation: 'Branch Officer', kafalaStatus: 'Outside Kafala', branch: 'Sylhet Branch', workingDays: 31, absentDays: 2, otHours: 6, advanceLoan: 500, basic: 2200, houseRent: 0, food: 0, commission: 0, loanAdjust: 200, iqamaCost: 0, fine: 100, bankPay: 0 }),
	calcRow({ slNo: 6, employeeId: 'e-106', name: 'Md. Ariful Haque', joiningDate: '01-Sep-2023', designation: 'Accounts Sr.Executive', kafalaStatus: 'Under Kafala', branch: 'Head Office', workingDays: 31, absentDays: 0, otHours: 10, advanceLoan: 1800, basic: 1800, houseRent: 0, food: 0, commission: 0, loanAdjust: 1800, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 7, employeeId: 'e-107', name: 'Abu Faysal Fahim', joiningDate: '14-Feb-2023', designation: 'Asst.Manager (Audit)', kafalaStatus: 'Under Kafala', branch: 'Head Office', workingDays: 31, absentDays: 0, otHours: 5, advanceLoan: 7000, basic: 2200, houseRent: 0, food: 0, commission: 0, loanAdjust: 700, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 8, employeeId: 'e-108', name: 'Emon', joiningDate: '05-May-2024', designation: 'Social Media Executive', kafalaStatus: 'Under Kafala', branch: 'Head Office', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 0, basic: 2000, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 9, employeeId: 'e-109', name: 'Mohammad Foysal Hossain', joiningDate: '10-Mar-2024', designation: 'PS Of Chairman', kafalaStatus: 'Under Kafala', branch: 'Head Office', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 0, basic: 1500, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 10, employeeId: 'e-110', name: 'Atik Ullah Arif', joiningDate: '01-Jan-2025', designation: 'Ticket Staff', kafalaStatus: 'Under Kafala', branch: 'Dammam', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 0, basic: 3000, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 11, employeeId: 'e-111', name: 'Kazi Imrul Kayes Aunto', joiningDate: '15-Jul-2022', designation: 'General-Amal Staff', kafalaStatus: 'Under Kafala', branch: 'Dammam', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 29769, basic: 2100, houseRent: 0, food: 0, commission: 0, loanAdjust: 1000, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 12, employeeId: 'e-112', name: 'Md.Rakib Hossain', joiningDate: '20-Jan-2024', designation: 'General-Amal Staff', kafalaStatus: 'Under Kafala', branch: 'Dammam', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 0, basic: 1500, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 13, employeeId: 'e-113', name: 'Tahsin Ahmed', joiningDate: '08-Aug-2023', designation: 'Ticket Staff', kafalaStatus: 'Under Kafala', branch: 'Dammam', workingDays: 31, absentDays: 0, otHours: 0, advanceLoan: 1925, basic: 2000, houseRent: 0, food: 0, commission: 0, loanAdjust: 225, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 14, employeeId: 'e-114', name: 'Bipul Kumar Mitra', joiningDate: '12-Apr-2025', designation: 'Cargo Stuff', kafalaStatus: 'Under Kafala', branch: 'Dammam', workingDays: 31, absentDays: 0, otHours: 12, advanceLoan: 0, basic: 1200, houseRent: 0, food: 100, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 0 }),
	calcRow({ slNo: 15, employeeId: 'e-115', name: 'Awad Al-Rashidi', joiningDate: '01-Mar-2023', designation: 'Saudi Amel', kafalaStatus: 'Saudi', branch: 'Dammam', workingDays: 31, absentDays: 31, otHours: 0, advanceLoan: 3500, basic: 4000, houseRent: 0, food: 0, commission: 0, loanAdjust: 0, iqamaCost: 0, fine: 0, bankPay: 4000 }),
]

export function formatCurrency(amount) {
	if (amount == null || isNaN(amount)) return '৳0'
	return `৳${Number(amount).toLocaleString('en-BD')}`
}