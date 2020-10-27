import React, { useState, useEffect, useRef } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import useSocket from 'use-socket.io-client';
import BallScrene from "../BallScene/BallScrene"
import "./login.css"

const twitch = window.Twitch.ext;

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');
    const [room, setRoom] = useState('');
    const [user, setUserInput] = useState('');
    const [userType, setUserType] = useState('');
    const [loggedIn, setLoggedIn] = useState('');


    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        socket.on('FromAPI', (data) => {
            setResults(data)
        });
    })

    const handleSubmit = async e => {
        e.preventDefault();
        if (!nameInput) {
            return alert("Name can't be empty");
        }
        await twitch.onAuthorized((auth) => {
            setId(auth.channelId);
            setNameInput(nameInput)
            socket.emit("join", nameInput, auth.channelId, true);
        })
    };

    const connectToRoom = async e => {
        e.preventDefault();
        await twitch.onAuthorized((auth) => {
            setId(auth.channelId);
            setUserInput(auth.userId)
            socket.emit("join", auth.userId, auth.channelId, false);
        })
    }

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
                        <div className="submit-button">
                            <button type="submit" onClick={() => console.log("hey")}>Submit</button>
                        </div>
                    </form>
                </div> : <form onSubmit={event => connectToRoom(event)}>
                        <div className="submit-button">
                            <button type="submit" onClick={() => console.log("hey")}>Start</button>
                        </div>
                    </form>}

            </>
        )
};