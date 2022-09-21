const express = require("express");
const { createServer } = require("https");
const socketio = require("socket.io");
const fs = require("fs");

const detect = require("detect-file-type");

const { v4: uuidv4 } = require('uuid');

const options = {
    cert: fs.readFileSync('/etc/letsencrypt/live/procon-test-bvjiwsdf.tk/fullchain.pem'),
    key: fs.readFileSync('/etc/letsencrypt/live/procon-test-bvjiwsdf.tk/privkey.pem'),
}

const app = express();
const httpsServer = createServer(options, app);

const io = socketio(httpsServer, {});

io.on("connection", (socket) => {
    socket.on("upload", (file, callback) => {
        console.log(file); // <Buffer 25 50 44 ...>
        let url = uuidv4();

        try {
            detect.fromBuffer(file, function(err, result) {
                if (err || file === null) {
                    console.log(err);
                    callback({ message: "failure"});
                    return;
                }
                if (!(result.mime == "image/jpeg" || result.mime == "image/png")) {
                    callback({ message: "failure"});
                    return;
                }
    
                fs.writeFile(`public/uploads/${url}`, file, (err) => {
                    callback({ message: err ? "failure" : "success", url: `uploads/${url}` });
                    return;
                });
            });
        } catch (err) {
            console.log(err);
            callback({ message: "failure"});
            return;
        }
        
    });
});

app.use(express.static("public"));


httpsServer.listen(3000);
