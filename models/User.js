const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    email: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    password: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    image: {
      type: String,
      required: false,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQW2LMzE3nf64Hl0LCHoOuvmLce3P1UtX3FLZ4jpIcS6g&s",
    },
    phone: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 255,
    },
    gender: {
      type: String,
      required: true,
      enum: ["MALE", "FEMALE", "PREFER NOT TO SAY"],
      minLength: 2,
      maxLength: 255,
    },
    github: {
      type: String,
      required: false,
      default: "N/A",
      maxLength: 255,
    },
    linkedin: {
      type: String,
      required: false,
      default: "N/A",
      maxLength: 255,
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);


const User = mongoose.model("User", userSchema);
exports.User = User;
