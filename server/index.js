import express, { response } from "express";
import socketIo from "socket.io";
import http from "http";
import cron from "node-cron";
import fetch from "node-fetch";
import { getActivities, getItemFromManifest, searchPlayer, getCharacters, apiKey } from "./exports/bungie_api_calls"
require('dotenv').config()

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server)

const getApiAndEmit = async (socket, data) => {
    socket.emit("FromAPI", data);
};

async function searchPlayers(name) {
    console.log(name)
    const profiles = [];
    const request = await fetch(searchPlayer(name), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseArray = await Object.values(resData.Response);
    const result = await responseArray.map(async i => {
        let obj = { "key": i.membershipType, "ID": i.membershipId }
        profiles.push([obj])
    })
    return profiles;
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
    const response = await resData.Response ? resData.Response.profile.data.characterIds : null;
    return response;
}

async function getActivitiesHashes(membershipType, membershipId, character) {
    const request = await fetch(getActivities(membershipType, membershipId, character), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseObject = await resData.Response ? resData.Response.activities : {};
    const responseArray = await Object.values(responseObject);
    return responseArray;
}

async function getData(hash) {
    const nightFalls = [245243710, 3354105309, 3849697860, 2168858559, 1302909043, 3919254032, 3883876601, 13813394, 766116576, 3455414851, 2533203708, 1002842615, 2694576755, 3200108048, 68611398, 54961125, 3726640183, 1358381372, 380956401, 3597372938, 135872558, 3879949581, 2023667984, 2660931443]
    const request = await fetch(getItemFromManifest(hash), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const currentHash = await resData.Response.hash;
    const found = nightFalls.includes(currentHash);
    return found;
}

io.on("connection", socket => {
    cron.schedule(`* * * * *`, async () => {
        const name = "speakableauto"
        const profiles = await searchPlayers(name)
        const temp = await profiles.map(async (k, i) => {
            let data = Object.values(...k);
            const characterId = await getCharacterss(data[0], data[1]);
        })

        getApiAndEmit(socket, name)
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`));
