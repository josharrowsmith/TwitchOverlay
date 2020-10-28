import express, { response } from "express";
import socketIo from "socket.io";
import http from "http";
import fetch from "node-fetch";
import cron from "node-cron"
const session = require("express-session")({
    secret: "my-secret",
    resave: true,
    saveUninitialized: true
});
import { getActivities, getItemFromManifest, searchPlayer, getCharacters, apiKey, getMainTheMainfest, activityDefinition, nightFalls } from "./exports/bungie_api_calls"
require('dotenv').config()

const people = {};
const sockmap = {};

const port = process.env.PORT || 8081;
const app = express();
app.use(session)
const server = http.createServer(app);
const io = socketIo(server)

const getApiAndEmit = async (socket, data) => {
    socket.emit("FromAPI", data);
};

async function getTheMainfest() {
    const request = await fetch(getMainTheMainfest(), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseData = await resData.Response.jsonWorldComponentContentPaths.en.DestinyActivityTypeDefinition;
    return responseData
}

async function getActivityTypeDefinition(url) {
    const request = await fetch(activityDefinition(url), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseArray = Object.values(resData);
    // const found = nightFalls.includes(currentHash);
}

async function searchPlayers(name) {
    const request = await fetch(searchPlayer(name), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    if (resData.Response.length > 0) {
        const responseArray = await Object.values(resData.Response);
        const pcDetails = responseArray.filter(i => i.membershipType === 3);
        return pcDetails;
    }
}

async function getCharacterss(membershipType, membershipId) {
    const request = await fetch(getCharacters(membershipType, membershipId), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseData = await resData.Response.profile.data.characterIds;
    const responseArray = Object.values(responseData);
    return responseArray;
}

async function getActivitiesHashes(membershipType, membershipId, character, pages) {
    const request = await fetch(getActivities(membershipType, membershipId, character, pages), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseObject = await resData.Response.activities;
    const responseArray = responseObject !== undefined ? Object.values(responseObject) : [];
    return responseArray;
}

async function getData(hash, completed, completionReason) {
    // I need to get these requests down 
    const found = nightFalls.includes(hash);
    if (found) {
        const request = await fetch(getItemFromManifest(hash), {
            method: 'GET',
            headers: {
                "X-API-Key": apiKey,
                "Content-Type": "application/json"
            }
        })

        if (!request.ok) {
            const errorResData = await response.json();
            const errorId = errorResData.error.message;
        }
        return completed === 0 && completionReason === 0 ? 0 : 1;
    }
    return;

}

async function receiveData(socket, room, owner) {
    console.log(typeof owner);
    if (typeof owner === 'string') {
        setInterval(() => {
            socket.emit("update", `${owner}`);
            socket.to(room).broadcast.emit("update", `${owner}`);
        }, 3000);
    }
    // console.log("the room is", room);
    // const data = Object.values(people);
    // for (const [key, value] of Object.entries(data[0])) {
    //     if (value.owner == true) {
    //         const profiles = await searchPlayers(value.name)
    //         const membershipType = profiles[0].membershipType;
    //         const membershipId = profiles[0].membershipId;
    //         const characters = await getCharacterss(membershipType, membershipId)
    //         let data = await Promise.all(
    //             characters.map(async i => {
    //                 let pages2 = [];
    //                 let hashes = await getActivitiesHashes(membershipType, membershipId, i, 0)
    //                 // I am stuck on page two 
    //                 if (hashes.length >= 250) {
    //                     const fuck = await getActivitiesHashes(membershipType, membershipId, i, 1)
    //                     pages2 = fuck;
    //                 }
    //                 return [...pages2, ...hashes];
    //             })
    //         )
    //         let newData = [].concat.apply([], [...data])
    //         console.log(newData.length)
    //         let result = await Promise.all(
    //             newData.map(async k => {
    //                 let cool = await getData(k.activityDetails.directorActivityHash, k.values.completed.basic.value, k.values.completionReason.basic.value)
    //                 return cool;
    //             })
    //         ).catch((err) => console.log(err))
    //         let endResult = result.filter(i => i === 1).length;
    //         console.log('number of the found elements: ' + endResult);
    //         io.to(value.id).emit('FromAPI', endResult);
    //         socket.to(room).broadcast.emit("FromAPI", endResult);
    //     } else {
    //         console.log("not a onwer")
    //     }
    // }
}

async function keepAlive() {
    let response = await fetch(process.env.DYNO_URL
    ).then(() => console.log("good")).catch(() => console.log(error))
}

io.on("connection", socket => {
    socket.on('join', (name, room, owner) => {
        console.log(name, room, owner);
        socket.join(room);
        if (!people.hasOwnProperty(room)) {
            people[room] = {};
        }

        people[room][socket.id] = {
            name: name,
            id: socket.id,
        };
        sockmap[socket.id] = {
            name: name,
            room: room,
        }
        if (room == '')
            socket.emit("update", "You have connected to the default room.");
        else
            socket.emit("update", `You have connected to room ${room}.`);
        socket.emit("people-list", people[room]);
        socket.to(room).broadcast.emit("add-person", name, socket.id);
        socket.to(room).broadcast.emit("update", `${name} has come online. `);
        receiveData(socket, room, owner);
        // setInterval(() => { socket.to("test").broadcast.emit("update", `hey`); }, 3000);
    });

    socket.on('disconnect', () => {
        if (sockmap[socket.id]) {
            const room = sockmap[socket.id].room;
            socket.to(room).broadcast.emit("update", `${sockmap[socket.id].name} has disconnected. `);
            console.log("has been deleted", `${sockmap[socket.id].name}`)
            delete people[room][socket.id];
            delete sockmap[socket.id];
        }
    });
})


app.get('/', (req, res) => {
    res.json({
        message: '🌱🦄🌈✨👋🌎🌍🌏✨🌈🦄🌱'
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
