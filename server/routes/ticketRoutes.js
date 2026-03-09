import express from "express";
import { protect } from "../middleware/auth.js";
import { createTicket, getTenantTickets, getTicketById, tenantReply, getAllTickets, adminGetTicket, adminReply, updateTicketStatus } from "../controllers/ticketController.js";

const ticketRouter = express.Router();

// Admin routes (must be before /:id to avoid route conflict)
ticketRouter.get("/admin/all", protect, getAllTickets);
ticketRouter.get("/admin/:id", protect, adminGetTicket);
ticketRouter.post("/admin/reply", protect, adminReply);
ticketRouter.post("/admin/status", protect, updateTicketStatus);

// Tenant routes
ticketRouter.post("/create", protect, createTicket);
ticketRouter.get("/my", protect, getTenantTickets);
ticketRouter.get("/:id", protect, getTicketById);
ticketRouter.post("/reply", protect, tenantReply);

export default ticketRouter;
