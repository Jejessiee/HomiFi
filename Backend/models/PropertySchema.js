const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
   ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User' 
   },
   propertyType: {
      type: String,
      required: [true, 'Please provide a Property Type']
   },
   propertyAdType: {
      type: String,
      required: [true, 'Please provide a Property Ad Type']
   },
   propertyAddress: {
      type: String,
      required: [true, "Please Provide an Address"]
   },
   ownerContact: {
      type: String,
      required: [true, 'Please provide owner contact']
   },
   propertyAmt: {
      type: Number,
      default: 0,
   },
   propertyImage: {
      type: Array, // Diubah menjadi Array karena menyimpan banyak gambar
      default: []
   },
   additionalInfo: {
      type: String,
   },
   ownerName: {
      type: String,
   },
   isAvailable: {
      type: String,
      default: "Available" // Menambahkan field ini secara resmi ke skema
   }
}, {
   timestamps: true // Menambahkan waktu dibuat/diupdate
});

// Nama diekspor sebagai 'Property'
module.exports = mongoose.model('Property', propertySchema);