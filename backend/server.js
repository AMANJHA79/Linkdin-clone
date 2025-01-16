require('dotenv').config();
const express = require('express');
// const errorHandler = require('./middleware/error-handler')
const connectToDb = require('./database/db');
const authRoutes = require('./routes/auth-route');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


// app.use(errorHandler);
app.use('/api/v1/auth',authRoutes)



app.listen(port, async () => {
    await connectToDb();
    console.log(`Server is running on http://localhost:${port}`);
});