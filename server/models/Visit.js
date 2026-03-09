import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    visitor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["requested", "scheduled", "visited", "cancelled", "rejected"],
      default: "requested",
      index: true,
    },

    requestedSlot: {
      type: Date,
      required: true,
    },

    scheduledSlot: {
      type: Date,
    },

    message: {
      type: String,
      trim: true,
    },

    decision: {
      outcome: {
        type: String,
        enum: ["pending", "move_in", "not_interested"],
        default: "pending",
      },
      hasMovedIn: {
        type: Boolean,
        default: false,
      },
      decidedAt: Date,
    },
  },
  { timestamps: true }
);

// Ek user same property ko dobara visit request nahi kar payega
visitSchema.index({ listing: 1, visitor: 1 }, { unique: true });

export default mongoose.model("Visit", visitSchema);
