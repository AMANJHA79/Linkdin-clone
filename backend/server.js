require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
// const errorHandler = require('./middleware/error-handler')
const connectToDb = require('./database/db');
const authRoutes = require('./routes/auth-route');
const userRoutes = require('./routes/user-route');
const postRoutes = require('./routes/post-routes');
const notificationRoutes = require('./routes/notification-routes');



const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieParser());

// app.use(errorHandler);
app.use('/api/v1/auth',authRoutes)
app.use('/api/v1/users',userRoutes)
app.use('/api/v1/posts', postRoutes)
app.use('/api/v1/notifications', notificationRoutes)



app.listen(port, async () => {
    await connectToDb();
    console.log(`Server is running on http://localhost:${port}`);
});