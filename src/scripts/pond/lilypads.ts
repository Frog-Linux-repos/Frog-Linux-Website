import { Bodies, Body, Bounds, Vector } from "matter-js";

const LILYPAD_TEXTURE_COUNT = 4;

function makeLilypad(
  position: Vector,
  radius: number,
  force: Vector,
  texture: string,
  textureSize: number = 512,
): Body {
  const textureScale = (2 * radius) / textureSize;

  const lilypad = Bodies.circle(position.x, position.y, radius, {
    render: {
      sprite: {
        texture: texture,
        xScale: textureScale,
        yScale: textureScale,
      },
    },
    frictionAir: 0.001,
  });
  Body.applyForce(lilypad, { x: 0, y: 0 }, force);

  return lilypad;
}

export function generateLilypads(bounds: Bounds): Body[] {
  const w = bounds.max.x - bounds.min.x,
    h = bounds.max.y - bounds.min.y;

  const lilypads: Body[] = [];
  const lilypadCount = 3 + Math.ceil(Math.random() * 4);
  for (let i = 0; i < lilypadCount; i++) {
    const radius = (0.5 + 0.5 * Math.random()) * Math.sqrt(w * h) * 0.125,
      position = {
        x: (Math.random() - 0.5) * (w - 2 * radius),
        y: (Math.random() - 0.5) * (h - 2 * radius),
      },
      force = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      },
      texture = `/images/lilypads/${Math.ceil(Math.random() * LILYPAD_TEXTURE_COUNT)}.svg`;

    lilypads.push(makeLilypad(position, radius, force, texture));
  }

  return lilypads;
}

export function generateFreddyLilypad(bounds: Bounds): Body {
  const w = bounds.max.x - bounds.min.x,
    h = bounds.max.y - bounds.min.y;

  const radius = (0.75 + 0.25 * Math.random()) * Math.sqrt(w * h) * 0.215,
    position = {
      x: 0.5 * w - radius - 64,
      y: -0.5 * h + radius + 64,
    },
    force = {
      x: (Math.random() - 0.5) * 0.2,
      y: (Math.random() - 0.5) * 0.2,
    },
    texture = `/images/lilypads/freddy.svg`;

  const lilypad = makeLilypad(position, radius, force, texture);

  return lilypad;
}
