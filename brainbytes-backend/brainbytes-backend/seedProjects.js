const mongoose = require("mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/brainbytes");

const UserSchema = new mongoose.Schema({
  username: String,
  role: String
});

const SnippetSchema = new mongoose.Schema({
  title: String,
  code: String,
  language: String,
  description: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

const User = mongoose.model("User", UserSchema);
const Snippet = mongoose.model("Snippet", SnippetSchema);

async function seedSnippets() {
  await Snippet.deleteMany();

  const mentor = await User.findOne({ role: "mentor" });

  await Snippet.insertMany([
    {
      title: "Factorial Function",
      code: "function factorial(n){ return n<=1 ? 1 : n*factorial(n-1)}",
      language: "javascript",
      description: "Recursive factorial example",
      author: mentor._id
    },
    {
      title: "Python List Comprehension",
      code: "squares = [x*x for x in range(10)]",
      language: "python",
      description: "Python comprehension example",
      author: mentor._id
    }
  ]);

  console.log("Snippets inserted");
  mongoose.connection.close();
}

seedSnippets();