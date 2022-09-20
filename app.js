const exp = require("constants");
const express = require("express");
const app = express();

const multer = require("multer");
const upload = multer({
    dest: "public/uploads/",
    limits: {
        files: 1,
        fileSize: 2 * 1024 * 1024,
    }
});


app.use(express.static('public'));


app.post('/upload', upload.single('file'), function (req, res) {
    res.send(req.file.originalname + 'ファイルのアップロードが完了しました。');
})


app.listen(3000, () => {
    console.log("Listening...");
});
