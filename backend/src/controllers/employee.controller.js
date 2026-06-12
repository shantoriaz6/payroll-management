import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Employee } from '../model/employee.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.resolve('public/uploads');

function saveLocalCopy(filePath, originalname) {
    const filename = `${Date.now()}-${originalname}`;
    const dest = path.join(UPLOADS_DIR, filename);
    fs.cpSync(filePath, dest);
    return `/uploads/${filename}`;
}

const createEmployee = asyncHandler(async (req, res) => {
    const body = { ...req.body };

    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

    if (req.files?.photo?.[0]) {
        const localUrl = saveLocalCopy(req.files.photo[0].path, req.files.photo[0].originalname);
        const result = await uploadOnCloudinary(req.files.photo[0].path);
        body.photoUrl = result ? result.secure_url : localUrl;
    }

    if (req.files?.legalDocFile?.length) {
        const titles = Array.isArray(req.body.legalDocTitle)
            ? req.body.legalDocTitle
            : [req.body.legalDocTitle];
        const docs = [];
        for (let i = 0; i < req.files.legalDocFile.length; i++) {
            const localUrl = saveLocalCopy(req.files.legalDocFile[i].path, req.files.legalDocFile[i].originalname);
            const result = await uploadOnCloudinary(req.files.legalDocFile[i].path);
            if (result) {
                docs.push({
                    title: titles[i] || '',
                    fileName: req.files.legalDocFile[i].originalname,
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            } else {
                docs.push({
                    title: titles[i] || '',
                    fileName: req.files.legalDocFile[i].originalname,
                    url: localUrl,
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
