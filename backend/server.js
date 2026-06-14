const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const app = express();
const port = process.env.PORT || 5000;
dotenv.config();
app.use(cors());
app.use(express.json());
app.use(fileUpload({
    useTempFiles: false,
}));

mongoose.connect(process.env.MONGO_URL)
.then(() => {
    console.log('Connected to MongoDB Atlas');
})
.catch((err) => {
    console.log('Database connection error:', err);
});

const userRoute = require('./route/userRoute');
app.use('/user', userRoute);

const operatorRoute = require('./route/operatorRoute');
app.use('/operator', operatorRoute);

const hotelRoute = require('./route/hotelRoute');
app.use('/hotel', hotelRoute);

const locationRoute = require('./route/locationaRoute');
app.use('/location', locationRoute);

const busRoute = require('./route/busRoute');
app.use('/bus', busRoute);

const bookingRoute=require('./route/bookingRoute');
app.use('/booking', bookingRoute);

const dashboardRoute = require('./route/dashboardRoute');
app.use('/dashboard', dashboardRoute);

const wishlistRoute = require('./route/wishlistRoute');
app.use('/wishlist', wishlistRoute);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
