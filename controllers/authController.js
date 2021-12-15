const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { generateToken, verifyToken } = require('../utils/apiAuth');
const sendEmail = require('../utils/email');
const crypto = require('crypto');

const sendToken = (user, statusCode, res) => {
  const token = generateToken(user);
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    return next(new AppError('El email ya está en uso', 400));
  }
  const newUser = await User.create({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    lastName: req.body.lastName,
    passwordChangedAt: req.body.passwordChangedAt,
  });

  sendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Por favor ingrese un email y/o password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Password o email incorrecto', 401));
  }
  sendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('Acceso solo para usarios registrados', 401));
  }
  // 2) Verification token
  const decoded = await verifyToken(token);
  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('El usuario ya no existe.', 401));
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('La contraseña cambió, ingrese de nuevo.', 401));
  }

  //Dar acceso
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tiene permiso para realizar esta accion', 403)
      );
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email

  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('No hay usuario con ese email', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) Send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/users/resetPassword/${resetToken}`;
  const message = `Olvido su pass, hace patch en ${resetURL}`;
  try {
    await sendEmail({
      email: user.email,
      subject: 'Olvidaste tu pass',
      message,
    });
    res.status(200).json({
      status: 'success',
      message: 'Enviamos el token al mail',
    });
  } catch (err) {
    user.createPasswordResetToken = undefined;
    user.createPasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'Hubo un error al mandar el email, intentelo de nuevo mas tarde',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token inválido o ha expirado', 400));
  }
  user.password = req.body.password;

  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //login
  sendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Por favor ingrese un email y/o password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  //2) Check if posted current pass is correct
  if (!(await user.correctPassword(password, user.password))) {
    return next(new AppError('Contraseña incorrecta', 401));
  }

  //3)update
  user.password = req.body.newPassword;
  await user.save();
  //login
  sendToken(user, 200, res);
});
