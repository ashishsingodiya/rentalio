import express from "express";
import { protect } from "../middleware/auth.js";
import { getOwnerMoveIns, setInventory, confirmMoveIn, getTenantMoveIns, getMoveInDetail, uploadDocuments, confirmAgreement, confirmInventory, removeDocument } from "../controllers/moveInController.js";
import { uploadFile } from "../middleware/multer.js";

const moveInRouter = express.Router();

moveInRouter.get("/owner", protect, getOwnerMoveIns);
moveInRouter.post("/owner/inventory", protect, setInventory);
moveInRouter.post("/owner/confirm", protect, confirmMoveIn);

moveInRouter.get("/tenant", protect, getTenantMoveIns);
moveInRouter.get("/:id", protect, getMoveInDetail);
moveInRouter.post("/tenant/documents", protect, uploadFile, uploadDocuments);
moveInRouter.post("/tenant/agreement", protect, confirmAgreement);
moveInRouter.post("/tenant/inventory/confirm", protect, confirmInventory);
moveInRouter.post("/tenant/documents/remove", protect, removeDocument);

export default moveInRouter;
