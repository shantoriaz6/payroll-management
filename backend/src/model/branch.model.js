import mongoose, { Schema } from 'mongoose';

const branchSchema = new Schema(
    {
        name: {
            type: String,
            required: [true, 'Branch name is required'],
            trim: true,
        },
        city: {
            type: String,
            trim: true,
        },
        manager: {
            type: String,
            trim: true,
        },
        status: {
            type: String,
            enum: ['Active', 'Inactive', 'Attention'],
            default: 'Active',
        },
    },
    { timestamps: true }
);

export const Branch = mongoose.model('Branch', branchSchema);
