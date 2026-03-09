import express from "express";
import { protect, requireOwner, requireTenant } from "../middleware/auth.js";
import { createVisit, checkVisit, getOwnerVisits, rejectVisit, scheduleVisit, markVisited, getTenantVisits, cancelVisit, submitDecision } from "../controllers/visitController.js";

const visitRouter = express.Router();

visitRouter.get("/check/:listingId", protect, requireTenant, checkVisit);
visitRouter.post("/create", protect, requireTenant, createVisit);

// Owner visit management
visitRouter.get("/owner/visits", protect, requireOwner, getOwnerVisits);
visitRouter.post("/reject", protect, requireOwner, rejectVisit);
visitRouter.post("/schedule", protect, requireOwner, scheduleVisit);
visitRouter.post("/mark-visited", protect, requireOwner, markVisited);

// Tenant visit management
visitRouter.get("/tenant/visits", protect, requireTenant, getTenantVisits);
visitRouter.post("/cancel", protect, requireTenant, cancelVisit);
visitRouter.post("/decision", protect, requireTenant, submitDecision);

export default visitRouter;