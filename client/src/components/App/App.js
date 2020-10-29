import React, { useState, useEffect, useRef } from 'react';
import { setToken, isLoggedIn, getStream } from "../../util"
import { useImmer } from 'use-immer';
// this is fucked but i can't be bother to fix it yet
import 'regenerator-runtime/runtime';
import useSocket from 'use-socket.io-client';
import BallScrene from "../BallScene/BallScrene"
import "./login.css"

const twitch = window.Twitch.ext;

const Messages = props => props.data.map(m => m[0] !== '' ? (<li><strong>{m[0]}</strong> : <div className="innermsg">{m[1]}</div></li>) : (<li className="update">{m[1]}</li>));

const Online = props => props.data.map(m => <li id={m[0]}>{m[1]}</li>)

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');
    const [room, setRoom] = useState('');
    const [user, setUserInput] = useState('');
    const [userType, setUserType] = useState('');
    const [loggedIn, setLoggedIn] = useState('');

    const [messages, setMessages] = useImmer([]);
    const [online, setOnline] = useImmer([]);


    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        socket.on('update', message => setMessages(draft => {
            draft.push(['', message]);
        }))

        socket.on('FromAPI', (data) => {
            setResults(data)
        });

        socket.on('people-list', people => {
            let newState = [];
            for (let person in people) {
                newState.push([people[person].id, people[person].name]);
            }
            setOnline(draft => { draft.push(...newState) });
            console.log(online)
        });

        socket.on('add-person', (name, id) => {
            setOnline(draft => {
                draft.push([id, name])
            })
        })

        socket.on('remove-person', id => {
            setOnline(draft => draft.filter(m => m[0] !== id))
        })
    }, []);

    const handleSubmit = async e => {
        e.preventDefault();
        if (!nameInput) {
            return alert("Name can't be empty");
        }
        await twitch.onAuthorized((auth) => {
            setId(auth.channelId);
            setNameInput(nameInput)
            socket.emit("join", nameInput, auth.channelId, nameInput);
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
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div> : <form onSubmit={event => connectToRoom(event)}>
                        <div className="submit-button">
                            <button type="submit">Start</button>
                        </div>
                    </form>}

            </>
        )
};