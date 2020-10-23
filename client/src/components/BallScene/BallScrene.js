import React, { useState, useEffect, useRef } from 'react';
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
import DEFAULT_SPRITES from './default-sprites';
import Background from "../../assets/images/background.png";
import "./App.css"

export default function BallScrene({ results }) {
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
        setContraints(boxRef.current.getBoundingClientRect())
        setScene(render)
        window.addEventListener("resize", handleResize)
    }, [])

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
                    100 + 125,
                    height - 150,
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
    }, [results, someStateValue])

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
        </div>
    )
};