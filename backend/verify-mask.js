require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function verify() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({});

    let allValid = true;

    for (let user of users) {
        // Kiểm tra format Hash của bcrypt (bắt đầu bằng $2a$, $2b$,...)
        const isPasswordHashed = /^\$2[ayb]\$.{56}$/.test(user.password);
        const hasPhone = user.phone && user.phone.length > 0;

        if (!isPasswordHashed || !hasPhone) {
            console.error(`❌ User ${user._id} chưa được mask hợp lệ!`);
            allValid = false;
        }
    }

    if (allValid) {
        console.log('✅ TẤT CẢ DỮ LIỆU ĐÃ ĐƯỢC MASK VÀ XÁC MINH THÀNH CÔNG!');
    }

    await mongoose.disconnect();
}

verify().catch(console.error);