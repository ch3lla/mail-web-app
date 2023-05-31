# MailWebApp

MailWebApp is a web application built with Node.js, Express, HBS (Handlebars), and MySQL. It provides a user registration and login system and allows users to send emails to multiple recipients.

## Features

- User Registration: Users can create an account by providing their email and password. The passwords are securely hashed using bcrypt before being stored in the database.
- User Login: Registered users can log in using their email and password. The login system verifies the credentials and maintains a user session using express-session.
- Send Emails: Logged-in users can send emails to multiple recipients. The application uses Nodemailer to send emails via a Gmail account. Users can provide the sender's email, recipient(s) email(s), subject, and message body.
- Database Storage: User account details and sent emails are stored in a MySQL database. The application utilizes the mysql2 library to interact with the database.

## Prerequisites

Before running the MailWebApp, make sure you have the following installed:

- Node.js (https://nodejs.org)
- MySQL (https://www.mysql.com/)

## Getting Started

1. Clone the repository:

```
git clone <repository-url>
```

2. Install dependencies:

```
cd MailWebApp
npm install
```

3. Set up the MySQL database:

- Create a new MySQL database.
- Rename the `.env.example` file to `.env`.
- Update the `.env` file with your MySQL database credentials and other configuration details.

4. Start the application:

```
npm start
```

5. Access the application:

Open a web browser and navigate to `http://localhost:8080` to access the MailWebApp.

## Usage

- Visit the home page (`/`) to see the welcome screen.
- Register a new account by providing your email and password.
- Log in using your registered email and password.
- Once logged in, you will be redirected to the home page (`/home`).
- On the home page, you can compose an email by providing the sender's email, recipient(s) email(s), subject, and message body.
- You can specify multiple recipients by separating their email addresses with commas.
- Click the "Send" button to send the email.
- Successful email delivery will display a success message. Any errors encountered during email delivery will be logged in the console.

## Contributing

Contributions to MailWebApp are welcome! If you find any issues or have suggestions for improvements, please submit an issue or pull request to the repository.

## License

The MailWebApp project is licensed under the [MIT License](LICENSE).

## Acknowledgements

MailWebApp makes use of the following open-source libraries and technologies:

- Node.js: https://nodejs.org
- Express: https://expressjs.com
- HBS (Handlebars): https://handlebarsjs.com
- MySQL: https://www.mysql.com
- Nodemailer: https://nodemailer.com
- bcryptjs: https://github.com/dcodeIO/bcrypt.js
- express-session: https://github.com/expressjs/session
- mysql2: https://github.com/mysqljs/mysql2
