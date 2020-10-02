import React, { useState, useEffect } from 'react';
import useSocket from 'use-socket.io-client';

export default () => {
  const [id, setId] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [results, setResults] = useState('');

  const [socket] = useSocket('http://127.0.0.1:5000');
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
    <section style={{ display: 'flex', flexDirection: 'row', justifyContent: "center" }} >
      <h1>{results}</h1>
    </section>
  ) : (
      <div style={{ textAlign: 'center', margin: '30vh auto', width: '70%' }}>
        <form onSubmit={event => handleSubmit(event)}>
          <input id="name" onChange={e => setNameInput(e.target.value.trim())} required placeholder="What is your name .." /><br />
          <button type="submit" onClick={() => socket.emit("init", nameInput)}>Submit</button>
        </form>
      </div>
    );
};

