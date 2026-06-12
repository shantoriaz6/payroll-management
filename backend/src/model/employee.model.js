import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            trim: true,
        },
        contactNumber: {
            type: String,
            trim: true,
        },
        joiningDate: {
            type: Date,
        },
        designation: {
            type: String,
            trim: true,
        },
        department: {
            type: String,
            trim: true,
        },
        kafalaStatus: {
            type: String,
            trim: true,
        },
        branch: {
            type: Schema.Types.ObjectId,
            ref: 'Branch',
        },
        branchName: {
            type: String,
            trim: true,
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
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
        photoUrl: {
            type: String,
            default: '',
        },
        legalDocuments: [
            {
                title: { type: String },
                fileName: { type: String },
                url: { type: String },
                publicId: { type: String },
            },
        ],
        companyInvestment: {
            type: Number,
            default: 0,
        },
        promotionHistory: [
            {
                year: { type: Number },
                title: { type: String },
                salary: { type: Number },
            },
        ],
    },
    { timestamps: true }
);

export const Employee = mongoose.model('Employee', employeeSchema);
