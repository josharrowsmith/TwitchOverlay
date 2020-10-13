import React, { useState, useEffect, useRef } from 'react';
import useSocket from 'use-socket.io-client';
import Confetti from 'react-confetti'
import Background from './background.png'
import './App.css'

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');
    const prevCountRef = useRef();

    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        prevCountRef.current = results;
    });

    const prevCount = prevCountRef.current;

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
        <div className="App">
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                run={results !== prevCount ? true : false}
                recycle={false}
                numberOfPieces={200}
                confettiSource={{
                    w: 10,
                    h: 10,
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                }}
            />
            <div className="Engram" style={{
                background: `url(${Background})`, backgroundPosition: "center"
            }}>
                <h2>GM CLEARS</h2>
                <h2>{results}</h2>
            </div>
        </div>
    ) : (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <form style={{ display: "flex", justifyItems: "center", flexDirection: "column" }} onSubmit={event => handleSubmit(event)}>
                    <input id="name" onChange={e => setNameInput(e.target.value.trim())} required placeholder="What is your name .." /><br />
                    <button style={{ width: "100px", alignSelf: "center" }} type="submit" onClick={() => socket.emit("init", nameInput)}>Submit</button>
                </form>
            </div>
        );
};