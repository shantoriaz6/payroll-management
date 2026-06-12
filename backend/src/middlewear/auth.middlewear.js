import jwt from 'jsonwebtoken';
import { apiError } from '../utils/apiError.js';
import { Admin } from '../model/admin.model.js';

export const verifyJWT = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new apiError(401, 'Unauthorized request');
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const admin = await Admin.findById(decoded._id).select('-password -refreshToken');

        if (!admin) {
            throw new apiError(401, 'Invalid access token');
        }

        req.admin = admin;
        next();
    } catch (error) {
        next(error);
    }
};
