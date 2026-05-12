const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/brainbytes");

const UserSchema = new mongoose.Schema({
  username: String,
  role: String
});

const ForumSchema = new mongoose.Schema({
  title: String,
  body: String,
  tags: [String],
  solved: Boolean,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const User = mongoose.model("User", UserSchema);
const Forum = mongoose.model("Forum", ForumSchema);

async function seedForum() {
  await Forum.deleteMany();

  const learner = await User.findOne({ role: "learner" });

  await Forum.insertMany([
    {
      title: "How to learn React faster?",
      body: "I know JavaScript basics but struggle with React.",
      tags: ["react", "javascript"],
      solved: true,
      author: learner._id
    },
    {
      title: "MongoDB connection issue",
      body: "Getting mongoose connection error.",
      tags: ["mongodb", "nodejs"],
      solved: false,
      author: learner._id
    }
  ]);

  console.log("Forum inserted");
  mongoose.connection.close();
}

seedForum();