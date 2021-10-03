const connectDB = require('./startup/db');
const express = require('express');
const cors = require('cors');
const app = express();
const users = require('./routes/users');
const router = require('./routes/auth');
const seller = require('./routes/seller');
const buyer = require('./routes/buyer');
const search= require('./routes/search');
connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/users', users);
app.use('/api/auth', router);
app.use('/api/seller', seller);
app.use('/api/buyer', buyer);
app.use('/api/search', search);
app.use(express.static('public'))
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});