const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please, provide name"],
    minLength: 3,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, "Please, provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please, provide valid email",
    },
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please, provide password"],
    minLength: 6,
  },
  role: { type: String, enum: ["user", "admin"], default: "user" },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordValid = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
