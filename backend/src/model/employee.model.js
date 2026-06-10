import mongoose, { Schema } from 'mongoose';

const employeeSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        joiningDate: {
            type: Date,
        },
        designation: {
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
        status: {
            type: String,
            enum: ['Active', 'Inactive'],
            default: 'Active',
        },
    },
    { timestamps: true }
);

export const Employee = mongoose.model('Employee', employeeSchema);
