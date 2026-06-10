import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Branch } from '../model/branch.model.js';

const createBranch = asyncHandler(async (req, res) => {
    const branch = await Branch.create(req.body);
    return res.status(201).json(new apiResponse(201, branch, 'Branch created'));
});

const getAllBranches = asyncHandler(async (req, res) => {
    const branches = await Branch.find().sort({ name: 1 });
    return res.status(200).json(new apiResponse(200, branches));
});

const getBranchById = asyncHandler(async (req, res) => {
    const branch = await Branch.findById(req.params.id);
    if (!branch) throw new apiError(404, 'Branch not found');
    return res.status(200).json(new apiResponse(200, branch));
});

const updateBranch = asyncHandler(async (req, res) => {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) throw new apiError(404, 'Branch not found');
    return res.status(200).json(new apiResponse(200, branch, 'Branch updated'));
});

const deleteBranch = asyncHandler(async (req, res) => {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) throw new apiError(404, 'Branch not found');
    return res.status(200).json(new apiResponse(200, null, 'Branch deleted'));
});

export { createBranch, getAllBranches, getBranchById, updateBranch, deleteBranch };
