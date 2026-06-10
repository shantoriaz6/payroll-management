import { Router } from 'express';
import { verifyJWT } from '../middlewear/auth.middlewear.js';
import {
    createPayrollEntry,
    getAllPayrollEntries,
    getPayrollEntryById,
    updatePayrollEntry,
    deletePayrollEntry,
    generatePayroll,
} from '../controllers/payroll.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
    .get(getAllPayrollEntries)
    .post(createPayrollEntry);

router.post('/generate', generatePayroll);

router.route('/:id')
    .get(getPayrollEntryById)
    .put(updatePayrollEntry)
    .delete(deletePayrollEntry);

export default router;
