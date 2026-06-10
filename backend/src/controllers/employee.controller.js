import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Employee } from '../model/employee.model.js';

const createEmployee = asyncHandler(async (req, res) => {
    const employee = await Employee.create(req.body);
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
