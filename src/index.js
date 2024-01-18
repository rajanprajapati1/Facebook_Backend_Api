require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const API = process.env.API_URL;
const path = require('path')
const expressSession = require('express-session');


// MongoDb Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("successfully connnected"))
.catch((err) => console.log(err))


// Session MiddleWare

app.use(expressSession({
    secret  :process.env.SECRET_MSG ,
    resave  :false,
    saveUninitialized  :true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24, // Set the session to expire after 1 day
      },
}))


// middlewares
app.use(express.json());
app.use('/images', express.static(path.join(__dirname, '../src/images')));
app.use(bodyParser.json());
app.use(cors({
    origin: 'https://65a8c3df61dae24150151d9c--moonlit-daffodil-ea1816.netlify.app',
    credentials: true,
}))

// Api Routes
const UserRoutes = require('./Routes/User')
const PostRoutes = require('./Routes/Posts')

app.use(`${API}/user`, UserRoutes)
app.use(`${API}/post`, PostRoutes)

app.get(API, (req, res) => {
    res.status(200).json("working");
})

app.listen(process.env.PORT_NO || 4000, () => {
    console.log('App listening on port 3000!');
});
