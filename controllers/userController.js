const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();

    res.status(201).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 'fail',
      messege: err,
    });
  }
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1 create error if user post password data
  if (req.body.password) {
    return next(new AppError('Permiso denegado', 400));
  }
  //filtrar campos que no estan permitidos
  const filteredBody = filterObj(req.body, 'name', 'email');

  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteUser = (req, res) => {
  console.log('delete product');
};
exports.getUser = (req, res) => {
  console.log('get product');
};
