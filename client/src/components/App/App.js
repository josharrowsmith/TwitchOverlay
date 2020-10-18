import React, { useState, useEffect, useRef } from 'react';
import useSocket from 'use-socket.io-client';
import Matter from "matter-js"
import Background from './background.png'
import './App.css'

const STATIC_DENSITY = 15
const PARTICLE_SIZE = 30
const PARTICLE_BOUNCYNESS = 0.9


export const random = (min, max) => Math.random() * (max - min) + min;

export default () => {
    // Server stuff
    const [id, setId] = useState('');
    const [nameInput, setNameInput] = useState('');
    const [results, setResults] = useState('');

    // Mater Stuff
    const boxRef = useRef(null)
    const canvasRef = useRef(null)
    const [constraints, setContraints] = useState()
    const [scene, setScene] = useState()
    const [someStateValue, setSomeStateValue] = useState(false)

    const handleResize = () => {
        setContraints(boxRef.current.getBoundingClientRect())
    }

    const handleClick = () => {
        setSomeStateValue(!someStateValue)
    }


    useEffect(() => {
        let Engine = Matter.Engine
        let Render = Matter.Render
        let World = Matter.World
        let Bodies = Matter.Bodies
        let engine = Engine.create({})
        let render = Render.create({
            element: boxRef.current,
            engine: engine,
            canvas: canvasRef.current,
            options: {
                background: "transparent",
                wireframes: false,
            },
        })
        const floor = Bodies.rectangle(0, 0, 0, STATIC_DENSITY, {
            isStatic: true,
            render: {
                fillStyle: "blue",
            },
        })
        World.add(engine.world, [floor])
        Engine.run(engine)
        Render.run(render)
        setContraints(boxRef.current.getBoundingClientRect())
        setScene(render)
        window.addEventListener("resize", handleResize)
    }, [])


    useEffect(() => {
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])


    useEffect(() => {
        if (constraints) {
            let { width, height } = constraints
            // Dynamically update canvas and bounds
            scene.bounds.max.x = width
            scene.bounds.max.y = height
            scene.options.width = width
            scene.options.height = height
            scene.canvas.width = width
            scene.canvas.height = height
            // Dynamically update floor
            const floor = scene.engine.world.bodies[0]
            Matter.Body.setPosition(floor, {
                x: width / 2,
                y: height + STATIC_DENSITY / 2,
            })
            Matter.Body.setVertices(floor, [
                { x: 0, y: height },
                { x: width, y: height },
                { x: width, y: height + STATIC_DENSITY },
                { x: 0, y: height + STATIC_DENSITY },
            ])
        }
    }, [scene, constraints])


    useEffect(() => {
        // Add a new "ball" everytime `someStateValue` changes
        if (scene) {
            let { width, height } = constraints

            const ball = Matter.Bodies.circle(width / 2, height / 2, PARTICLE_SIZE, {
                restitution: PARTICLE_BOUNCYNESS,
            })
            Matter.World.add(
                scene.engine.world,
                ball
            )
            Matter.Body.applyForce(ball, ball.position, {
                x: random(-0.2, 0.2),
                y: random(-0.2, 0.2)
            })

        }
    }, [someStateValue])

    // Server stuff
    const [socket] = useSocket('https://grandmasternightfalls.herokuapp.com/');
    socket.connect();

    useEffect(() => {
        socket.on('FromAPI', (data) => {
            setResults(data)
        });
    })


    const applyForce = () => {
        Matter.Composite.allBodies(scene.engine.world).forEach(ball => {
            Matter.Body.applyForce(ball, ball.position, {
                x: 0,
                y: -0.2,
            });
        });

    }

    const handleSubmit = e => {
        e.preventDefault();
        if (!nameInput) {
            return alert("Name can't be empty");
        }
        setId(nameInput);
    };

    return (
        <div className="App">
            <button onClick={handleClick} className="Engram" style={{
                background: `url(${Background})`, backgroundPosition: "center"
            }}>
                <h2>GM CLEARS</h2>
                <h2>{results}</h2>
            </button>
            <div
                ref={boxRef}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                }}
            >
                <canvas ref={canvasRef} />
            </div>
            <button onClick={applyForce}>Go up</button>
        </div>
    )
};