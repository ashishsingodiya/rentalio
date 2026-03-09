import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, index: true },
      state: { type: String, required: true },
      zipCode: String,
    },

    specs: {
      bedrooms: { type: Number, required: true },
      bathrooms: { type: Number, required: true },
      areaSqFt: { type: Number, required: true },
      propertyType: {
        type: String,
        enum: ["apartment", "house", "studio", "villa", "pg", "hostel"],
        required: true,
      },
      furnishing: {
        type: String,
        enum: ["furnished", "semi-furnished", "unfurnished"],
        default: "unfurnished",
      },
      parking: {
        type: String,
        enum: ["none", "bike", "car_bike"],
        default: "none",
        required: true,
      },
    },

    price: {
      type: Number,
      required: true,
      index: true,
    },

    moveInAvailableFrom: {
      type: Date,
      required: true,
      index: true,
    },

    amenities: [String],

    rules: [String],

    gallery: {
      type: [String],
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "review", "published", "rejected", "rented"],
      default: "draft",
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    moveInTerms: {
      agreementText: { type: String, default: "" },
      securityDeposit: { type: Number, default: 0 },
      leaseDurationMonths: { type: Number, default: 11 },
      updatedAt: { type: Date },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);
