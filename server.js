var express = require("express");
var path = require("path");
var app = express();
var bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use(express.static( __dirname + '/public/dist' ));

var bcrypt = require('bcryptjs');
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/MultiGame')

//Basic user schema -- right now includes only username -- required, must be at least 4 characters.
var UserSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: [true, "You must enter a username."],
        minlength: [4, "Username must be at least 4 characters."],
        unique: true
    },
    password: {
        type: String,
        required: [true, "You must enter a password."],
        minlength: [8, "Password must be at least 8 characters."],
    },
    wins: {type: Number, default: 0},
    played: {type: Number, default: 0}
});
//mongoose middleware automatically hashes pw before saved to db
UserSchema.pre('save', function(next){
    let that = this;
    if(!that.isModified('password')) return next();
    bcrypt.hash(this.password,10,function(err,hash){
        if(err){
            console.log("Error generating hash.");
            next();
        } else {
            that.password = hash;
            next();
        }
    });
});

var User = mongoose.model('User', UserSchema);

var sharesession = require("express-socket.io-session");

//Get Users
app.get('/users', function(req,res){
    User.find({},function(err,user){
        if(err){
            res.json({succeeded: false, status: err});
        }
        else {
            res.json({data: user});
        }
    })
})

//Basic registration route.
app.post('/register', function(req,res){
    User.create(req.body, function(err,user){
        if(err){
            res.json({succeeded:false,status:err});
        } else {
            res.json({succeeded:true,status:user});
        }
    });
});

//Basic login route.
app.post('/login', function(req,res){
    User.findOne({username:req.body.username},function(err,user){
        if(err){
            res.json({succeeded:false,status:err});
        } else {
            if (!user) {
                res.json({succeeded:false,status:"Invalid user data."});
            } else {
                bcrypt.compare(req.body.password,user.password,function(err,same){
                    if(err){
                        res.json({succeeded:false,status:"Server error."});
                    } else {
                        if(!same){
                            res.json({succeeded:false,status:"Invalid user data."});
                        } else {
                            res.json({succeeded:true,status:"All clear."});
                        }
                    }
                });
                // if (!bcrypt.compare(req.body)) {
                //     res.json({succeeded:false,status:"Invalid user data."})
                // } else {
                //     res.json({succeeded:true,status:user});
                // }
            }
        }
    });
});

// for User Profile

app.get('/player/:username', function(req,res){
    var username =req.params.username;
    User.findOne({username:username}, function(err, person){
        if(err){
            console.log('cant find player', err)
        }
        else{
            console.log('Player Found');
            res.json({data:person});
        }
    })
})

app.all("*", (req,res,next) => {
    res.sendFile(path.resolve("./public/dist/index.html"))
});


var server = app.listen(8000, function(){
    console.log("listening on port 8000");
});

