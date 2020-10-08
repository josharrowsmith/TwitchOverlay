import React, { useState, useEffect } from 'react';
import useSocket from 'use-socket.io-client';
import Background from './background.png'
import './App.css'

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

    return (
        <div className="App">
            <div className="Engram" style={{
                background: `url(${Background})`, backgroundPosition: "center"
            }}>
                <h2>GM CLEARS</h2>
                <h2>1</h2>
            </div>
        </div>
    )
};