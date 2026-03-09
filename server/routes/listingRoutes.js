import express from "express";
import { protect, requireAdmin } from "../middleware/auth.js";
import { createListing, deleteListing, getFeaturedListings, getListingData, getOwnerListings, getPublishedListings, adminGetAllListings, adminUpdateListingStatus, adminToggleFeatured } from "../controllers/listingController.js";
import { uploadImages } from "../middleware/multer.js";

const listingRouter = express.Router();

listingRouter.get("/featured", getFeaturedListings);
listingRouter.get("/properties", getPublishedListings);
listingRouter.get("/owner/listings", protect, getOwnerListings);

listingRouter.get("/admin/all", protect, requireAdmin, adminGetAllListings);
listingRouter.post("/admin/status", protect, requireAdmin, adminUpdateListingStatus);
listingRouter.get("/:id", getListingData);
listingRouter.post("/create", uploadImages, protect, createListing);
listingRouter.post("/delete", protect, deleteListing);
listingRouter.post("/admin/feature", protect, requireAdmin, adminToggleFeatured);

export default listingRouter;
