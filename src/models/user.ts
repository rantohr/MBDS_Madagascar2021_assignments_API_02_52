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
      minlength: [2, "Veuillez utiliser au moins 2 caractères"],
      maxlength: [
        50,
        "Le nombre maximum de caractères autorisé est de 50 caractères",
      ],
    },
    password: {
      type: String,
      required: true,
      select: false,
      trim: true,
      minlength: [6, "Veuillez utiliser au moins 6 caractères"],
    },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Invalid email",
      ],
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

/**
 * crypt user password before save
 */
UserSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * generate a jwt access token
 * @param expireTime token expire time in minutes
 * @returns string jwt signed access token
 */
UserSchema.methods.generateAccessToken = function (expireTime = 15) {
  return jwt.sign(
    {
      _id: (this as any)._id,
      role: (this as any).role,
    },
    config.ACCESS_TOKEN_SECRET,
    {
      expiresIn: expireTime ? `${expireTime}m` : "15m",
    }
  );
};

/**
 * generate a jwt refresh token
 * @returns string jwt signed refresh token
 */
UserSchema.methods.generateRefreshToken = function () {
  const refreshSecret = `${config.REFRESH_TOKEN_SECRET}${(this as any).password}`;
  return jwt.sign(
    {
      _id: (this as any)._id,
      role: (this as any).role,
    },
    refreshSecret,
    {
      expiresIn: "1d",
    }
  );
};

/**
 * match database password with user input
 * @returns boolean password matched
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, (this as any).password);
};

export default mongoose.model("user", UserSchema);
