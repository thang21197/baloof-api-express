var express = require('express');
var router = express.Router();
const verify = require ('./middleware/verifyToken');


router.get('/', verify, (req,res) => {
    
    res.json({posts:{
           title:"my first post",
           description:"random data you shoundt access"
        }
    });
} )

module.exports = router;