'use strict'

module.exports = require('lib/wiring/routes')

// create routes

// what to run for `GET /`
.root('root#root')

// standards RESTful routes
.resources('examples')
.resources('products', { only: ['index', 'show'] })
.resources('orders')
// .resources('products', { except: ['update', 'destroy', 'create'] })

// users of the app have special requirements
.post('/sign-up', 'users#signup')
.post('/sign-in', 'users#signin')
.delete('/sign-out/:id', 'users#signout')
.patch('/change-password/:id', 'users#changepw')
.patch('/add-product/:id', 'users#addproduct')
.patch('/remove-product/:id', 'users#removeproduct')
.patch('/empty-cart/:id', 'users#emptycart')
.resources('users', { only: ['index', 'show'] })

// all routes created
