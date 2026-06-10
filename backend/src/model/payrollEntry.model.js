import mongoose, { Schema } from 'mongoose';

const payrollEntrySchema = new Schema(
    {
        employee: {
            type: Schema.Types.ObjectId,
            ref: 'Employee',
            required: true,
        },
        month: {
            type: Number,
            required: true,
            min: 1,
            max: 12,
        },
        year: {
            type: Number,
            required: true,
        },
        slNo: {
            type: Number,
        },
        workingDays: {
            type: Number,
            default: 30,
        },
        absentDays: {
            type: Number,
            default: 0,
        },
        otHours: {
            type: Number,
            default: 0,
        },
        advanceLoan: {
            type: Number,
            default: 0,
        },
        basic: {
            type: Number,
            default: 0,
        },
        houseRent: {
            type: Number,
            default: 0,
        },
        food: {
            type: Number,
            default: 0,
        },
        commission: {
            type: Number,
            default: 0,
        },
        perDayPayment: {
            type: Number,
            default: 0,
        },
        loanAdjust: {
            type: Number,
            default: 0,
        },
        iqamaCost: {
            type: Number,
            default: 0,
        },
        fine: {
            type: Number,
            default: 0,
        },
        bankPay: {
            type: Number,
            default: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'unpaid'],
            default: 'unpaid',
        },
        presentDays: {
            type: Number,
            default: 0,
        },
        perDaysSalary: {
            type: Number,
            default: 0,
        },
        overTime: {
            type: Number,
            default: 0,
        },
        grossSalary: {
            type: Number,
            default: 0,
        },
        absentCost: {
            type: Number,
            default: 0,
        },
        totalDeduction: {
            type: Number,
            default: 0,
        },
        netSalary: {
            type: Number,
            default: 0,
        },
        remainingLoan: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

payrollEntrySchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

export const PayrollEntry = mongoose.model('PayrollEntry', payrollEntrySchema);
