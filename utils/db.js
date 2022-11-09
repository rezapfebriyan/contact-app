const moongose = require("mongoose");
moongose.connect("mongodb://127.0.0.1:27017/kontak", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// *  A D D  data
//!  buat objectnya (instansiasi dari blueprint diatas)
// const contact1 = new Contact({
//   nama: "Reza Putra Febriyan",
//   nohp: "089955887799",
//   email: "rpfebriyan@gmail.com",
// });

//*  S A V E  to collection
//!  panggil contac1
// contact1.save().then((contact) => console.log(contact));
