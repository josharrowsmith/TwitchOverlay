const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const axios = require("axios");
const port = process.env.PORT || 4001;
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const cron = require('node-cron');
const fetch = require('node-fetch');

const getApiAndEmit = async (socket, data) => {
    socket.emit("FromAPI", data);
};

async function getStarWars(i) {
    const request = await fetch(`https://swapi.dev/api/people/${i}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })
    const resData = await request.json();
    const result = await resData.name;
    return result;
}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

io.on("connection", socket => {
    cron.schedule(`* * * * *`, async () => {
        console.log("ive run")
        let i = getRandomInt(50);
        console.log(i)
        const data = await getStarWars(i)
        console.log(data)
        getApiAndEmit(socket, data)
    })
})

server.listen(port, () => console.log(`Listening on port ${port}`));
