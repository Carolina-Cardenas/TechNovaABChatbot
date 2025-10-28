import express from "express";
import { handleAskQuestion } from "../controllers/askQuestion.mjs";
import { handleError } from "../utils/errorHandler.mjs";

const router = express.Router();

router.post("/", handleAskQuestion);

export default router;
