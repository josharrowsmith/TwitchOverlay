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