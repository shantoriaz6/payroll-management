import { Router } from 'express';
import { verifyJWT } from '../middlewear/auth.middlewear.js';
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
    .post(createEmployee);

router.route('/:id')
    .get(getEmployeeById)
    .put(updateEmployee)
    .delete(deleteEmployee);

export default router;
