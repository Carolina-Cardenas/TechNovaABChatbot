import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chat.mjs";
import "dotenv/config";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/chat", chatRoutes);

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
