const Messages = require("../../models/messages.model");

class chatDAO {
    async getMessages(user, message){
       
return await Messages.create({user, message})
    }

    async getAllMessages() {
        return await Messages.find({}, { _id: 0, __v: 0 }).lean();
      }
}


module.exports = chatDAO;