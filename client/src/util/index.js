import jwt from "jsonwebtoken";

export const STATIC_DENSITY = 30
export const PARTICLE_SIZE = 30
export const PARTICLE_BOUNCYNESS = 0.9
export const angle = 300;
export const spread = 20;
export const velocity = 30;
export const angularVelocity = 0.5;
export const volatility = 0.75;
export const airFriction = 0.02;


export const random = (min, max) => Math.random() * (max - min) + min;

export const convertDegreesToRadians = angle => (angle * Math.PI) / 180;

export const sample = arr => arr[Math.floor(Math.random() * arr.length)];

export const normalize = (
    number,
    currentScaleMin,
    currentScaleMax,
    newScaleMin = 0,
    newScaleMax = 1
) => {
    // FIrst, normalize the value between 0 and 1.
    const standardNormalization =
        (number - currentScaleMin) / (currentScaleMax - currentScaleMin);

    // Next, transpose that value to our desired scale.
    return (newScaleMax - newScaleMin) * standardNormalization + newScaleMin;
};

export const setToken = (token, userId) => {
    let isMod = false
    let role = ""
    let user_id = ""
    try {
        let decoded = jwt.decode(token)

        if (decoded.role === 'broadcaster' || decoded.role === 'moderator') {
            isMod = true
        }

        user_id = decoded.user_id
        role = decoded.role
    } catch (e) {
        token = ''
        opaque_id = ''
    }

    return role;

}

export const getStream = (auth, user) => {
    console.log(user)
    fetch(`https://api.twitch.tv/helix/streams`, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user}`,
        'Client-ID': auth,
    })
        .then((res) => res.json())
        .then((res) => {
            console.log(res)
        })
        .catch((err) => console.error('Something broke.', err));
}

export const isLoggedIn = (opaque_id) => {
    return opaque_id[0] === 'U' ? true : false
}
