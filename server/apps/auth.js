import { Router } from "express";
import bcrypt from "bcrypt";
import { db } from "../utils/db.js";
import Jwt from "jsonwebtoken";
import dotenv from "dotenv";

const authRouter = Router();
dotenv.config();
authRouter.post("/register", async (req, res) => {
  console.log("request had come");
  const user = {
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstName,
    lastname: req.body.lastName,
  };
  console.log(req.body.firstName);
  console.log(req.body.lastName);
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  const collection = db.collection("user");
  await collection.insertOne(user);

  return res.json({ message: `User has been created successfully` });
});

authRouter.post("/login", async (req, res) => {
  const userFormReq = req.body.username;
  const collection = db.collection("user");
  const userFormDataBase = await collection.findOne({ username: userFormReq });

  if (!userFormDataBase) {
    return res.status(404).json({ message: "user not found" });
  }

  const comparePass = await bcrypt.compare(
    userFormReq,
    userFormDataBase.password
  );

  if (!comparePass) {
    return res.status(404).json({ message: "password incorrect" });
  }
  const token = Jwt.sign(
    {
      id: userFormDataBase._id,
      firstname: userFormDataBase.firstname,
      lastname: userFormDataBase.lastname,
    },
    process.env.SECRET_KEY,
    {
      expiresIn: "90000",
    }
  );

  return res.json({ message: "login successfully", token });
});

export default authRouter;
