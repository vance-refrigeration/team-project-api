'use strict'

const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true
  },
  cart: {
    type: Array,
    'default': []
  },
  token: {
    type: String,
    required: true
  },
  passwordDigest: String
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function (doc, pojoUser) {
      // remove sensitive data from every user document
      delete pojoUser.token
      delete pojoUser.passwordDigest
      return pojoUser
    }
  },
  toObject: {
    virtuals: true
  }
})

userSchema.plugin(uniqueValidator)

// userSchema.virtual('cartTotal').set(function cartTotal () {
//   if (this.cart.length !== 0) {
//     this.cartTotal = this.cart.reduce(function (sum, product) {
//       return sum + product.price
//     })
//   } else {
//     this.cartTotal = 0
//   }
// })
//
// userSchema.virtual('cartTotal').get(function cartTotal () {
//   return this.cartTotal
// })

userSchema.methods.comparePassword = function (password) {
  const _this = this

  return new Promise((resolve, reject) =>
    bcrypt.compare(password, _this.passwordDigest, (err, data) =>
        err ? reject(err) : data ? resolve(data) : reject(new Error('Not Authorized')))
    ).then(() => _this)
}

userSchema.virtual('password').set(function (password) {
  this._password = password
})

userSchema.pre('save', function (next) {
  const _this = this

  if (!_this._password) {
    return next()
  }

  new Promise((resolve, reject) =>
    bcrypt.genSalt(null, (err, salt) =>
        err ? reject(err) : resolve(salt))
  ).then((salt) =>
    new Promise((resolve, reject) =>
      bcrypt.hash(_this._password, salt, (err, data) =>
        err ? reject(err) : resolve(data)))
  ).then((digest) => {
    _this.passwordDigest = digest
    next()
  }).catch((error) => {
    next(error)
  })
})

userSchema.methods.setPassword = function (password) {
  const _this = this

  return new Promise((resolve, reject) =>
    bcrypt.genSalt(null, (err, salt) =>
        err ? reject(err) : resolve(salt))
  ).then((salt) =>
    new Promise((resolve, reject) =>
      bcrypt.hash(password, salt, (err, data) =>
        err ? reject(err) : resolve(data)))
  ).then((digest) => {
    _this.passwordDigest = digest
    return _this.save()
  })
}

const User = mongoose.model('User', userSchema)

module.exports = User
