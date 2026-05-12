const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/brainbytes");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String
});

const ProblemSchema = new mongoose.Schema({
  title: String,
  description: String,
  difficulty: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const User = mongoose.model("User", UserSchema);
const Problem = mongoose.model("Problem", ProblemSchema);

async function seedProblems() {
  await Problem.deleteMany();

  const mentor = await User.findOne({ role: "mentor" });

  if (!mentor) {
    console.log("No mentor found. Run seedUsers.js first");
    return;
  }

  await Problem.insertMany([
    {
      title: "Two Sum",
      description: "Find two numbers that add up to target.",
      difficulty: "easy",
      author: mentor._id
    },
    {
      title: "Binary Search",
      description: "Implement binary search efficiently.",
      difficulty: "medium",
      author: mentor._id
    },
    {
      title: "LRU Cache",
      description: "Design and implement LRU cache.",
      difficulty: "hard",
      author: mentor._id
    }
  ]);

  console.log("Problems inserted");
  mongoose.connection.close();
}

seedProblems();