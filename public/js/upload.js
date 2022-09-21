const socket = io();

function upload(files) {
    if (files[0].size > 1 * 1024 * 1024) {
        console.log("ファイルサイズが大きすぎます");
        return;
    }

    socket.emit("upload", files[0], (status) => {
        console.log(status);
        addUser(status.url)
    });
}