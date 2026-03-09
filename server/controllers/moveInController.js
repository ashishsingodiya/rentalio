import MoveIn from "../models/MoveIn.js";
import Listing from "../models/Listing.js";
import imagekit from "../configs/imagekit.js";
import Visit from "../models/Visit.js";

export const getOwnerMoveIns = async (req, res) => {
  try {
    const { userId } = req;
    const moveIns = await MoveIn.find({ owner: userId }).populate("listing", "title location gallery price").populate("tenant", "name email phone").sort({ createdAt: -1 });
    res.json({ success: true, moveIns });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const setInventory = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.json({ success: false, message: "Provide at least one inventory item" });
    }

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.owner.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (!["awaiting_owner_setup", "pending"].includes(moveIn.status)) {
      return res.json({ success: false, message: "Cannot update inventory at this stage" });
    }

    moveIn.checklist.inventory.items = items;
    if (moveIn.status === "awaiting_owner_setup") {
      moveIn.status = "pending";
    }
    await moveIn.save();

    res.json({ success: true, message: "Inventory saved", moveIn });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const confirmMoveIn = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId } = req.body;

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.owner.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (moveIn.status !== "ready") {
      return res.json({ success: false, message: "Tenant has not completed the checklist yet" });
    }

    moveIn.status = "moved_in";
    moveIn.movedInAt = new Date();
    await moveIn.save();

    await Listing.findByIdAndUpdate(moveIn.listing, { status: "rented" });
    await Visit.findByIdAndUpdate(moveIn.visit, { $set: { "decision.hasMovedIn": true } });

    res.json({ success: true, message: "Tenant marked as moved in" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getTenantMoveIns = async (req, res) => {
  try {
    const { userId } = req;
    const moveIns = await MoveIn.find({ tenant: userId }).populate("listing", "title location gallery price").populate("owner", "name email phone").sort({ createdAt: -1 });
    res.json({ success: true, moveIns });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getMoveInDetail = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    const moveIn = await MoveIn.findById(id).populate("listing", "title location gallery price").populate("owner", "name email phone").populate("tenant", "name email phone");

    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    const isTenant = moveIn.tenant._id.toString() === userId;
    const isOwner = moveIn.owner._id.toString() === userId;
    if (!isTenant && !isOwner) return res.json({ success: false, message: "Not authorized" });

    res.json({ success: true, moveIn });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const uploadDocuments = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId, label } = req.body;

    if (!req.file) return res.json({ success: false, message: "No file uploaded" });
    if (!label) return res.json({ success: false, message: "Document label is required" });

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.tenant.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (moveIn.status !== "pending") return res.json({ success: false, message: "Cannot upload at this stage" });

    const uploadedFile = await imagekit.upload({
      file: req.file.buffer,
      fileName: `movein_doc_${Date.now()}_${req.file.originalname}`,
      folder: "/Rentalio/movein-docs",
    });

    moveIn.checklist.documents.files.push({ label, url: uploadedFile.url, uploadedAt: new Date() });
    moveIn.checklist.documents.completed = moveIn.checklist.documents.files.length > 0;

    checkAndMarkReady(moveIn);
    await moveIn.save();

    res.json({ success: true, message: "Document uploaded", file: { label, url: uploadedFile.url } });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const confirmAgreement = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId } = req.body;

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.tenant.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (moveIn.status !== "pending") return res.json({ success: false, message: "Cannot confirm at this stage" });

    moveIn.checklist.agreement.completed = true;
    moveIn.checklist.agreement.confirmedAt = new Date();

    checkAndMarkReady(moveIn);
    await moveIn.save();

    res.json({ success: true, message: "Agreement confirmed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const confirmInventory = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId } = req.body;

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.tenant.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (moveIn.status !== "pending") return res.json({ success: false, message: "Cannot confirm at this stage" });
    if (moveIn.checklist.inventory.items.length === 0) {
      return res.json({ success: false, message: "Owner has not added inventory items yet" });
    }

    moveIn.checklist.inventory.completed = true;
    moveIn.checklist.inventory.confirmedAt = new Date();

    checkAndMarkReady(moveIn);
    await moveIn.save();

    res.json({ success: true, message: "Inventory confirmed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const removeDocument = async (req, res) => {
  try {
    const { userId } = req;
    const { moveInId, fileUrl } = req.body;

    const moveIn = await MoveIn.findById(moveInId);
    if (!moveIn) return res.json({ success: false, message: "Move-in record not found" });
    if (moveIn.tenant.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (moveIn.status !== "pending") return res.json({ success: false, message: "Cannot modify at this stage" });

    moveIn.checklist.documents.files = moveIn.checklist.documents.files.filter((f) => f.url !== fileUrl);
    moveIn.checklist.documents.completed = moveIn.checklist.documents.files.length > 0;

    await moveIn.save();
    res.json({ success: true, message: "Document removed" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// helper fn
function checkAndMarkReady(moveIn) {
  const { documents, agreement, inventory } = moveIn.checklist;
  if (documents.completed && agreement.completed && inventory.completed) {
    moveIn.status = "ready";
  }
}
