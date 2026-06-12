import { Router } from 'express';
import { verifyJWT } from '../middlewear/auth.middlewear.js';
import { upload } from '../middlewear/multerMiddlewear.js';
import {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
} from '../controllers/employee.controller.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
    .get(getAllEmployees)
    .post(
        upload.fields([
            { name: 'photo', maxCount: 1 },
            { name: 'legalDocFile', maxCount: 10 },
        ]),
        createEmployee,
    );

router.route('/:id')
    .get(getEmployeeById)
    .put(
        upload.fields([
            { name: 'photo', maxCount: 1 },
            { name: 'legalDocFile', maxCount: 10 },
        ]),
        updateEmployee,
    )
    .delete(deleteEmployee);

export default router;
