import { Router } from 'express';
import { verifyJWT } from '../middlewear/auth.middlewear.js';
import {
    createBranch,
    getAllBranches,
    getBranchById,
    updateBranch,
    deleteBranch,
} from '../controllers/branch.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
    .get(getAllBranches)
    .post(createBranch);

router.route('/:id')
    .get(getBranchById)
    .put(updateBranch)
    .delete(deleteBranch);

export default router;