var io = require('socket.io').listen(server);
io.sockets.on('connect', function(socket) {
    console.log('new connection made.')
    socket.on('UserInfo', function(data){
        socket.emit('user logged', data )
    })
    socket.on('roomCheck', function(){
        io.emit('rooms', io.sockets.adapter.rooms);
    })

    socket.on('join', function(data){
        //joining, .join specifies a specific room for the user to join
        socket.join(data.room);
        console.log(io.sockets.adapter.rooms[data.room]['length'])
        if(io.sockets.adapter.rooms[data.room]['length'] == 1){
            socket['player'] = 'X'
            socket['playerName'] = data.user
            io.in(data.room).emit('new message', {user: 'SYSTEM', message: `${data.user} is X`})
        }
        else if(io.sockets.adapter.rooms[data.room]['length'] == 2){
            socket['player'] = 'O'
            socket['playerName'] = data.user
            io.in(data.room).emit('new message', {user: 'SYSTEM', message: `${data.user} is O`})
        }
        //initialize the board
        if (!io.sockets.adapter.rooms[data.room]['board']) {
            io.sockets.adapter.rooms[data.room]['board'] = 
            {
                1: "",
                2: "",
                4: "",
                8: "",
                16: "",
                32: "",
                64: "",
                128: "",
                256: "",
                Turn: 'X',
                moves: 0,
                Winner: false,
                Won: false,
            }
        }
        //initialize the lobby
        if(!io.sockets.adapter.rooms[data.room]['Lobby']){
            io.sockets.adapter.rooms[data.room]['Lobby'] = [];
        }
        if(!io.sockets.adapter.rooms[data.room]['Lobby'].includes(data.user)){
            io.sockets.adapter.rooms[data.room]['Lobby'].push(data.user)
        }
        console.log(io.sockets.adapter.rooms[data.room]['Lobby'])
        var board = io.sockets.adapter.rooms[data.room]['board']
        console.log(io.sockets.adapter.rooms[data.room])
        //test info on server side
        console.log(`${data.user} joined the room: ${data.room}`)
        //broadcast to everyone except the person who is joining, .to specifies which room to broadcast too
        socket.broadcast.to(data.room).emit('new user joined', {user: data.user, message:'has joined this room.'});
        io.emit('rooms', io.sockets.adapter.rooms);
        io.in(data.room).emit('new state', state);
        io.in(data.room).emit('TTT state', board);
    });

    socket.on('leave', function(data){
        console.log(`${data.user} left the room: ${data.room}`)
        //broadcast to everyone except the person who is leaving, .to specifies which room to broadcast too
        socket.broadcast.to(data.room).emit('left room', {user: data.user, message:'has left this room.'});
        //leave the room
        socket.leave(data.room);
        io.emit('rooms', io.sockets.adapter.rooms);
    });

    //socket for setting the messages from the individual user
    socket.on('message', function(data){
        //sends message to all of the people in that room
        io.in(data.room).emit('new message', {user: data.user, message: data.message});
    });

    socket.on('action', function(data){
        var that = this;
        console.log('tic tac toe', data)
        if(data.GameTitle == "Button"){
            if (data.action == "button1") {
                state = {
                    onePushed: true,
                    twoPushed: false
                }
            } else if (data.action == "button2") {
                state = {
                    onePushed: false,
                    twoPushed: true
                }
            }
            io.in(data.room).emit('new state', state)
        }
        else if(data.GameTitle == "TTT"){
            console.log(io.sockets.adapter.rooms[data.room])
            var board = io.sockets.adapter.rooms[data.room]['board'];
            console.log(data);
            // if the board tile has a value greater than 0 then it is filled
            
            if(board[data.Tile].length == 0){
                if(socket['player'] == board['Turn']){
                    board[data.Tile] = socket['player'];
                    if(board['Turn'] == 'X'){
                        board['Turn'] = 'O';
                        board['moves'] += 1;
                    }
                    else if(board['Turn'] == 'O'){
                        board['Turn'] = 'X';
                        board['moves'] += 1;
                    }
                }
            }
            //winning logic
            if(boardcheck(socket['player'],board)){
                board['Winner'] = socket['playerName']
                console.log('the winner is', socket['playerName'])
                board['Turn'] = false;
                if(board['Turn'] == false && board['Won'] == false){
                    User.findOne({username: socket['playerName']}, function(err, player){
                        if(err){
                            console.log('something went wrong')
                        }
                        else {
                            console.log(player)
                            player.wins += 1
                            player.played += 1;
                        }
                        player.save(function(err){
                            if(err){
                                console.log(err)
                            }
                            board['Won'] = true
                        });
                    })
                    //this function pulls the other name from the lobby so we can update the play count
                    for(let i=0; i <  io.sockets.adapter.rooms[data.room]['Lobby'].length; i++){
                        if(socket['playerName'] !=  io.sockets.adapter.rooms[data.room]['Lobby'][i]){
                            User.findOne({username:  io.sockets.adapter.rooms[data.room]['Lobby'][i]}, function(err,player){
                                if(err){
                                    console.log('something went wrong')
                                }
                                else {
                                    player.played += 1;
                                }
                                player.save(function(err){
                                    if(err){
                                        console.log(err)
                                    }
                                })
                            })
                        }
                    }
                }
            }
            //Tie
            if(board['moves'] == 9 && board['Winner'] == false){
                board['Winner'] = 'Tie';
                board['Turn'] = false
                if(board['Turn'] == false && board['Won'] == false){
                    for(let i = 0; i < 2; i++){
                        User.findOne({username: io.sockets.adapter.rooms[data.room]['Lobby'][i]}, function(err, player){
                            if(err){
                                console.log('something went wrong')
                            }
                            else {
                                console.log(player)
                                player.played += 1
                            }
                            player.save(function(err){
                                if(err){
                                    console.log(err)
                                }
                                board['Won'] = true
                            })
                        });
                        console.log('it is a tie!!')
                    }
                }
            }
            io.in(data.room).emit('TTT state', board);}
    });
    socket.on('reset',function(data){
        io.sockets.adapter.rooms[data]['board'] = {
            1: "",
            2: "",
            4: "",
            8: "",
            16: "",
            32: "",
            64: "",
            128: "",
            256: "",
            Turn: 'X',
            moves: 0,
            Winner: false,
            won: false,
        }
        console.log('reset', io.sockets.adapter.rooms[data]['board'])
        var board = io.sockets.adapter.rooms[data]['board']
        io.in(data).emit('TTT state', board)
    });
});

// define the starting game state (should be sent to each client on logging in to game.)
var state = {
    onePushed: true,
    twoPushed: false
}
// for tic tac toe

var bcb = [[1,2,4],[8,16,32],[64,128,256],[1,8,64],[2,16,128],[4,32,256],[4,16,64],[1,16,256]]

function boardcheck(player,board)
{
    for(i = 0; i < bcb.length; i++)
    {
        if(bcb[i].every(key => {

            if(board[key] == player)
            {
                return true;
            }
        })){ return true; }
    }
    return false;
}
