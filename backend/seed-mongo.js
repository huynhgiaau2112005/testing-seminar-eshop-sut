require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const initialUsers = [
    { name: "Nguyen Van A", email: "a@gmail.com", phone: null, password: "plainpassword123", imageUrl: "https://example.com/a.jpg" },
    { name: "Tran Thi B", email: "b@gmail.com", phone: null, password: "mypassword456", imageUrl: "https://example.com/b.jpg" }
];

async function run() {
    console.log("Gia tri env: " + process.env.MONGO_URI);
    await mongoose.connect(process.env.MONGO_URI);

    // 1. Reset Database
    await User.deleteMany({});
    console.log('✅ Database reset thành công!');

    // 2. Seed Data
    await User.insertMany(initialUsers);
    console.log('✅ Nạp dữ liệu mẫu thành công!');

    await mongoose.disconnect();
}

run().catch(console.error);

// docker run -d -p 27017:27017 --name mongodb mongo:latest