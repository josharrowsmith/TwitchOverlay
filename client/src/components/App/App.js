import React, { useState, useEffect } from 'react';
import useSocket from 'use-socket.io-client';

export default () => {
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');

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
        <div style={{ width: "150px", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "row" }}>
            <h1>{results}</h1>
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