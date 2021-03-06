// const bd = [
//     {
//         id: 1,
//         email: "user1@domain1.com",
//         passw: "userpass1"
//     },
//     {
//         id: 2,
//         email: "user2@domain2.com",
//         passw: "userpass2"
//     },
//     {
//         id: 3,
//         email: "user3@domain3.com",
//         passw: "userpass3"
//     }
// ];

const sqlite = require('sqlite3').verbose();
let db = new sqlite.Database('./db.sqlite3');

function sendAuthRes() {
    pubSock.send(["api_out", JSON.stringify(authResponse)]);
}

const zmq = require("zeromq"),
    pubSock = zmq.socket("pub"),
    subSock = zmq.socket("sub");

const myArgs = process.argv.slice(2);

pubSock.bindSync(`tcp://127.0.0.1:${myArgs[0]}`);

subSock.connect(`tcp://127.0.0.1:${myArgs[1]}`);

subSock.subscribe("api_in");

let authResponse;

let user;

let response;

subSock.on("message", function(topic, message) {
    response = JSON.parse(message);

    if (response.type === "login") {
        db.get('SELECT * FROM user WHERE email = ?', response.email, (err, row) => {
            if (err) {
                return console.error(err.message);
            } else {
                user = row;
            }
        });

        if (user && user.passw === response.pwd) {
            authResponse = {
                msg_id:  response.msg_id,
                user_id: user.id,
                status:  "ok"
            };

            setInterval(sendAuthRes, 500);
        } else if (response.pwd === "" || response.email === "" || !response.pwd || !response.email){
            authResponse = {
                msg_id: response.msg_id,
                status: "error",
                error:  "WRONG_FORMAT"
            };

            setInterval(sendAuthRes, 500);
        } else {
            authResponse = {
                msg_id: response.msg_id,
                status: "error",
                error:  "WRONG_PWD"
            };

            setInterval(sendAuthRes, 500);
        }
    }
});