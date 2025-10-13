import express from "express";
import { createVisitor, approveVisitor, scanVisitor,getAllVisitors,rejectVisitor,getVisitorById } from "../controllers/visitorController.js";

const router = express.Router();

router.post("/register", createVisitor);
router.put("/approve/:id", approveVisitor);
router.post("/scan", scanVisitor);
router.get("/", getAllVisitors);
router.put("/reject/:id", rejectVisitor);
router.get("/:id", getVisitorById);

export default router;
