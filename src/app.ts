import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import visitorRoutes from "./routes/visitorRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => res.send("College Gatepass Backend (Prisma + TS)"));
app.use("/api/visitors", visitorRoutes);

export default app;
