import Listing from "../models/Listing.js";
import Visit from "../models/Visit.js";
import MoveIn from "../models/MoveIn.js";

// Property details page -> visit requested hai ki nhi, boolean return karega
export const checkVisit = async (req, res) => {
  try {
    const { userId } = req;
    const { listingId } = req.params;

    const visit = await Visit.findOne({ visitor: userId, listing: listingId });
    res.json({ success: true, requested: !!visit });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Property details page par --> request visit button
export const createVisit = async (req, res) => {
  try {
    const { userId } = req;
    const { listingId, requestedSlot, message } = req.body;

    if (!requestedSlot) return res.json({ success: false, message: "Requested time slot is required" });

    const listing = await Listing.findById(listingId).select("owner");

    const isAlready = await Visit.findOne({ visitor: userId, listing: listingId });
    if (isAlready) return res.json({ success: false, message: "Already requested for visit" });

    await Visit.create({
      listing: listingId,
      visitor: userId,
      owner: listing.owner,
      status: "requested",
      requestedSlot,
      message,
    });

    res.json({ success: true, message: "Visit requested successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerVisits = async (req, res) => {
  try {
    const { userId } = req;

    const visits = await Visit.find({ owner: userId }).populate("listing", "title location gallery").populate("visitor", "name email phone").sort({ createdAt: -1 });

    res.json({ success: true, visits });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const rejectVisit = async (req, res) => {
  try {
    const { userId } = req;
    const { visitId } = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit) return res.json({ success: false, message: "Visit not found" });

    // Ek owner dusre owner ka data change nahi kar payega, Samajh rahe ho Big Boss
    if (visit.owner.toString() !== userId) return res.json({ success: false, message: "Not authorized" });

    if (!["requested", "scheduled"].includes(visit.status)) {
      return res.json({ success: false, message: "Cannot reject this visit" });
    }

    visit.status = "rejected";
    visit.scheduledSlot = null;
    await visit.save();

    res.json({ success: true, message: "Visit rejected" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getTenantVisits = async (req, res) => {
  try {
    const { userId } = req;

    const visits = await Visit.find({ visitor: userId }).populate("listing", "title location gallery").populate("owner", "name email phone").sort({ createdAt: -1 });

    res.json({ success: true, visits });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const { userId } = req;
    const { visitId } = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit) return res.json({ success: false, message: "Visit not found" });
    if (visit.visitor.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (!["requested", "scheduled"].includes(visit.status)) {
      return res.json({ success: false, message: "Cannot cancel this visit" });
    }

    visit.status = "cancelled";
    await visit.save();

    res.json({ success: true, message: "Visit cancelled" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const markVisited = async (req, res) => {
  try {
    const { userId } = req;
    const { visitId } = req.body;

    const visit = await Visit.findById(visitId);
    if (!visit) return res.json({ success: false, message: "Visit not found" });
    if (visit.owner.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (visit.status !== "scheduled") {
      return res.json({ success: false, message: "Only scheduled visits can be marked as visited" });
    }

    visit.status = "visited";
    await visit.save();

    res.json({ success: true, message: "Visit marked as visited" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const scheduleVisit = async (req, res) => {
  try {
    const { userId } = req;
    const { visitId, scheduledSlot } = req.body;

    if (!scheduledSlot) return res.json({ success: false, message: "Scheduled slot is required" });

    const visit = await Visit.findById(visitId);
    if (!visit) return res.json({ success: false, message: "Visit not found" });
    if (visit.owner.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (!["requested", "scheduled"].includes(visit.status)) {
      return res.json({ success: false, message: "Cannot schedule this visit" });
    }

    visit.status = "scheduled";
    visit.scheduledSlot = new Date(scheduledSlot);
    await visit.save();

    res.json({ success: true, message: "Visit scheduled successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const submitDecision = async (req, res) => {
  try {
    const { userId } = req;
    const { visitId, outcome } = req.body;

    if (!["move_in", "not_interested"].includes(outcome)) {
      return res.json({ success: false, message: "Invalid outcome" });
    }

    const visit = await Visit.findById(visitId);
    if (!visit) return res.json({ success: false, message: "Visit not found" });
    if (visit.visitor.toString() !== userId) return res.json({ success: false, message: "Not authorized" });
    if (visit.status !== "visited") {
      return res.json({ success: false, message: "Can only decide after a visit has been marked as visited" });
    }

    visit.decision = { outcome, decidedAt: new Date() };

    if (outcome === "move_in") {
      const listing = await Listing.findById(visit.listing).select("moveInTerms owner");
      const terms = listing?.moveInTerms || {};

      await MoveIn.create({
        visit: visit._id,
        listing: visit.listing,
        tenant: userId,
        owner: visit.owner,
        status: "awaiting_owner_setup",
        checklist: {
          agreement: {
            text: terms.agreementText || "",
            securityDeposit: terms.securityDeposit || 0,
            leaseDurationMonths: terms.leaseDurationMonths || 11,
          },
        },
      });
    }

    await visit.save();
    res.json({ success: true, message: outcome === "move_in" ? "Move-in process initiated" : "Decision recorded" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};