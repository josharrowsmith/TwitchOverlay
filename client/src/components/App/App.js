import React, { useState, useEffect, useRef } from 'react';
import useSocket from 'use-socket.io-client';
import BallScrene from "../BallScene/BallScrene"
import "./login.css"

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');


    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        socket.on('FromAPI', (data) => {
            setResults(data)
        });
    })

    const handleSubmit = e => {
        e.preventDefault();
        if (!nameInput) {
            return alert("Name can't be empty");
        }
        setId(nameInput);
    };


    return id ? (
        <BallScrene results={results} />
    ) : (
            <div className="login">
                <form onSubmit={event => handleSubmit(event)}>
                    <h1>GrandMaster Checker</h1>
                    <input id="name" onChange={e => setNameInput(e.target.value.trim())} required placeholder="What your username.." /><br />
                    <div className="submit-button">
                        <button type="submit" onClick={() => socket.emit("init", nameInput)}>Submit</button>
                    </div>
                </form>
            </div>
        )
};