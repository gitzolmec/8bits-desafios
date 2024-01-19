const mongoose = require('mongoose')

const messagesCollection = 'messages'

const messageSchema = new mongoose.Schema({
    products: [{
        id:{type: number},
        quantity:{type: number} 

    }]
});

const Messages = mongoose.model(messagesCollection, messageSchema)

module.exports = Messages