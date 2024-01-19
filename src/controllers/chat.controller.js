const { Router } = require('express')






const router = Router()

router.get('/', async (req, res) => {
    
       res.render('chat.handlebars')

})

module.exports = router