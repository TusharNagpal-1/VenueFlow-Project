import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "./src/models/Usermodel.js";

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        const existingAdmin = await User.findOne({
            email: process.env.ADMIN_EMAIL
        });

        if (existingAdmin) {
            console.log("Admin already exists");
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    10
);

const admin = await User.create({
    username: "admin",
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin"
});


        console.log("Admin created successfully");
        console.log(admin.email);

        process.exit(0);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createAdmin();