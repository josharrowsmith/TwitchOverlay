import express from "express";
import socketIo from "socket.io";
import http from "http";
import cron from "node-cron";
import fetch from "node-fetch";
import { getActivities, getItemFromManifest, searchPlayer, apiKey } from "./exports/bungie_api_calls"
require('dotenv').config()

const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server)

const getApiAndEmit = async (socket, data) => {
    socket.emit("FromAPI", data);
};

async function searchPlayers(name) {
    const array = [];
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
        array.push({ key: i.membershipType, ID: i.membershipId})
    })
    console.log(array)
}

async function getCharacters(i) {
    const request = await fetch(getActivities(), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseObject = await resData.Response.activities;
    const responseArray = await Object.values(responseObject);
    return responseArray;
}

async function getActivitiesHashes(i) {
    const request = await fetch(getActivities(), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseObject = await resData.Response.activities;
    const responseArray = await Object.values(responseObject);
    return responseArray;
}

async function getData(hash) {
    const request = await fetch(getItemFromManifest(hash), {
        method: 'GET',
        headers: {
            "X-API-Key": apiKey,
            "Content-Type": "application/json"
        }
    })
    const resData = await request.json();
    const responseTwo = await resData.Response.displayProperties.description;
    return responseTwo;
}

io.on("connection", socket => {
    cron.schedule(`* * * * *`, async () => {
        // const data = await getActivitiesHashes();
        // const result = await data.map(async i => {
        //     const name = await getData(i.activityDetails.directorActivityHash);
        //     console.log(name)
        // })
        const name = ""
        const data = await searchPlayers(name)
        getApiAndEmit(socket, data)
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`));
