import React, { useState, useEffect, useRef } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import useSocket from 'use-socket.io-client';
import BallScrene from "../BallScene/BallScrene"
import "./login.css"
import { async } from 'regenerator-runtime';

const twitch = window.Twitch.ext;

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');
    const [room, setRoom] = useState('');
    const [userType, setUserType] = useState('');
    const [loggedIn, setLoggedIn] = useState('');


    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        socket.on('FromAPI', (data) => {
            twitch.rig.log(data)
        });
    })

    const handleSubmit = async e => {
        e.preventDefault();
        if (!nameInput) {
            return alert("Name can't be empty");
        }
        const id = twitch.onAuthorized((auth) => {
            twitch.rig.log(auth.channelId);
        })
        twitch.rig.log("the id is", id)

    };

    // Twitch Tv check if authorized
    useEffect(() => {
        async function getToken() {
            twitch.onAuthorized((auth) => {
                // setLoggedIn(loggedIn(auth.userId))
                setUserType(setToken(auth.token, auth.userId))
                // getStream(auth.userId, auth.token)
                // twitch.rig.log(auth.channelId)
            })
        }
        getToken();
    }, []);



    return id ? (
        <BallScrene results={results} />
    ) : (
            <>
                {userType == 'broadcaster' ? <div className="login">
                    <form onSubmit={event => handleSubmit(event)}>
                        <h1>GrandMaster Checker</h1>
                        <input id="name" onChange={e => setNameInput(e.target.value.trim())} required placeholder="What your username.." /><br />
                        <input id="room" onChange={e => setRoom(e.target.value.trim())} placeholder="What is your room .." /><br />
                        <div className="submit-button">
                            <button type="submit" onClick={() => socket.emit("init", nameInput, id)}>Submit</button>
                        </div>
                    </form>
                </div> : <></>}

            </>
        )
};