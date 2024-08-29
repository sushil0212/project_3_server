/* //user.model.js
const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    profilePic: String,
    //username: String,
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    username: {
      type: String,
      required: [true, "userName is required."],
    },
    cvUrl: { type: String },
    companyInfo: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    shorts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Short",
      },
    ],
    
  },
  
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
 */

// user.model.js
const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    profilePic: String,
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    username: {
      type: String,
      required: [true, "userName is required."],
    },
    cvUrl: { type: String },
    companyInfo: {
      type: Schema.Types.ObjectId,
      ref: "Job",
    },
    shorts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Short",
      },
    ],
    savedShorts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Short",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
