const mongoose = require("mongoose");

//?  M E M B U A T  skema (struktur db)

//!  param 1 = nm model, param2 = field (dan validasinya)
const Contact = mongoose.model("Contact", {
  nama: {
    type: String,
    required: true,
  },
  nohp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
});

module.exports = Contact;
