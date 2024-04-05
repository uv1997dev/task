import express from "express";
import { mailLogin, createSchedule, getAccessPage } from "../controller/main.js";
import { authToken } from "../middleWare/authToken.js";
const router = express.Router()

//admin login
router.post("/login", mailLogin)
router.post("/schedule", createSchedule)
router.get("/dashboard", authToken ,getAccessPage)


export default router