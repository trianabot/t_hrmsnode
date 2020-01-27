// const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const multer = require('multer');
const config = require('./config/config');
var path = require('path');
const queryHandler = require('./routes/query-handler');
const fs = require('fs');


var app = express();
const http = require("http");
const https = require("https");

const keyFilePath = path.resolve(__dirname, "../sslcert/stomachachecrew_private_key.key");
const certFilePath = path.resolve(__dirname, "../sslcert/stomachachecrew_ssl_certificate.cer");

let httpsServer = null;
if (fs.existsSync(keyFilePath)) {
    const privateKey = fs.readFileSync(keyFilePath, 'utf8');
    const certificate = fs.readFileSync(certFilePath, 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    httpsServer = https.createServer(credentials, app);
} else {
    console.log('Running without SSL certificate');
    httpsServer = https.createServer(app);
}

let server = http.Server(app);
let socketIO = require('socket.io');
let io = socketIO(server);
io.on('connection', (socket) => {
    console.log('new connection');
    // console.log(socket);
    socket.on('join', function (data) {
        socket.join(data.room);
        socket.broadcast.to(data.room).emit('new user joined', { user: data.user, message: 'has joined the room' })
    });

    socket.on('leave', function (data) {
        socket.broadcast.to(data.room).emit('left room', { user: data.user, message: 'has left the room' })
        socket.leave(data.room);
    });

    socket.on('message', function (data) {
        io.in(data.room).emit('new message', { user: data.user, message: data.message });
    });

    socket.on('sendMessage', function (data) {
        io.in(data.chatUser).emit('new Message', { user: data.currentUser, message: data.message });
        io.in(data.currentUser).emit('new Message', { user: data.currentUser, message: data.message });
    });

    socket.on('chat', function (data) {
        socket.join(data.room);
        socket.broadcast.to(data.chatUser).emit('newChat', { user: data.currentUser, message: data.currentUser + 'started convo with' + data.chatUser });
    });

    socket.on('setsocketid', function (data) {
        // console.log(data);
        // console.log(socket.id);
        const toSocketId = Promise.all([queryHandler.addsocketid({
            userId: data,
            socketId: socket.id
        })
        ])
    });

    socket.on(`add-message`, async (data) => {
        // console.log("addMSG:"+data);
        // console.log("INSIDEADDMSG:"+socket.id);
        socket.to(socket.id).emit(`add-message-response`, data);
        socket.broadcast.to(socket.id).emit(`add-message-response`, data);
        if (data.message === '') {
            socket.to(socket.id).emit(`add-message-response`, {
                error: true,
                message: 'meassge'
            });
        } else if (data.currentUser === '') {
            socket.to(socket.id).emit(`add-message-response`, {
                error: true,
                message: 'error user'
            });
        } else if (data.chatUser === '') {
            socket.to(socket.id).emit(`add-message-response`, {
                error: true,
                message: 'select user'
            });
        } else {
            try {
                const tosocketid = queryHandler.getUserInfo(data.chatUser);
                tosocketid.then(function (data) {
                    // console.log("chatUSER data"+","+data);
                    // console.log("CHatUSERTOSOCKETID"+data[0].socketid);
                    socket.to(data.tosocketid).emit(`add-message-response`, { currentUser: data.currentUser, chatUser: data.chatUser, message: data.message, currentUserName: data.currentUserName });
                    // socket.to(data[0].socketid).emit(`add-message-response`,{currentUser:data.userName, chatUser:data.chatUser, message: data.message}); 
                    // socket.to(socket.id).emit(`add-message-response`,data); 
                })
                // const fromsocketid = queryHandler.getcurrentUserInfo(data.currentUser);
                // fromsocketid.then(function (data) {
                //     console.log(data);
                //     // console.log(data[0].socketid);
                //     socket.to(data[0].socketid).emit(`add-message-response`,{user:data.chatUser, message: data.message}); 
                //     socket.to(socket.id).emit(`add-message-response`,data); 
                // })
                const messageResult = Promise.all([
                    // queryHandler.getUserInfo({
                    //     userId: data.currentUser,
                    //     socketId: socket.id
                    // }),
                    queryHandler.insertMessages(data)
                ]);
                // console.log(messageResult);
                // console.log(toSocketId);
                socket.to(data.tosocketid).emit(`add-message-response`, { currentUser: data.currentUser, chatUser: data.chatUser, message: data.message, currentUserName: data.currentUserName });
                socket.to(socket.id).emit(`add-message-response`, data);
            } catch (error) {
                io.to(socket.id).emit(`add-message-response`, {
                    error: true,
                    message: 'error msg'
                });
            }
        }
    });
})


app.use(bodyParser.json({ limit: '14mb', extended: true }))
app.use(bodyParser.urlencoded({ limit: '14mb', extended: true }));
app.use('/mediafiles', express.static(path.join(__dirname, "../SAC_Media/mediafiles/")));
app.use('/adminmedia', express.static(path.join(__dirname, "../SAC_Media/adminmedia/")));
// Set up mongoose connection
const mongoose = require('mongoose');

let dev_db_url = config.db;
let mongoDB = process.env.MONGODB_URI || dev_db_url;
mongoose.connect(mongoDB, { useNewUrlParser: true });
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var originsWhitelist = [
    'http://localhost:4200'
];

var corsOptions = {
    origin: function (origin, callback) {
        var isWhitelisted = originsWhitelist.indexOf(origin) !== -1;
        callback(null, isWhitelisted);
    },
    credentials: true
}

//Cors options

app.use(cors(corsOptions));

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', 'true')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization,X-Requested-With');
    next();
}

app.use(allowCrossDomain);

const userinfo = require('./routes/user.route');
const myMeme = require('./routes/memerouter_');
const admininfo = require('./routes/admin.route');
const categoryinfo = require('./routes/category.route');
const memeroute = require('./routes/meme.route');
const imageUploadRouter = require('./routes/imageupload');
const memeimageRouter = require('./routes/memeimage.route');
const groupRoute = require('./routes/group.route');
const blockmeme = require('./routes/blockmeme');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'userProfilePic')));

app.use('/user', userinfo);
app.use('/meme', memeroute);
app.use('/admin', admininfo);
app.use('/admin/category', categoryinfo);
app.use('/admin/memeImage', memeimageRouter);
app.use('/uploadProfilePic', imageUploadRouter);
app.use('/admin/block', blockmeme);
app.use('/memeupload', myMeme);
app.use('/group', groupRoute);


// app.use('/', (req, res) => {
//     res.send("This is something");
// });




// error handler
app.use((err, req, res, next) => {
    if (err.name === 'ValidationError') {
        var valErrors = [];
        Object.keys(err.errors).forEach(key => valErrors.push(err.errors[key].message));
        res.status(422).send(valErrors)
    }
});
let portNumber = config.port;
let port = process.env.PORT || portNumber;

// Run http server
server.listen(port, () => {
    console.log(`Server started on port` + port);
});


// Run https server
// httpsServer.listen(config.httpsPort, () => {
//     console.log(`Https Server started on port`, config.httpsPort);
// });


module.exports = app;
