const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Userschema = mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Debe ingresar un email'],
      unique: [true, 'El email ya se encuentra registrado'],
      lowercase: true,
      validate: [validator.isEmail, 'El email no es válido'],
    },
    password: {
      type: String,
      required: [true, 'Ingrese un password'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    name: {
      type: String,
    },
    lastName: {
      type: String,
    },
    avatarImg: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    active: {
      type: Boolean,
      default: true,
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
  }
);
Userschema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = bcrypt.hashSync(this.password, 10);
  next();
});
Userschema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

Userschema.methods.correctPassword = function (
  candidatePassword,
  userPassword
) {
  return bcrypt.compareSync(candidatePassword, userPassword);
};

Userschema.methods.changedPasswordAfter = function (JWTtimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTtimestamp < changedTimestamp;
    //false means NOT changed
  }
  return false;
};

Userschema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

Userschema.virtual('isAdmin').get(function () {
  return this.role === 'admin';
});

module.exports = mongoose.model('User', Userschema);
