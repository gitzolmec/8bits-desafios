const mongoose = require('mongoose')

const cartCollection = 'cart'

const cartSchema = new mongoose.Schema({
    products: [{
        id:{type: String},
        quantity:{type: Number} 

    }]
});

const Carts = mongoose.model(cartCollection, cartSchema)

module.exports = Carts