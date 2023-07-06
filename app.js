require("dotenv").config();
const express = require("express");
const session = require("express-session");
const expressHandlebars = require("express-handlebars");
const app = express();
const path = require("path");
const publicDir = path.join(__dirname, "./public");

// Set handlebars as templating engine
app.set("views", path.join(__dirname, "views"));
app.engine(
  "handlebars",
  expressHandlebars.engine({
    extname: ".handlebars",
    defaultLayout: "layout",
    layoutsDir: "views/layouts",
  })
);
app.set("view engine", "handlebars");

// MiddleWare
app.use(express.static(publicDir));
app.use(express.static("views"));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// Calling routes
app.use("/", require("./server/routes/user"));
app.use("/email", require("./server/routes/user"));

app.listen(process.env.PORT, () => {
  console.log(`Server is listening pn port ${process.env.PORT}`);
});
