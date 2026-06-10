import { Admin } from './model/admin.model.js';

const seedAdmin = async () => {
    try {
        const existingAdmin = await Admin.findOne({});

        if (existingAdmin) {
            console.log('Admin already exists');
            return;
        }

        await Admin.create({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
        });

        console.log('Admin created successfully');
    } catch (error) {
        console.log('Error seeding admin:', error.message);
    }
};

export default seedAdmin;
