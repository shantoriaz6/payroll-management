import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Employee } from '../model/employee.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const createEmployee = asyncHandler(async (req, res) => {
    const body = { ...req.body };

    // Upload profile photo
    if (req.files?.photo?.[0]) {
        const result = await uploadOnCloudinary(req.files.photo[0].path);
        if (result) body.photoUrl = result.url;
    }

    // Upload legal documents
    if (req.files?.legalDocFile?.length) {
        const titles = Array.isArray(req.body.legalDocTitle)
            ? req.body.legalDocTitle
            : [req.body.legalDocTitle];
        const docs = [];
        for (let i = 0; i < req.files.legalDocFile.length; i++) {
            const result = await uploadOnCloudinary(req.files.legalDocFile[i].path);
            if (result) {
                docs.push({
                    title: titles[i] || '',
                    fileName: req.files.legalDocFile[i].originalname,
                    url: result.url,
                    publicId: result.public_id,
                });
            }
        }
        body.legalDocuments = docs;
    }

    const employee = await Employee.create(body);
    return res.status(201).json(new apiResponse(201, employee, 'Employee created'));
});

const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await Employee.find().populate('branch', 'name city').sort({ createdAt: -1 });
    return res.status(200).json(new apiResponse(200, employees));
});

const getEmployeeById = asyncHandler(async (req, res) => {
    const employee = await Employee.findById(req.params.id).populate('branch', 'name city');
    if (!employee) throw new apiError(404, 'Employee not found');
    return res.status(200).json(new apiResponse(200, employee));
});

const updateEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!employee) throw new apiError(404, 'Employee not found');
    return res.status(200).json(new apiResponse(200, employee, 'Employee updated'));
});

const deleteEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) throw new apiError(404, 'Employee not found');
    return res.status(200).json(new apiResponse(200, null, 'Employee deleted'));
});

export { createEmployee, getAllEmployees, getEmployeeById, updateEmployee, deleteEmployee };
