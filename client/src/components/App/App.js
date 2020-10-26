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
        const id = await twitch.onAuthorized((auth) => {
            twitch.rig.log(auth.channelId);
        })
        setId("73628599");
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
                        <div className="submit-button">
                            <button type="submit" onClick={() => socket.emit("init", nameInput, id)}>Submit</button>
                        </div>
                    </form>
                </div> : <></>}

            </>
        )
};