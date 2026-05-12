const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://127.0.0.1:27017/brainbytes");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model("User", UserSchema);

async function seedUsers() {
  await User.deleteMany();

  const users = [];

  // Learners
  for (let i = 1; i <= 20; i++) {
    users.push({
      username: `learner${i}`,
      email: `learner${i}@brainbytes.com`,
      password: await bcrypt.hash("123456", 10),
      role: "learner"
    });
  }

  // Mentors
  for (let i = 1; i <= 20; i++) {
    users.push({
      username: `mentor${i}`,
      email: `mentor${i}@brainbytes.com`,
      password: await bcrypt.hash("123456", 10),
      role: "mentor"
    });
  }

  await User.insertMany(users);

  console.log("40 users inserted successfully");
  mongoose.connection.close();
}

seedUsers();