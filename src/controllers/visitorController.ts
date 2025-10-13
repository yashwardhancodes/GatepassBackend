import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import cloudinary from "../config/cloudinary.js";
import { generateQrAndUpload } from "../utils/qrGenerator.js";

const prisma = new PrismaClient();

 
export const createVisitor = async (req: Request, res: Response) => {
  try {
    const {
      name,
      age,
      gender,
      mobile,
      email,
      address,
      reason,
      personToMeet,
      photo // base64 string
    } = req.body;

    const passId = uuidv4();
    let photoUrl: string | null = null;

    // ✅ Upload base64 image directly to Cloudinary
    if (photo && photo.startsWith("data:image")) {
      const uploadResponse = await cloudinary.uploader.upload(photo, {
        folder: "gatepass_photos",
      });
      photoUrl = uploadResponse.secure_url;
    } else {
      return res.status(400).json({ error: "Invalid or missing photo data" });
    }

    const visitor = await prisma.visitor.create({
      data: {
        name,
        age: Number(age),
        gender,
        mobile,
        email,
        address,
        reason,
        personToMeet,
        photoUrl,
        passId,
        status: "pending",
      },
    });

    res.status(201).json({
      message: "Visitor Registered Successfully",
      visitor,
    });
  } catch (error: any) {
    console.error("❌ Error registering visitor:", error);
    res.status(500).json({ error: error.message });
  }
};

export const approveVisitor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { allocatedMinutes } = req.body;

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    const qrUrl = await generateQrAndUpload(visitor.passId);

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        allocatedMinutes,
        status: "approved",
        approvalTime: new Date(),
        expiryTime: new Date(Date.now() + allocatedMinutes * 60000),
        qrUrl,
      },
    });

    const io = req.app.get("io");
    io?.emit("visitor:approved", updated);

    res.json({ message: "Visitor approved", visitor: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const scanVisitor = async (req: Request, res: Response) => {
  try {
    const { passId, photo } = req.body;
    const visitor = await prisma.visitor.findUnique({ where: { passId } });

    if (!visitor) return res.status(404).json({ message: "Invalid Pass ID" });
    if (visitor.expiryTime && visitor.expiryTime < new Date()) {
      return res.status(403).json({ message: "Pass expired" });
    }

    const io = req.app.get("io");

    // Entry
    if (!visitor.entryTime) {
      let photoUrl = visitor.photoUrl;
      if (photo) {
        const upload = await cloudinary.uploader.upload(photo, { folder: "gatepass_entry_captures" });
        photoUrl = upload.secure_url;
      }

      const updated = await prisma.visitor.update({
        where: { id: visitor.id },
        data: { entryTime: new Date(), status: "inside", photoUrl },
      });

      io?.emit("visitor:entered", updated);
      return res.json({ message: "Entry recorded", visitor: updated });
    }

    // Exit
    if (!visitor.exitTime) {
      const updated = await prisma.visitor.update({
        where: { id: visitor.id },
        data: { exitTime: new Date(), status: "exited" },
      });

      io?.emit("visitor:exited", updated);
      return res.json({ message: "Exit recorded", visitor: updated });
    }

    return res.status(400).json({ message: "Already exited" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getAllVisitors = async (req: Request, res: Response) => {
  try {
    const visitors = await prisma.visitor.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json({
      message: "All visitors fetched successfully",
      total: visitors.length,
      visitors,
    });
  } catch (error: any) {
    console.error("❌ Error fetching visitors:", error);
    res.status(500).json({ error: error.message });
  }
};


export const rejectVisitor = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { reason } = req.body;

    const visitor = await prisma.visitor.findUnique({ where: { id } });
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    const updated = await prisma.visitor.update({
      where: { id },
      data: {
        status: "rejected",
        rejectionTime: new Date(),
        rejectionReason: reason || "Not specified",
      },
    });

    const io = req.app.get("io");
    io?.emit("visitor:rejected", updated);

    res.json({
      message: "Visitor registration rejected successfully",
      visitor: updated,
    });
  } catch (err) {
    console.error("❌ Error rejecting visitor:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const getVisitorById = async (req: Request, res: Response) => {
  try {
    const passId = req.params.id; // the UUID string
 
    const visitor = await prisma.visitor.findUnique({
      where: { passId }, // fetch by passId instead of numeric id
    });

    if (!visitor) return res.status(404).json({ message: "Visitor not found" });

    res.json({ visitor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
