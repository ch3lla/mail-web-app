const dotenv = require('dotenv');
dotenv.config();
const expressHandlebars = require('express-handlebars');
const express = require('express');
const nodemailer = require('nodemailer');
const mysql2 = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const app = express();


const path = require("path");
const publicDir = path.join(__dirname, './public');

// Set handlebars as templating engine
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', expressHandlebars.engine({
    extname: '.handlebars',
    defaultLayout: 'layout',
    layoutsDir: "views/layouts"
}));
app.set('view engine', 'handlebars');

//  MiddleWare
app.use(express.static(publicDir));
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


// Accessing variales from proccess.env and creating a connection with the database
const db = mysql2.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_ROOT,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
})

// Connecting to the database
db.connect((error) => {
  if(error){
      console.log(error);
  } else {
      console.log("MySQL connected!");
  }
})

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/send', (req, res) => {
  res.render('send');
});

app.post("/register", async (req, res) => {
  const { email, password, password_confirm} = req.body;

  db.query('SELECT email FROM users WHERE email = ?', 
  [email], async (error, result) => {
    console.log("Result: ", result);
      if (error) { 
        console.log("Error: ", error)
     } else if (result.length > 0){
          return res.render('register', {
              message: 'This email is already in use'
          })
      } else if(password !== password_confirm){
          return res.render('register', {
              message: 'Passwords do not match!'
          })
      }
  })

  let hashedPassword = await bcrypt.hash(password, 8)

  db.query('INSERT INTO users SET ?', {  email: email, password: hashedPassword}, (err, result) => {
      if(err){
          console.log("Error: ", err);
          return res.render('register', {
            message: 'An error occured'
          });
      } else {
        console.log("Successfully registered!")
      }
  })
  res.redirect('/login');
})

app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], 
  async (error, result) => {
    if (error) {
      return res.status(500).send('Internal Server Error');
    } else if (result.length === 0){
      return res.render('login', {
        message: "Invalid Login Credentials"
      })
    }

    const user = result[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (isPasswordValid){
      req.session.user = {
        email: user.email,
        password: user.password
      };
      res.redirect('/send');
    } else {
      return res.render('/login', {
        message: 'Invalid Login Credentials'
      })
    }

  })
})

// Authentication middleware
const authenticateUser = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.post('/send', authenticateUser, (req, res) => {
  const { receiver, subject, message } = req.body;
  const { email, password } = req.session.user;
  db.query('INSERT INTO sent_mails SET ?', {sender: email, receiver: receiver}, (err, result) => {
    if (err){
      console.log('Error inserting into database: ', err);
      return res.status(500).send('Internal Server Error');
    }

    // Nodemailer code to send email
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: email,
        pass: password
      }
    });


    // Verify the SMTP connection
    transporter.verify((error, success) => {
      if (error) {
        console.log("Error: ", error);
      } else {
        console.log("Server is ready to take our messages");
      }
    });


    let mailOptions = {
      from: email,
      to: receiver,
      subject: subject,
      text: message
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err){ 
        console.log('Error ' + err);
      } else {
          res.send('Email sent successfully!');
          console.log('Email sent successfully!');
          console.log('Message ID:', info.messageId);
          console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
      }
    });
  })
})


const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
}); 