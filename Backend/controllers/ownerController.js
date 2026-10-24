const User = require("../models/UserSchema");
const Property = require("../models/PropertySchema");
const Booking = require("../models/BookingSchema");

// --- ADD PROPERTY ---
const addPropertyController = async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        filename: file.filename,
        path: `/uploads/${file.filename}`,
      }));
    }

    const user = await User.findById(req.body.userId);

    const newPropertyData = new Property({
      ...req.body,
      propertyImage: images,
      ownerId: user._id,
      ownerName: user.name,
      isAvailable: "Available",
    });

    await newPropertyData.save();

    return res.status(201).send({
      success: true,
      message: "New Property has been stored",
    });
  } catch (error) {
    console.error("Error adding property: ", error);
    return res.status(500).send({ message: "Internal server error", success: false, error: error.message });
  }
};

// --- GET ALL PROPERTIES BY OWNER ---
const getAllOwnerPropertiesController = async (req, res) => {
  try {
    // Optimasi: Mencari langsung di database, bukan mengambil semua lalu di-filter
    const ownerProperties = await Property.find({ ownerId: req.body.userId });
    
    return res.status(200).send({
      success: true,
      data: ownerProperties,
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

// --- DELETE PROPERTY ---
const deletePropertyController = async (req, res) => {
  try {
    await Property.findByIdAndDelete(req.params.propertyid);
    return res.status(200).send({
      success: true,
      message: "The property is deleted",
    });
  } catch (error) {
    console.error("Error deleting property:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

// --- UPDATE PROPERTY ---
const updatePropertyController = async (req, res) => {
  try {
    const propertyId = req.params.propertyid;
    let updateData = { ...req.body };

    // Jika ada file gambar baru yang di-upload saat edit
    if (req.file) {
      const newImage = {
        filename: req.file.filename,
        path: `/uploads/${req.file.filename}`,
      };
      updateData.propertyImage = [newImage];
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      propertyId,
      updateData,
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).send({ success: false, message: "Property not found" });
    }

    return res.status(200).send({
      success: true,
      message: "Property updated successfully.",
      data: updatedProperty,
    });
  } catch (error) {
    console.error("Error updating property:", error); // <-- Pesan error ini akan muncul di terminal backend
    return res.status(500).send({ success: false, message: "Failed to update property.", error: error.message });
  }
};

// --- GET ALL BOOKINGS FOR OWNER ---
const getAllBookingsController = async (req, res) => {
  try {
    // Optimasi query database
    const ownerBookings = await Booking.find({ ownerID: req.body.userId });
    
    return res.status(200).send({
      success: true,
      data: ownerBookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

// --- HANDLE BOOKING STATUS ---
const handleAllBookingstatusController = async (req, res) => {
  const { bookingId, propertyId, status } = req.body;
  try {
    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { bookingStatus: status },
      { new: true }
    );

    await Property.findByIdAndUpdate(
      propertyId,
      { isAvailable: status === 'booked' ? 'Unavailable' : 'Available' },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: `Changed the status of property to ${status}`,
    });
  } catch (error) {
    console.error("Error changing status:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  addPropertyController,
  getAllOwnerPropertiesController,
  deletePropertyController,
  updatePropertyController,
  getAllBookingsController,
  handleAllBookingstatusController,
};