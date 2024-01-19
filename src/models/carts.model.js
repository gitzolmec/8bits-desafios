const mongoose = require('mongoose')

const cartCollection = 'cart'

const cartSchema = new mongoose.Schema({
    products: [{
        id:{type: number},
        quantity:{type: number} 

    }]
});

const Carts = mongoose.model(cartCollection, cartSchema)

module.exports = Carts