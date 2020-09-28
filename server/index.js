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
    const nightFalls = [245243710, 3354105309, 3849697860, 2168858559, 1302909043, 3919254032, 3883876601, 13813394, 766116576, 3455414851, 2533203708, 1002842615, 2694576755, 3200108048, 68611398, 54961125, 3726640183, 1358381372, 380956401, 3597372938, 135872558, 3879949581, 2023667984, 2660931443]
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
    const resData = await request.json();
    const currentHash = await resData.Response == null ? 0 : resData.Response.hash;
    const found = nightFalls.includes(currentHash);
    return found && completed === 1 && completionReason === 0 ? 0 : 1;
} 1


io.on("connection", socket => {
    setTimeout(async () => {
        console.log("im running")
        const name = "SpeakableAuto"
        const profiles = await searchPlayers(name)
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
        // How cool is that n number of arrays without push 
        let newData = [].concat.apply([], [...data])
        console.log(newData.length)
        let result = await Promise.all(
            newData.map(async k => {
                let cool = await getData(k.activityDetails.directorActivityHash, k.values.completed.basic.value, k.values.completionReason.basic.value)
                return cool;
            })
        ).catch((err) => console.log(err))
        let endResult = result.filter(i => i === 0).length;
        console.log('number of the found elements: ' + endResult);
        getApiAndEmit(socket, "yes")
    }, 3000);
})

server.listen(port, () => console.log(`Listening on port ${port}`));
