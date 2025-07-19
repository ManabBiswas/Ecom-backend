const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
});

module.exports = upload
// .single('image');
//  // 'image' is the field name in the form