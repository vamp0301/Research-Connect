// src/services/auth.service.js

const User = require("../models/user.model");

class AuthService {

    // Find user by email
    async findUserByEmail(email) {
        return await User.findOne({ email });
    }

    // Find user by ID
    async findUserById(id) {
        return await User.findById(id);
    }

    // Create new user
    async createUser(userData) {
        const user = new User(userData);
        return await user.save();
    }

    // Update user
    async updateUser(id, data) {
        return await User.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators: true
            }
        );
    }

    // Delete user (Soft Delete)
    async deactivateUser(id) {
        return await User.findByIdAndUpdate(
            id,
            {
                isActive: false
            },
            {
                new: true
            }
        );
    }

}

module.exports = new AuthService();