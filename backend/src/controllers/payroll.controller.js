import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { PayrollEntry } from '../model/payrollEntry.model.js';
import { Employee } from '../model/employee.model.js';

function getMonthDays(month, year) {
    return new Date(year, month, 0).getDate();
}

function calcDerived(fields) {
    const monthDays = getMonthDays(fields.month || (new Date().getMonth() + 1), fields.year || new Date().getFullYear());
    const presentDays = fields.workingDays - fields.absentDays;
    const perDayRate = (fields.perDayPayment || 0) > 0 ? fields.perDayPayment : 0;
    const perDaysSalary = perDayRate > 0 ? perDayRate : (monthDays > 0 ? +((fields.basic || 0) / monthDays).toFixed(2) : 0);
    const overTime = fields.overTime || 0;
    const grossSalary = +((fields.basic || 0) + (fields.houseRent || 0) + (fields.food || 0) + (fields.commission || 0) + overTime).toFixed(2);
    const absentCost = +((fields.absentDays || 0) * perDaysSalary).toFixed(2);
    const totalDeduction = +((fields.loanAdjust || 0) + absentCost + (fields.iqamaCost || 0) + (fields.fine || 0)).toFixed(2);
    const netSalary = +(grossSalary - totalDeduction - (fields.bankPay || 0)).toFixed(2);
    const remainingLoan = +((fields.advanceLoan || 0) - (fields.loanAdjust || 0)).toFixed(2);
    return { presentDays, perDaysSalary, overTime, grossSalary, absentCost, totalDeduction, netSalary, remainingLoan };
}

const createPayrollEntry = asyncHandler(async (req, res) => {
    const derived = calcDerived(req.body);
    const { employee, month, year } = req.body;
    const entry = await PayrollEntry.findOneAndUpdate(
        { employee, month, year },
        { ...req.body, ...derived },
        { upsert: true, returnDocument: 'after', runValidators: true },
    );
    const populated = await entry.populate('employee', 'name designation kafalaStatus branchName joiningDate');
    return res.status(201).json(new apiResponse(201, populated, 'Payroll entry created'));
});

const getAllPayrollEntries = asyncHandler(async (req, res) => {
    const { month, year } = req.query;
    const filter = {};
    if (month) filter.month = parseInt(month);
    if (year) filter.year = parseInt(year);
    else filter.year = new Date().getFullYear();

    const entries = await PayrollEntry.find(filter)
        .populate('employee', 'name designation kafalaStatus branchName joiningDate')
        .sort({ slNo: 1 });
    return res.status(200).json(new apiResponse(200, entries));
});

const getPayrollEntryById = asyncHandler(async (req, res) => {
    const entry = await PayrollEntry.findById(req.params.id).populate('employee', 'name designation kafalaStatus branchName joiningDate');
    if (!entry) throw new apiError(404, 'Payroll entry not found');
    return res.status(200).json(new apiResponse(200, entry));
});

const updatePayrollEntry = asyncHandler(async (req, res) => {
    const existing = await PayrollEntry.findById(req.params.id);
    if (!existing) throw new apiError(404, 'Payroll entry not found');

    const merged = { ...existing.toObject(), ...req.body };
    delete merged._id;
    delete merged.__v;
    delete merged.createdAt;
    delete merged.updatedAt;

    if (merged.employee && typeof merged.employee === 'object') {
        merged.employee = merged.employee._id || merged.employee;
    }

    const derived = calcDerived(merged);
    const entry = await PayrollEntry.findByIdAndUpdate(
        req.params.id,
        { ...merged, ...derived },
        { new: true, runValidators: true }
    ).populate('employee', 'name designation kafalaStatus branchName joiningDate');
    return res.status(200).json(new apiResponse(200, entry, 'Payroll entry updated'));
});

const deletePayrollEntry = asyncHandler(async (req, res) => {
    const entry = await PayrollEntry.findByIdAndDelete(req.params.id);
    if (!entry) throw new apiError(404, 'Payroll entry not found');
    return res.status(200).json(new apiResponse(200, null, 'Payroll entry deleted'));
});

const generatePayroll = asyncHandler(async (req, res) => {
    const { month, year } = req.body;
    if (!month || !year) throw new apiError(400, 'Month and year are required');

    const employees = await Employee.find({ status: 'Active' });
    const results = [];

    for (const emp of employees) {
        const existing = await PayrollEntry.findOne({ employee: emp._id, month, year });
        if (existing) {
            results.push(existing);
            continue;
        }

        const data = {
            employee: emp._id,
            month,
            year,
            workingDays: getMonthDays(month, year),
            absentDays: 0,
            otHours: 0,
            advanceLoan: 0,
            basic: emp.basic || 0,
            houseRent: emp.houseRent || 0,
            food: emp.food || 0,
            commission: emp.commission || 0,
            perDayPayment: emp.perDayPayment || 0,
            loanAdjust: 0,
            iqamaCost: 0,
            fine: 0,
            bankPay: 0,
        };

        const derived = calcDerived(data);
        const entry = await PayrollEntry.create({ ...data, ...derived });
        results.push(entry);
    }

    const populated = await PayrollEntry.find({ month, year })
        .populate('employee', 'name designation kafalaStatus branchName joiningDate')
        .sort({ slNo: 1 });

    return res.status(200).json(new apiResponse(200, populated, 'Payroll generated'));
});

export {
    createPayrollEntry,
    getAllPayrollEntries,
    getPayrollEntryById,
    updatePayrollEntry,
    deletePayrollEntry,
    generatePayroll,
};
