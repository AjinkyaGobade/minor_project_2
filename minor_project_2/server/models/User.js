const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['student', 'faculty', 'admin'], default: 'student' },
        department: { type: String },
        semester: { type: Number },
        employeeId: { type: String },
        rollNo: { type: String, unique: true, sparse: true },
        profileImage: { type: String, default: 'https://via.placeholder.com/150' },
        resetPasswordToken: String,
        resetPasswordExpire: Date,
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
