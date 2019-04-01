var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;



var base_price = 1;

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'new_password',
  database : 'parking_system'
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

function calculateFare(from){
  const from_time = Math.round(new Date(from).getTime()/1000);
  const to_time =  Math.round(new Date().getTime()/1000);
  return ((to_time - from_time) * base_price);
}

app.get('/fillslot/:slot/:session',function(req,res){
    const slot= req.params.slot;
    const session = req.params.session;
    connection.query(`UPDATE slots SET session_id = '${session}' WHERE id = '${slot}'`, function (err4) {
    if (err4) throw err4;
      io.emit('rfid_scanned', `vehicle_parked`);
    });
});

app.get('/newparking/:id', function(req, res){
  const user_id = req.params.id;
  connection.query(`SELECT * FROM parking_sessions WHERE user_id = '${user_id}' AND to_time IS NULL`, function (err5,prev_sessions) {
    if (err5) throw err5;
      if(prev_sessions.length > 0){
        connection.query(`UPDATE slots SET session_id = NULL WHERE session_id = '${prev_sessions[0].id}'`, function (err6) {
  
          if (err6) throw err6;
          const fare = calculateFare(prev_sessions[0].from_time);
          connection.query(`UPDATE parking_sessions SET to_time = NOW(), price = '${fare}' WHERE id = '${prev_sessions[0].id}'`, function (err7) {
            if (err7) throw err7;
            connection.query(`UPDATE users SET Balance = Balance - ${fare} WHERE id = '${user_id}'`, function (err8) {
              if (err8) throw err8;
              
              res.send({
                "result": 1,
                "status": 1,
                "message":`Thank You, Fare Amount: ${fare}$`
              });

               connection.query(`SELECT * from slots ORDER BY id ASC`, function (err88,slots) {
                   if (err88) throw err88;
                   io.emit('park_vehicle', {
                      session_id: 0,
                      parking_1: slots[0]['session_id'] == null ? false : true,
                      parking_2: slots[1]['session_id'] == null ? false : true
                  });
               });

              io.emit('rfid_scanned', `Thank You, Fare Amount: ${fare}$`);

            });
             
          });   

        });
      } else {
        connection.query(`SELECT * FROM users WHERE id = '${user_id}'`, function (err, result, fields) {
          if (err) throw err;
          if(result.length > 0){
            if(result[0].Balance > 0){  
              connection.query(`SELECT * FROM slots ORDER BY id ASC`, function (err2, slots) {
                if (err2) throw err2;
                let is_empty = false;
                slots.forEach(function(item) {
                  if (item.session_id == null) {
                    is_empty = true;
                    return false
                  } 
                });

                console.log(is_empty);

                if(is_empty){                 
                  connection.query(`INSERT into parking_sessions(user_id,from_time) VALUES ('${user_id}',NOW())`, function (err3, sessions) {
                    if (err3) throw err3;                    
                      res.send({
                        "result": 1,
                        "status": 1,
                        "message":`Hi ${result[0].Name}`
                      });
                      io.emit('park_vehicle', {
                        session_id:sessions.insertId,
                        parking_1: slots[0]['session_id'] == null ? false : true,
                        parking_2: slots[1]['session_id'] == null ? false : true
                      });
                  });  

                } else {
                  res.send({
                    "result": 1,
                    "status": 300,
                    "message":`Parking is Full!!`
                  });
                  io.emit('rfid_scanned', `Parking is Full!`);
                }
              });
            } else {
              res.send({
                "result": 1,
                "status": 200,
                "message":"Insufficient Balance"
              });
            }
          } else {
            res.send({
              "result": 1,
              "status": 100,
              "message":"User Not Found!"
            });
          }
        });
      }
    });
});

app.get('/addbalance/:id/:amount',function(req,res){
  const user_id = req.params.id;
  const amount = req.params.amount;

  connection.query(`UPDATE users SET Balance = Balance + ${amount} WHERE id = '${user_id}'`, function (error) {
      if (error) throw error;
      res.send({
        result:1,
        status:1,
        message:"Updated Successfully!"
      })
    })
  });

app.get('/getusersessiondata/:id',function(req,res){
  const rfid = req.params.id;
  connection.query(`SELECT * FROM parking_sessions WHERE user_id = '${rfid}' ORDER BY from_time DESC`, function (err9,prev_sessions) {
    if (err9) throw err9;

    else
    {
      connection.query(`SELECT * FROM users WHERE id = '${rfid}' `, function (err10,userdata) {
        if (err10) throw err10;
    
        else
        {
          
          connection.query(`SELECT * FROM slots`, function (err11,slots) {
            if (err10) throw err10;
        
            else
            {
              const details = {
                name:userdata[0].Name,
                balance:userdata[0].Balance,
                slots: JSON.parse(JSON.stringify(slots)),
                parking_sessions: JSON.parse(JSON.stringify(prev_sessions))
              }
              res.send(details);
            }
        
          })
        }
    
      })

    }

  })


});
  


io.on('connection', function(socket){
  socket.on('rfid_scanned_request', function(msg){
    io.emit('rfid_scanned', msg);
  });

  socket.on('parking_slot_1', function(msg){
    io.emit('parking_slot_1', msg);
  });

  socket.on('parking_slot_2', function(msg){
    io.emit('parking_slot_2', msg);
  });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});