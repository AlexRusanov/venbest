function makeMsgId(length) {
    let result           = '';
    const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function sendAuthReq() {
    pubSock.send(["api_in", JSON.stringify(authRequest)]);
}

let authRequest = {
    type: 'login',
    email: 'user1@domain1.com',
    pwd: 'userpass1',
    msg_id: makeMsgId(5)
};

// const readline = require('readline').createInterface({
//     input: process.stdin,
//     output: process.stdout
// });
//
// readline.question(`Enter login `, (log) => {
//     authRequest.email = log;
//     readline.question(`Enter password `, (pass) => {
//         authRequest.pwd = pass;
//     });
// });

const zmq = require("zeromq"),
    pubSock = zmq.socket("pub"),
    subSock = zmq.socket("sub");

const myArgs = process.argv.slice(2);

pubSock.bindSync(`tcp://127.0.0.1:${myArgs[0]}`);

setInterval(sendAuthReq, 500);

subSock.connect(`tcp://127.0.0.1:${myArgs[1]}`);

subSock.subscribe("api_out");

subSock.on("message", function(topic, message) {
    let response = JSON.parse(message);
    console.log(response);

    if (response.status === "ok") {
        console.log("ok");
    }

    if (response.status === "error") {
        console.log(response.error);
    }
});
