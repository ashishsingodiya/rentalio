import mongoose from "mongoose";

const moveInSchema = new mongoose.Schema(
  {
    visit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
      unique: true,
    },

    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },

    tenant: {
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
      enum: ["awaiting_owner_setup", "pending", "ready", "moved_in"],
      default: "awaiting_owner_setup",
      index: true,
    },

    checklist: {
      documents: {
        completed: { type: Boolean, default: false },
        files: [
          {
            label: { type: String, required: true },
            url: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
          },
        ],
      },

      // Ye hum Listing se lenge, movein request create krte wakt
      agreement: {
        text: { type: String, default: "" },
        securityDeposit: { type: Number, default: 0 },
        leaseDurationMonths: { type: Number, default: 11 },
        completed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
      },

      inventory: {
        completed: { type: Boolean, default: false },
        confirmedAt: { type: Date },
        items: [
          {
            name: { type: String, required: true },
            condition: {
              type: String,
              enum: ["excellent", "good", "fair", "poor"],
              default: "good",
            },
            notes: { type: String, default: "" },
          },
        ],
      },
    },

    movedInAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("MoveIn", moveInSchema);
