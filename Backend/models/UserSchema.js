const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      set: function (value) {
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Memastikan tidak ada email duplikat di level database
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    type: {
      type: String,
      required: [true, "Type (Role) is required"],
      enum: ["Admin", "Owner", "Renter"], // Membatasi input hanya 3 role ini
    },
    granted: {
      type: String,
      default: "granted", // Nilai default
    },
  },
  {
    timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
  }
);

// Nama model diubah menggunakan huruf kapital "User"
module.exports = mongoose.model("User", userSchema);