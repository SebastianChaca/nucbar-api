const express = require('express');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const router = express.Router();

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);
router.patch(
  '/updatePassword',
  authController.protect,
  authController.updatePassword
);

//admins
router.route('/').get(authController.protect, userController.getUsers);

router
  .route('/:id')
  .get(userController.getUser)
  // .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
