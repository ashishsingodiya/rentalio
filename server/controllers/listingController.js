import imagekit from "../configs/imagekit.js";
import Listing from "../models/Listing.js";

export const getFeaturedListings = async (req, res) => {
  try {
    const featured = await Listing.find({
      isFeatured: true,
      status: "published",
    })
      .limit(6)
      .sort({ updatedAt: -1 });
    res.json({ success: true, properties: featured });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getPublishedListings = async (req, res) => {
  try {
    const { location, minPrice, maxPrice, moveInDate, propertyTypes } = req.query;

    let query = { status: "published" };

    //this will help us to find the properties with case-insensitive and partial match
    if (location) {
      query.$or = [{ "location.address": { $regex: location, $options: "i" } }, { "location.city": { $regex: location, $options: "i" } }, { "location.state": { $regex: location, $options: "i" } }];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (propertyTypes) {
      const typesArray = propertyTypes.split(",");
      query["specs.propertyType"] = { $in: typesArray };
    }

    if (moveInDate) {
      query.moveInAvailableFrom = { $lte: new Date(moveInDate) };
    }

    const properties = await Listing.find(query).sort({ createdAt: -1 });

    res.json({ success: true, properties });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getListingData = async (req, res) => {
  try {
    const listingId = req.params.id;

    const listing = await Listing.findOne({ _id: listingId, status: "published" });
    if (!listing) {
      return res.json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, listing });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const createListing = async (req, res) => {
  try {
    const uploads = await Promise.all(
      req.files.map((file) =>
        imagekit.upload({
          file: file.buffer,
          fileName: file.originalname,
          folder: "Rentalio/listings",
        })
      )
    );

    const optimizedImageUrls = uploads.map((item) =>
      imagekit.url({
        path: item.filePath,
        transformation: [{ format: "webp", quality: "auto", width: 1400 }],
      })
    );

    //agar single value aa rhi ho to usey array me convert
    const amenities = Array.isArray(req.body.amenities) ? req.body.amenities : [req.body.amenities];

    const rules = Array.isArray(req.body.rules) ? req.body.rules : [req.body.rules];

    const listing = await Listing.create({
      title: req.body.title,
      description: req.body.description,

      location: {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
      },

      specs: {
        bedrooms: req.body.bedrooms,
        bathrooms: req.body.bathrooms,
        areaSqFt: req.body.area,
        propertyType: req.body.propertyType,
        furnishing: req.body.furnishing,
        parking: req.body.parking,
      },

      price: req.body.price,
      moveInAvailableFrom: req.body.moveInAvailableFrom,

      amenities,

      rules,

      gallery: optimizedImageUrls,

      owner: req.userId,

      status: req.body.status,

      moveInTerms: {
        agreementText: req.body.agreementText || "",
        securityDeposit: req.body.securityDeposit ? Number(req.body.securityDeposit) : 0,
        leaseDurationMonths: req.body.leaseDurationMonths ? Number(req.body.leaseDurationMonths) : 11,
        updatedAt: new Date(),
      },
    });

    res.json({ success: true, listing });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getOwnerListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const deleteListing = async (req, res) => {
  try {
    const { userId } = req;
    const { listingId } = req.body;

    const listing = await Listing.findOneAndDelete({ _id: listingId, owner: userId });
    if (!listing) {
      return res.json({ success: false, message: "Listing not found or unauthorized" });
    }
    res.json({ success: true, message: "Listing deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminGetAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({}).populate("owner", "name email").sort({ createdAt: -1 });
    res.json({ success: true, listings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const adminUpdateListingStatus = async (req, res) => {
  try {
    const { listingId, status } = req.body;
    const validStatuses = ["draft", "review", "published", "rejected", "rented"];
    if (!validStatuses.includes(status)) {
      return res.json({ success: false, message: "Invalid status" });
    }
    const listing = await Listing.findByIdAndUpdate(listingId, { status }, { new: true });
    if (!listing) {
      return res.json({ success: false, message: "Listing not found" });
    }
    res.json({ success: true, listing });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const adminToggleFeatured = async (req, res) => {
  try {
    const { listingId } = req.body;
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.json({ success: false, message: "Listing not found" });
    }
    listing.isFeatured = !listing.isFeatured;
    await listing.save();
    res.json({ success: true, isFeatured: listing.isFeatured });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};