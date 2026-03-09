import Ticket from "../models/Ticket.js";

export const createTicket = async (req, res) => {
  try {
    const { userId } = req;
    const { subject, category, priority, message } = req.body;

    if (!subject || !category || !message) {
      return res.json({ success: false, message: "Subject, category and message are required" });
    }

    const ticket = await Ticket.create({
      user: userId,
      subject,
      category,
      priority: priority || "medium",
      messages: [{ sender: userId, senderRole: "user", content: message }],
    });

    res.json({ success: true, message: "Ticket created", ticket });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getTenantTickets = async (req, res) => {
  try {
    const { userId } = req;
    const tickets = await Ticket.find({ user: userId }).select("subject category priority status createdAt updatedAt messages").sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { userId } = req;
    const { id } = req.params;

    const ticket = await Ticket.findById(id).populate("messages.sender", "name role");
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    if (ticket.user.toString() !== userId) return res.json({ success: false, message: "Not authorized" });

    res.json({ success: true, ticket });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const tenantReply = async (req, res) => {
  try {
    const { userId } = req;
    const { ticketId, content } = req.body;

    if (!content?.trim()) return res.json({ success: false, message: "Message cannot be empty" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    if (ticket.user.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (ticket.status === "closed") return res.json({ success: false, message: "This ticket is closed" });

    if (ticket.status === "resolved") {
      ticket.status = "open";
      ticket.resolvedAt = undefined;
    }

    ticket.messages.push({ sender: userId, senderRole: "user", content: content.trim() });
    await ticket.save();

    const newMessage = ticket.messages[ticket.messages.length - 1];
    res.json({ success: true, message: "Reply sent", newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAllTickets = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const tickets = await Ticket.find(filter).populate("user", "name email phone").sort({ updatedAt: -1 });
    res.json({ success: true, tickets });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminGetTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.findById(id).populate("user", "name email phone").populate("messages.sender", "name role");
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    res.json({ success: true, ticket });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminReply = async (req, res) => {
  try {
    const { userId } = req;
    const { ticketId, content } = req.body;

    if (!content?.trim()) return res.json({ success: false, message: "Message cannot be empty" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });
    if (ticket.status === "closed") return res.json({ success: false, message: "This ticket is closed" });

    if (ticket.status === "open") {
      ticket.status = "in_progress";
    }

    ticket.messages.push({ sender: userId, senderRole: "admin", content: content.trim() });
    await ticket.save();

    const newMessage = ticket.messages[ticket.messages.length - 1];
    res.json({ success: true, message: "Reply sent", newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId, status } = req.body;
    const allowed = ["open", "in_progress", "resolved", "closed"];
    if (!allowed.includes(status)) return res.json({ success: false, message: "Invalid status" });

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.json({ success: false, message: "Ticket not found" });

    ticket.status = status;
    if (status === "resolved") ticket.resolvedAt = new Date();
    if (status === "closed") ticket.closedAt = new Date();
    await ticket.save();

    res.json({ success: true, message: `Ticket marked as ${status}`, ticket });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
