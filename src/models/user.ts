import * as mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

import config from "../environments";

export interface IUser extends mongoose.Document {
  name: string;
  password: string;
  role: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, "Nom invalide! Veuillez utiliser au moins 2 caractères"],
      maxlength: [
        50,
        "Nom invalide! Le nombre maximum de caractères autorisé est de 50 caractères",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
      minlength: [6, "Mot de passe invalide! Veuillez utiliser au moins 6 caractères"],
    },
    role: {
      type: String,
      default: "etudiant",
      enum: ["prof", "etudiant"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email invalide!",
      ],
    },
    image: {
      type: String,
      required: false,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      required: false,
    },
  },
  { _id: true }
);

UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


UserSchema.methods.generateAccessToken = function (expireTime = 10) {
  return jwt.sign(
    {
      _id: (this as any)._id,
      role: (this as any).role,
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: expireTime ? `${expireTime}h` : "10h",
    }
  );
};


UserSchema.methods.generateRefreshToken = function () {
  const refreshSecret = `${config.REFRESH_TOKEN_SECRET}${(this as any).password}`;
  return jwt.sign(
    {
      _id: (this as any)._id,
      role: (this as any).role,
    },
    refreshSecret,
    {
      expiresIn: "5d",
    }
  );
};


UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, (this as any).password);
};

export default mongoose.model("User", UserSchema);
