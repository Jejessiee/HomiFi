const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const User = require("../models/UserSchema");
const propertySchema = require("../models/PropertySchema");
const bookingSchema = require("../models/BookingSchema");

// --- REGISTER ---
const registerController = async (req, res) => {
  try {
    const existsUser = await User.findOne({ email: req.body.email });
    if (existsUser) {
      return res.status(200).send({ message: "User already exists", success: false });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    req.body.password = hashedPassword;

    // Jika Owner, statusnya 'ungranted' (butuh persetujuan admin)
    if (req.body.type === "Owner") {
      req.body.granted = "ungranted";
    }

    const newUser = new User(req.body);
    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

// --- LOGIN ---
const loginController = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid email or password", success: false });
    }

    // Memasukkan tipe (role) ke dalam token
    const token = jwt.sign(
      { id: user._id, type: user.type }, 
      process.env.JWT_SECRET || process.env.JWT_KEY, // Dukungan untuk dua nama variabel di .env
      { expiresIn: "1d" }
    );

    user.password = undefined;

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // Ubah ke true jika sudah menggunakan HTTPS (di tahap produksi)
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).send({
      message: "Login successful",
      success: true,
      token: token, // Mengirim token juga di JSON body agar Frontend (React) bisa menyimpannya di localStorage
      user: user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

// --- FORGOT PASSWORD ---
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    return res.status(200).send({ message: "Password changed successfully", success: true });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

// --- GET AUTH USER DATA ---
const authController = async (req, res) => {
  try {
    // req.body.userId didapat dari middleware authMiddleware Anda
    const user = await User.findById(req.body.userId).select("-password"); 
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.error("Auth Error:", error);
    return res.status(500).send({ message: "Auth error", success: false, error: error.message });
  }
};

// --- GET ALL PROPERTIES (PUBLIC) ---
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find({});
    return res.status(200).send({ success: true, data: allProperties });
  } catch (error) {
    console.error("Get Properties Error:", error);
    return res.status(500).send({ message: "Error fetching properties", success: false, error: error.message });
  }
};

// --- HANDLE BOOKING ---
const bookingHandleController = async (req, res) => {
  const { propertyid } = req.params;
  const { userDetails, status, userId, ownerId } = req.body;

  try {
    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId, // Diambil dari frontend atau token
      ownerID: ownerId, 
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
    });

    await booking.save();
    return res.status(200).send({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res.status(500).send({ success: false, message: "Error handling booking" });
  }
};

// --- GET ALL BOOKINGS (RENTER) ---
const getAllBookingsController = async (req, res) => {
  try {
    // Menggunakan query database untuk filter (jauh lebih cepat daripada memfilter array di Node)
    const userBookings = await bookingSchema.find({ userID: req.body.userId });
    
    return res.status(200).send({ success: true, data: userBookings });
  } catch (error) {
    console.error("Get Bookings Error:", error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

// --- CANCEL BOOKING BY RENTER (UPDATE STATUS) ---
const cancelBookingController = async (req, res) => {
  const { bookingId, propertyId } = req.body;
  try {
    // Ubah status booking menjadi 'Canceled'
    const updatedBooking = await bookingSchema.findByIdAndUpdate(
      bookingId,
      { bookingStatus: "Canceled" },
      { new: true }
    );

    if (!updatedBooking) {
      return res.status(404).send({ success: false, message: "Booking not found" });
    }

    // Kembalikan status properti menjadi Available
    await propertySchema.findByIdAndUpdate(
      propertyId,
      { isAvailable: "Available" },
      { new: true }
    );

    return res.status(200).send({
      success: true,
      message: "Booking status updated to Canceled, property is now available.",
      data: updatedBooking,
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return res.status(500).send({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
  cancelBookingController, 
};