import React, { useState, useEffect } from 'react';
import useSocket from 'use-socket.io-client';
import './fireworks.css';

export default () => {
  const [id, setId] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [results, setResults] = useState('');
  const [amount, setAmount] = useState([0]);
  const MAX_AMOUNT = 20;
  const COLOR_RANGE = 360;

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

  React.useEffect(() => {
    if (amount[0]) {
      setTimeout(() => {
        setAmount(amount.map(() => 0));
      }, 5000);
    } else {
      setTimeout(() => {
        setAmount(
          amount.map(
            () => Math.round(Math.random() * MAX_AMOUNT / 2) + MAX_AMOUNT / 2
          )
        );
      }, 3000);
    }
  });

  const random = num => {
    return Math.random() * num;
  };

  const makeParticle = (num, index) => {
    const particles = [];
    for (let i = 0; i < num; i++) {
      particles.push(
        <div
          key={"part" + i + index}
          className="particle"
          style={{
            transform: `scale(${random(0.5) + 0.5}) rotate(${random(180)}deg)`,
            filter: `hue-rotate(${random(30)}deg) contrast(2)`
          }}
        />
      );
    }
    return particles;
  };




  return id ? (
    <section style={{ display: 'flex', flexDirection: 'row', justifyContent: "center" }} >
      <h1>{results}</h1>
    </section>
  ) : (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center"}}>
        <form onSubmit={event => handleSubmit(event)}>
          <input id="name" onChange={e => setNameInput(e.target.value.trim())} required placeholder="What is your name .." /><br />
          <button type="submit" onClick={() => socket.emit("init", nameInput)}>Submit</button>
          <div style={{display: "flex", justifyContent: "center"}}>
            {amount.map((item, index) => {
              return item ? (
                <div
                  key={`particleBox${index}`}
                  className="particleBox"
                  style={{
                    filter: `hue-rotate(${random(COLOR_RANGE)}deg) contrast(2)`
                  }}
                >
                  {makeParticle(item, index)}
                </div>
              ) : null;
            })}
          </div>
        </form>
      </div>
    );
};

