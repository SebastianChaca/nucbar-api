const express = require('express');
const AppError = require('./utils/appError');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const productRouter = require('./routes/productRoutes');
const userRouter = require('./routes/userRoutes');
const orderRouter = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const checkoutRouter = require('./routes/checkoutRoutes');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cors = require('cors');
const path = require('path');

const app = express();
const limiter = rateLimit({
  max: 50,
  // windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP',
});
//CORS
app.use(cors());
//MIDDLEWARES
app.use(helmet());
app.use('/', limiter);
app.use(morgan('dev'));
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(xss());
//ROUTES
app.use('/auth', authRoutes);
app.use('/users', userRouter);
app.use('/products', productRouter);
app.use('/orders', orderRouter);
app.use('/checkout', checkoutRouter);

app.all('*', (res, req, next) => {
  next(new AppError(`Ruta no encontrada`));
});
app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

module.exports = app;
