const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const nodemailer = require('nodemailer');
const mysql2 = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const hbs = require('hbs');
const app = express();


const path = require("path");
const publicDir = path.join(__dirname, './public');

// Set EJS as templating engine
app.set('view engine', 'hbs');

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

app.get('/home', (req, res) => {
  res.render('home');
});

app.post("/auth/register", async (req, res) => {
  const { email, password, password_confirm} = req.body;

  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Password Confirm:', password_confirm);

  db.query('SELECT email FROM users WHERE email = ?', 
  [email], async (error, result) => {
      if (error) { console.log(err) }
      console.log('Result:', result);

      if (result.length > 0){
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
          console.log(err);
          return res.render('register', {
            message: 'An error occured'
          });
      } 
      return res.redirect('/login');
  })
})

app.post('/auth/login', async (req, res) => {
  const { email, password} = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], 
  async (error, result) => {
    if (error) {
      console.error(error);
      return res.status(500).send('Internal Server Error');
    }
    
    if (result.length === 0){
      return res.status(401).render('login', {
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
      return res.redirect('/home');
    } else {
      return res.status(401).render('/login', {
        message: 'Invalid Login Credentials'
      })
    }

  })
})


app.post('/home', (req, res) => {
  const { sender, receiver, subject, message } = req.body;
    db.query('INSERT INTO sent_mails SET ?', {sender: sender, receiver: receiver})

  /*  let receiverArray =[];
  if (receiver.includes(',')){
    receiverArray = receiver.split(',').map(email => email.trim());
  } else {
    receiverArray = [receiver.trim()];
  }*/

  const { email, password } = req.session.user;

  // Nodemailer code to send email
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password
    }
  });
  
  let mailOptions = {
    from: sender,
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


const port = 8080;
app.listen(port, () => {
  console.log(`Server is listening on port: ${port}`);
}); 