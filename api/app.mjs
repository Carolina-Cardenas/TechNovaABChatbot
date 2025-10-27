import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.mjs";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use("/api/chat", chatRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
