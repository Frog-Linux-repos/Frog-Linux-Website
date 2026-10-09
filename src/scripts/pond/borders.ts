import { Body, Bodies, Bounds, Composite, Engine, Events } from "matter-js";

const BORDER_DEPTH = 256;

function makeBorder(x: number, y: number, width: number, height: number): Body {
  const border = Bodies.rectangle(x, y, width, height, {
    isStatic: true,
    render: {
      fillStyle: "transparent",
    },
  });

  return border;
}

export function generateBorders(bounds: Bounds): Body[] {
  const w = bounds.max.x - bounds.min.x,
    h = bounds.max.y - bounds.min.y;

  const borders: Body[] = [
    makeBorder(0.5 * (w + BORDER_DEPTH), 0, BORDER_DEPTH, h + 2 * BORDER_DEPTH),
    makeBorder(
      0,
      -0.5 * (h + BORDER_DEPTH),
      w + 2 * BORDER_DEPTH,
      BORDER_DEPTH,
    ),
    makeBorder(
      -0.5 * (w + BORDER_DEPTH),
      0,
      BORDER_DEPTH,
      h + 2 * BORDER_DEPTH,
    ),
    makeBorder(0, 0.5 * (h + BORDER_DEPTH), w + 2 * BORDER_DEPTH, BORDER_DEPTH),
  ];

  return borders;
}

export function containLilypads(engine: Engine, bounds: Bounds) {
  // Recover escaped pads before solving contacts, never move them after collisions.
  Events.on(engine, "beforeUpdate", () => {
    for (const body of Composite.allBodies(engine.world)) {
      if (body.isStatic || !body.plugin.radius) continue;
      if (
        body.bounds.max.x >= bounds.min.x && body.bounds.min.x <= bounds.max.x &&
        body.bounds.max.y >= bounds.min.y && body.bounds.min.y <= bounds.max.y
      ) continue;
      const radius = body.plugin.radius;
      const x = Math.max(bounds.min.x + radius,
        Math.min(bounds.max.x - radius, body.position.x));
      const y = Math.max(bounds.min.y + radius,
        Math.min(bounds.max.y - radius, body.position.y));
      if (x === body.position.x && y === body.position.y) continue;
      const velocity = { ...body.velocity };
      if ((body.position.x - x) * velocity.x > 0) velocity.x = 0;
      if ((body.position.y - y) * velocity.y > 0) velocity.y = 0;
      Body.setPosition(body, { x, y });
      Body.setVelocity(body, velocity);
    }
  });
}
