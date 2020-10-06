import express, { response } from "express";
import socketIo from "socket.io";
import http from "http";
import fetch from "node-fetch";
import cron from "node-cron"
import { getActivities, getItemFromManifest, searchPlayer, getCharacters, apiKey, getMainTheMainfest, activityDefinition, nightFalls } from "./exports/bungie_api_calls"
require('dotenv').config()

const people = {};

const port = process.env.PORT || 4001;
const app = express();
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
        return completed === 1 && completionReason === 0 ? 0 : 1;
    }
    return;

}

async function receiveData(people) {
    const profiles = await searchPlayers(people.name)
    const membershipType = profiles[0].membershipType;
    const membershipId = profiles[0].membershipId;
    const characters = await getCharacterss(membershipType, membershipId)
    let data = await Promise.all(
        characters.map(async i => {
            let pages2 = [];
            let hashes = await getActivitiesHashes(membershipType, membershipId, i, 0)
            // I am stuck on page two 
            if (hashes.length >= 250) {
                const fuck = await getActivitiesHashes(membershipType, membershipId, i, 1)
                pages2 = fuck;
            }
            return [...pages2, ...hashes];
        })
    )
    let newData = [].concat.apply([], [...data])
    console.log(newData.length, people.name)
    let result = await Promise.all(
        newData.map(async k => {
            let cool = await getData(k.activityDetails.directorActivityHash, k.values.completed.basic.value, k.values.completionReason.basic.value)
            return cool;
        })
    ).catch((err) => console.log(err))
    let endResult = result.filter(i => i === 0).length;
    console.log('number of the found elements: ' + endResult);
    io.to(people.id).emit('FromAPI', endResult);
}



io.on("connection", socket => {
    // Only when the clients send back a name
    let task = cron.schedule('* * * * *', () => {
        receiveData(people[socket.id])
    }, {
        scheduled: false
    });

    socket.on('init', (name) => {
        people[socket.id] = {
            name: name,
            id: socket.id
        }
        receiveData(people[socket.id])
        task.start();

    });

    socket.on('disconnect', () => {
        if (people[socket.id]) {
            console.log(people[socket.id], "has disconnected");
            task.stop();
            delete people[socket.id];
        }
    });
})

server.listen(port, () => console.log(`Listening on port ${port}`));
