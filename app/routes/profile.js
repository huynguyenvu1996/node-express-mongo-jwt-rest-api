const express = require('express')
const controller = require('../controllers/profile')
const validate = require('../controllers/profile.validate')
const AuthController = require('../controllers/auth')
const router = express.Router()
const trimRequest = require('trim-request')
require('../../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})

/*
 ROUTES
*/

router.get(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  controller.getProfile
)

router.patch(
  '/',
  requireAuth,
  AuthController.roleAuthorization(['user', 'admin']),
  trimRequest.all,
  validate.updateProfile,
  controller.updateProfile
)

module.exports = router