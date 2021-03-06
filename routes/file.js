var express = require('express');
var router = express.Router();  
var multer  = require('multer');


var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
      cb(null,  Date.now()+ '-' + file.originalname)
    }
  })

  var upload = multer({ storage: storage })

router.post('/upload', upload.single('file_upload'), (req,res) => {
  res.send(req.file);
})

module.exports = router;