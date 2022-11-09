const express = require("express");
const expressLayouts = require("express-ejs-layouts");

const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

require("./utils/db");
const Contact = require("./model/contact");

const app = express();
const port = 8080;

//?    M E N G G U N A K A N   Method Override
app.use(methodOverride("_method"));

//?    M E N G G U N A K A N    E J S
app.set("view engine", "ejs");

//*    T H I R D - P A R T Y  MIDDLEWARE
app.use(expressLayouts);

//*    B U I L D - I N  MIDDLEWARE
app.use(express.static("public")); //!  Manggil buildInMidd(folder yg berisi file static)

app.use(express.urlencoded({ extended: true })); //?  urlencoded untuk nangkap data dari post

//*    Konfigurasi flash msg
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

// *     R  O  U  T  E  S

//!      pas jalanin app, ada req.meth get ke routenya. Maka jalan fungsi
app.get("/", (req, res) => {
  const students = [
    {
      nama: "Zubair",
      email: "zubair@gmail.com",
    },
    {
      nama: "Syafiq",
      email: "syafiq@gmail.com",
    },
    {
      nama: "Bilal",
      email: "bilal@gmail.com",
    },
  ];

  //?   MEMANGGIL  halaman

  //*   kalo mau ngirim data, tarok diparameter selanjutnya
  res.render("index", {
    nama: "Reza Putra", //!   keynya buat sendiri
    tittle: "Page Home",
    students, //!   keynya dari var diatas
    layout: "layouts/main-layout",
  });

  // pathnya, objek yg isinya tempat root=direktorinya
  // res.sendFile('./index.html', { root: __dirname })
});

//*   A B O U T
app.get("/about", (req, res) => {
  //?    MEMANGGIL halaman didalam folder
  res.render("about", {
    layout: "layouts/main-layout", //!  jadi pas req url /about, tentukan isinya melalui path
    tittle: "About",
  });

  // pathnya, objek yg isinya tempat root=direktorinya
  // res.sendFile('./about.html', { root: __dirname }) // untuk ambil isi file
});

//*  C O N T A C T
//!  async await untuk menangani promise
app.get("/contact", async (req, res) => {
  //?    MENGAMBIL data yg di JSON
  const contacts = await Contact.find(); // find() termasuk promise

  //?    Memanggil halaman didalam folder
  res.render("contact", {
    layout: "layouts/main-layout", //!  layoutnya mengambil dari path tsb
    tittle: "Contact",
    contacts, //!  kirim (data contacts yg diatas) ke view
    msg: req.flash("msg"),
  });

  // pathnya, objek yg isinya tempat root=direktorinya
  // res.sendFile('./contact.html', { root: __dirname })
});

//*   A  D  D

//?     MEMBUAT perintah ke page add contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    tittle: "Form Add Contact",
    layout: "layouts/main-layout",
  });
});

//*  Proses ADD
//?  Meriksa apakah yg diinputkan itu sesuai / tidak
//  custom = bikin error sendiri
app.post(
  "/contact",
  [
    body("nama").custom(async (value) => {
      //!   meriksa value (yg diinputkan diform add)
      const duplicate = await Contact.findOne({ nama: value }); //  mencari 1 nama (diambil dari inputan value) yg dimodel Contact
      if (duplicate) {
        throw new Error("Contact name has been used !"); //!  throw == return false, bedanya kalo ini dgn custom error
      }
      return true; //!   kalo true, langsung ke perintah addContact
    }),
    check("email", "Email tidak valid !").isEmail(),
    check("nohp", "No HP tidak valid !").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req); //!  kalo email unvalid, var errors ada isinya
    if (!errors.isEmpty()) {
      //*   kalo ada isinya = yg diinputkan benar,
      res.render("add-contact", {
        //*  direct ke page add contact
        tittle: "Form add contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      //!  kalo lolos verifiksi / tidak error (=data ditambahkan)
      Contact.insertMany(req.body, (error, result) => {
        // masukan (body=isi data form) ke model Contact
        req.flash("msg", "Data kontak berhasil ditambahkan");
        res.redirect("/contact"); //  pas data berhasil ditambahkan, direct ke cont.ejs
      });
    }
  }
);

//*    D  E  L  E  T  E
//!  id nya berdasarkan id var contact yg diatas, kalo berhasil ...
// pake then() = biar bisa nampilkan flash msg nya
app.delete("/contact", (req, res) => {
  Contact.deleteOne({ nama: req.body.nama }).then((result) => {
    req.flash("msg", "Data kontak berhasil dihapus");
    res.redirect("/contact");
  });
});

// app.get("/contact/delete/:nama", async (req, res) => {
//  const contact = await Contact.findOne({ nama: req.params.nama }); //!  ngecek/nyari nama yg diinputkan ada/tidak di model contact

//*  kalo contact tidak ada
//  if (!contact) {
//   res.status(404);
//    res.send("<h1>404</h1>");
//  } else {
//    Contact.deleteOne({ _id: contact._id }).then((result) => {
//      req.flash("msg", "Data kontak berhasil dihapus");
//      res.redirect("/contact");
//    });
//  }
// });

//*   E  D  I  T
app.get("/contact/edit/:nama", async (req, res) => {
  const contact = await Contact.findOne({ nama: req.params.nama });

  res.render("edit-contact", {
    tittle: "Form Edit Contact",
    layout: "layouts/main-layout",
    contact,
  });
});

app.put(
  "/contact",
  [
    body("nama").custom(async (value, { req }) => {
      //  di param kedua kasih objek req, biar bisa dipake untuk cek oldNama
      //!   meriksa value (yg diinputkan diform add), yg dicek nama nya
      const duplicate = await Contact.findOne({ nama: value });
      // kalo namanya diedit (yg diinput) != oldNama & nama (yg diinput) udah ada di JSON
      if (value !== req.body.oldName && duplicate) {
        throw new Error("Contact name has been used !"); //!  throw == return false, bedanya kalo ini dgn custom error
      }
      return true; //!   kalo true, langsung ke perintah addContact
    }),
    check("email", "Email tidak valid !").isEmail(),
    check("nohp", "No HP tidak valid !").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req); //!  kalo email unvalid, var errors ada isinya
    if (!errors.isEmpty()) {
      //*   kalo ada isinya = yg diinputkan benar,
      res.render("edit-contact", {
        //*  direct ke page add contact
        tittle: "Form Edit contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body, //!  data contact yg diambil dari form edit (yg ada dibody)
      });
    } else {
      Contact.updateOne(
        { _id: req.body._id },
        {
          $set: {
            nama: req.body.nama,
            email: req.body.email,
            nohp: req.body.nohp,
          },
        }
      ).then((result) => {
        req.flash("msg", "Data kontak berhasil diubah");
        res.redirect("/contact"); //  pas data berhasil ditambahkan, direct ke cont.ejs
      });
    }
  }
);

//*    D  E  T  A  I  L
app.get("/contact/:nama", async (req, res) => {
  //!  findOne = mencari 1 data (ada di url yg paramnya nama)
  const contact = await Contact.findOne({ nama: req.params.nama }); // await untuk nunggu sampe promise resolve

  res.render("detail", {
    layout: "layouts/main-layout", //!  layoutnya mengambil dari path tsb
    tittle: "Detail Contact",
    contact, //!  kirim (data contacts yg diatas) ke view
  });
});

app.listen(port, () => {
  console.log(`MongoDB App | listening http://localhost:${port}`);
});
