const redClient = require("../database/redis");
const User = require("../database/models/user-model");
const Surkl = require("../database/models/surkl-model");

const spliceObj = (obj, keys) => {
  let spliced = {};
  keys.forEach(k => {
    if (obj[k]) {
      spliced[k] = obj[k];
    }
  });
  return spliced;
};
module.exports = (io, socket, connectedUsers) => {
  /////////////////////////////////////////////////////////////
  socket.on("share-track", (track_id, surkl_id) => {
    redClient.set("track" + surkl_id, track_id);
    socket.broadcast.to(surkl_id).emit("track", track_id);
    // console.log('SHARED', surkl_id, track_id)
  });
  /////////////////////////////////////////////////////////////
  socket.on("get-track", surkl_id => {
    redClient.get("track" + surkl_id, (err, track) => {
      io.to(socket.id).emit("mounted-track", track);
    });
  });
  /////////////////////////////////////////////////////////////
  socket.on("join-surkl-room", surkl_id => {
    socket.join(surkl_id);

    redClient.hget("surkls-msgs", surkl_id, (err, msgs) => {
      if (err) {
        socket.emit("videoChatError");
      } else {
        io.to(socket.id).emit("receive-surkl-msgs", JSON.parse(msgs));
      }
    });

    Surkl.findById({ _id: surkl_id }).then(surkl => {
      let online = [];
      surkl.members.forEach(mem => {
        if (connectedUsers.hasOwnProperty(mem.user_id)) {
          let notConfusingObject = {
            user_id: mem.user_id,
            userName: mem.userName,
            avatarUrl: mem.avatarUrl
          };
          online.push(notConfusingObject);
          // mongos _id wouldnt let me delete it for sone reason.
        }
      });

      redClient.get("track" + surkl_id, (err, track) => {
        io.to(surkl_id).emit("online-users-n-surkl", online, surkl, track);
      });
    });
  });
  /////////////////////////////////////////////////////////////
  socket.on("created-surkl", (surkl, user) => {
    let msgs = [];
    redClient.hset(
      "surkls-msgs",
      surkl.surkl_id,
      (err, done) => {
        if (err) {
          io.to(socket.id).emit("videoChatError");
        }
      }
    );
  });
  /////////////////////////////////////////////////////////////
  socket.on("surkl-msg", msg => {
    redClient.hget("surkls-msgs", msg.surkl_id, (err, msgs) => {
      if (err) {
        socket.emit("videoChatError");
      } else if (msgs !== null) {
        let msgsArr = JSON.parse(msgs);
        if (msgsArr.length > 200) {
          msgsArr = msgsArr.slice(msgsArr.length - 200);
        }
        msgsArr.push(msg);
        redClient.hset(
          "surkls-msgs",
          msg.surkl_id,
          (err, done) => {
            if (err) {
              io.to(socket.id).emit("videoChatError");
            }
            io.to(msg.surkl_id).emit("receive-surkl-msgs", msgsArr);
          }
        );
        if (msg.mentions) {
          if (msg.mentions.length > 0) {
            let notif = {
              source: {
                name: msg.userName,
                source_id: msg.user_id,
                avatarUrl: msg.avatarUrl,
                surkl_id: msg.surkl_id
              },
              notifType: "mention",
              text: msg.msg,
              date: Date.now()
            };
            let menIds = msg.mentions.map(men => {
              if (connectedUsers[men.user_id]) {
                io.to(connectedUsers[men.user_id].socketId).emit(
                  "notif",
                  notif
                );
              }
              return men.user_id;
            });

            User.updateMany(
              { _id: { $in: menIds } },
              {
                $push: {
                  notifs: {
                    $each: [notif],
                    $position: 0
                  }
                },
                $inc: { notif_count: 1 }
              }
            ).exec();
          }
        }
      }
    });
  });
  /////////////////////////////////////////////////////////////
  socket.on("clear-notifs", user => {
    User.updateOne({ _id: user._id }, { $set: { notif_count: 0 } }).exec();
  });
  socket.on("clear-all-notifs", user => {
    User.updateOne({ _id: user._id }, { $set: { notifs: [] } }).exec();
  });
  socket.on("decline-surkl", (notif_id, user_id) => {
    User.updateOne(
      { _id: user_id },
      {
        $pull: { notifs: { _id: notif_id } }
      }
    ).exec();
    io.to(socket.id).emit("declined-surkl", notif_id);
  });
  /////////////////////////////////////////////////////////////
  socket.on("accept-surkl", (notif, user) => {
    let memOf = {
      surkl_id: notif.source.source_id,
      name: notif.source.name
    };
    let userObj = {
      userName: user.userName,
      avatarUrl: user.avatarUrl,
      user_id: user._id
    };

    User.updateOne(
      { _id: user._id },
      {
        $set: { memberOf: memOf },
        $pull: { notifs: { _id: notif._id } }
      }
    ).exec();
    Surkl.findByIdAndUpdate(
      { _id: notif.source.source_id },
      { $push: { members: userObj, memberIds: userObj.user_id } },
      { new: true },
      (err, up) => {
        io.to(socket.id).emit("accepted-surkl", up, notif._id);
      }
    );
  });
  /////////////////////////////////////////////////////////////
  socket.on('request-to-join-surkl', (req)=>{
  Surkl.findOneAndUpdate({_id: req.surkl_id}, {$push:{requests:req.user_id}}).then(resp=>{
    let notifForAdmin = {
      source: {
        name:req.userName,
        source_id:req.user_id,
        avatarUrl:req.avatarUrl
      },
      notifType: 'add-to-surkl',
      text: req.userName+' wants to join your Surkl',
      date: Date.now()
    }
    User.findOneAndUpdate({_id: req.admin_id}, {
      $inc: { notif_count: 1 },
      $push:{notifs: {
        $each: [notifForAdmin],
        $position: 0
      }}}).then(resp=>{
        io.to(socket.id).emit('request-to-join-surkl-pending', req.surkl_id);
        io.to(connectedUsers[req.admin_id].socketId).emit('request-to-join-surkl', notifForAdmin)
    })
  });
  })
  /////////////////////////////////////////////////////////////
  socket.on("add-to-surkl", (userToAdd, surkl) => {
    delete userToAdd.dms;
    delete userToAdd.followers;
    delete userToAdd.following;
    delete userToAdd.mySurkl;
    let notif = {
      notifType: "join-surkl",
      source: {
        name: surkl.name,
        adminName: surkl.adminName,
        avatarUrl: surkl.adminAvatar,
        source_id: surkl.surkl_id
      },
      text: surkl.adminName + " has invited you to join " + surkl.name
    };
    User.findOneAndUpdate(
      { _id: userToAdd._id },
      {
        $push: {
          notifs: {
            $each: [notif],
            $position: 0
          }
        },
        $inc: { notif_count: 1 }
      },
      { new: true },
      (err, upNotif) => {
        if (err) console.log(err);
        //io.to(connectedUsers[userToAdd._id].socketId).emit('notif',  upNotif.notifs[0])
      }
    );

    //Surkl.updateOne({_id: surkl._id}, {$push:userToAdd}).exec()
  });
  socket.on("approve-join-surkl-req", (data, surkl) => { 
    let notif = {
      source: {
        name: surkl.name,
        surkl_id: surkl.surkl_id,
        bannerUrl: surkl.bannerUrl
      },
      notifType: "surkl-join-approved",
      text: "You have been approved to join " + surkl.name
    };
    let newMember = {
      user_id: data.source.source_id,
      userName:data.source.name,
      avatarUrl:data.source.avatarUrl 
    }
    Surkl.findByIdAndUpdate({_id: surkl.surkl_id}, {$push:{members:newMember}}).then(val=>{
      User.findOneAndUpdate(
        { _id: data.source.source_id },
        { $push:{notifs: {
          $each: [notif],
          $position: 0
        }},
          $set: {
            memberOf: {
              name: surkl.name,
              surkl_id: surkl.surkl_id
            }
          },
          $inc: { notif_count: 1 }
        },
        { new: true },
        (err, upNotif) => {
          if(err) console.log(err)
        }
      );
      io.to(connectedUsers[data.source.source_id].socketId).emit("join-surkl-req-approved", notif)
    })
  });
  ////////////////////////////streams/////////////////////////////////
  socket.on("surkl-file", (chunk, surkl, size, end, msgObj) => {
    if (end === "end-of-file") {
      redClient.hget("surkls-msgs", surkl, (err, msgsStr) => {
        let msgs = JSON.parse(msgsStr);
        msgs.push(msgObj);
        redClient.hset("surkls-msgs", surkl, JSON.stringify(msgs));
      });
      io.in(surkl).emit("surkl-sharing-file", chunk, "end-of-file", msgObj);
    } else {
      io.in(surkl).emit("surkl-sharing-file", chunk, size);
    }
  });
};
