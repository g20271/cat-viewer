const socket = io();

function upload(files) {
    if (files[0].size > 3 * 1024 * 1024) {
        console.log("ファイルサイズが大きすぎます");
        return;
    }

    socket.emit("upload", files[0], (status) => {
        console.log(status);
        
    });
    socket.on("newUser", (url) => {
        addUser(url);
    })
}