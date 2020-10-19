import React, { useState, useEffect, useRef } from 'react';
import useSocket from 'use-socket.io-client';
import Matter from "matter-js"
import {
    STATIC_DENSITY,
    airFriction,
    angle,
    spread,
    velocity,
    angularVelocity,
    volatility,
    random,
    convertDegreesToRadians,
    normalize,
    sample
} from "../../util/index"
import LoginForm from "./login"
import DEFAULT_SPRITES from './default-sprites';
import Background from "../../assets/images/background.png

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

    // Resize the window 
    const handleResize = () => {
        setContraints(boxRef.current.getBoundingClientRect())
    }

    // Main function 
    const handleClick = () => {
        setSomeStateValue(!someStateValue)
        console.log("yes")
    }

    //This setup the the World 
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
        if (id) {
            setContraints(boxRef.current.getBoundingClientRect())
            setScene(render)
            window.addEventListener("resize", handleResize)
        }
    }, [id])

    // Window resize
    useEffect(() => {
        return () => {
            window.removeEventListener("resize", handleResize)
        }
    }, [])

    // Setup the scene ie walls 
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

    // Add the balls 
    useEffect(() => {
        // Add a new "ball" everytime `someStateValue` changes
        if (scene) {
            let { width, height } = constraints
            for (let i = 0; i < 5; i++) {
                const sprite = sample(DEFAULT_SPRITES);

                const config = {
                    frictionAir: airFriction * sprite.airFrictionMultiplier,
                    restitution: 0.9,
                    render: {
                        sprite: {
                            texture: sprite.src,
                        },
                    },
                };

                const ball = Matter.Bodies.circle(
                    width / 2,
                    height / 2,
                    sprite.size,
                    config
                );

                const particleAngle = random(angle - spread, angle + spread);

                const velocityMultiple = Math.random();
                const particleVelocity = normalize(
                    velocityMultiple,
                    0,
                    1,
                    velocity - velocity * volatility,
                    velocity + velocity * volatility
                );
                const particleAngularVelocity = normalize(
                    velocityMultiple,
                    0,
                    1,
                    angularVelocity - angularVelocity * volatility,
                    angularVelocity + angularVelocity * volatility
                );

                const particleAngleInRads = convertDegreesToRadians(particleAngle);

                const x = Math.cos(particleAngleInRads) * particleVelocity;
                const y = Math.sin(particleAngleInRads) * particleVelocity;

                Matter.Body.setVelocity(ball, { x, y });
                Matter.Body.setAngularVelocity(ball, particleAngularVelocity);

                // Removes the balls 
                setTimeout(() => {
                    Matter.World.remove(scene.engine.world, ball);
                }, 10000);

                // Main Add function
                Matter.World.add(
                    scene.engine.world,
                    ball
                )
            }

        }
    }, [someStateValue])
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
        )
};