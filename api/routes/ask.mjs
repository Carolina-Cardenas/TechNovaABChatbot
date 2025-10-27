import express from "express";
import { handleAskQuestion } from "../controllers/askQuestion.mjs";

const router = express.Router();

router.post("/", handleAskQuestion);

export default router;
