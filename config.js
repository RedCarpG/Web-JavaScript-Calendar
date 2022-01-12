/** ENV variables */
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
  
module.exports = {
    users : [],
    port : process.env.PORT,
    mysql : {
        host: "localhost",
        user: "RedCarp",
        password: "123456",
        database: ""
    },
    session: {
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {}
    }
};