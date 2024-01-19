const mongoose = require('mongoose')

const productCollection = 'products'

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true },
    code: {
        type: String,
        unique: true,
        required: true
    
    },
    stock: { type: Number, required: true },
    status: { type: Boolean,default: true, required: true }
});

const Products = mongoose.model(productCollection, productSchema)

module.exports = Products