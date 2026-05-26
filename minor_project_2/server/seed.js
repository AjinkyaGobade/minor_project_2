const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Certification = require('./models/Certification');
const bcrypt = require('bcrypt');

dotenv.config();

const providers = ['NPTEL', 'Infosys Springboard', 'Coursera', 'Udemy', 'AWS', 'Google', 'Microsoft'];
const categories = ['Technical', 'Soft Skills', 'Management', 'Other'];
const statuses = ['Approved', 'Pending', 'Rejected'];
const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'ISE'];
const years = [2022, 2023, 2024, 2025];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const generateRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('Connected to Database. Clearing old data...');
        await User.deleteMany();
        await Certification.deleteMany();

        console.log('Seeding Users...');
        
        // Create Admin
        const admin = new User({
            name: 'SDMCET Admin',
            email: 'admin@sdmcet.ac.in',
            password: 'password', // will be hashed in pre-save
            role: 'admin',
            department: 'CSE'
        });
        await admin.save();

        const users = [];

        // Create Faculty
        for (let i = 0; i < 5; i++) {
            const faculty = new User({
                name: `Faculty ${i+1}`,
                email: `faculty${i+1}@sdmcet.ac.in`,
                password: 'password',
                role: 'faculty',
                department: departments[i % departments.length],
                employeeId: `FAC00${i+1}`
            });
            await faculty.save();
            users.push(faculty);
        }

        // Create Students
        for (let i = 0; i < 20; i++) {
            const student = new User({
                name: `Student ${i+1}`,
                email: `student${i+1}@sdmcet.ac.in`,
                password: 'password',
                role: 'student',
                department: departments[i % departments.length],
                semester: (i % 8) + 1,
                rollNo: `2SD21CS0${i < 10 ? '0'+i : i}`
            });
            await student.save();
            users.push(student);
        }

        console.log(`Created ${users.length} users.`);

        console.log('Seeding Certifications...');
        const certs = [];
        for (let i = 0; i < 150; i++) {
            const randomUser = generateRandomItem(users);
            const status = generateRandomItem(statuses);
            const cert = new Certification({
                user: randomUser._id,
                uploadedBy: randomUser.name,
                title: `Certification Course ${i+1}`,
                description: `Successfully completed a certification in advanced topics.`,
                category: generateRandomItem(categories),
                provider: generateRandomItem(providers),
                year: generateRandomItem(years),
                month: generateRandomItem(months),
                tags: ['Certification', 'Skill', generateRandomItem(categories)],
                fileUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop',
                status: status,
                adminFeedback: status === 'Rejected' ? 'Document not clear or missing details.' : '',
                verifiedBy: status !== 'Pending' ? admin._id : null
            });
            certs.push(cert);
        }
        await Certification.insertMany(certs);
        console.log(`Created ${certs.length} certifications.`);

        console.log('Database Seeding Completed Successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
