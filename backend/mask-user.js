require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { faker } = require('@faker-js/faker');
const User = require('./models/User');

async function maskData() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});

    for (let user of users) {
        // Hash password
        const hashedPassword = await bcrypt.hash(user.password || 'default123', 10);
        // Gen ngẫu nhiên số điện thoại
        const fakePhone = faker.phone.number('+84 9## ### ###');

        await User.updateOne(
            { _id: user._id },
            { $set: { password: hashedPassword, phone: fakePhone } }
        );
    }

    console.log('✅ Mask dữ liệu thành công!');
    await mongoose.disconnect();
}

maskData().catch(console.error);