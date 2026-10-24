const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const { 
  registerController, 
  loginController, 
  forgotPasswordController, 
  getAllPropertiesController, 
  authController, 
  bookingHandleController, 
  getAllBookingsController,
  cancelBookingController 
} = require("../controllers/userController");

// Rute Publik (Tidak perlu token login)
router.post("/register", registerController);
router.post("/login", loginController);
router.post("/forgotpassword", forgotPasswordController);
router.get('/getAllProperties', getAllPropertiesController);

// Rute Privat (Hanya bisa diakses jika user sudah login / memiliki token)
router.post("/getuserdata", authMiddleware, authController);
router.post("/bookinghandle/:propertyid", authMiddleware, bookingHandleController);
router.get('/getallbookings', authMiddleware, getAllBookingsController);
router.post("/cancelbooking", authMiddleware, cancelBookingController);

module.exports = router;