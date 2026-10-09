import { Bodies, Body, Bounds, Common, Composite, Events, Render, Vector, Vertices } from "matter-js";
import decomp from "poly-decomp";
import outlines from "./outlines.json";

Common.setDecomp(decomp);

const LILYPAD_TEXTURE_COUNT = 4;

function makeLilypad(
  position: Vector,
  radius: number,
  force: Vector,
  texture: string,
  textureSize: number = 512,
): Body {
  const textureScale = (2 * radius) / textureSize;

  const name = texture.split("/").at(-1)!.replace(".svg", "") as keyof typeof outlines;
  const vertices = outlines[name].map(([x, y]) => ({
    x: (x - textureSize / 2) * textureScale,
    y: (y - textureSize / 2) * textureScale,
  }));
  const centre = Vertices.centre(vertices);
  const lilypad = Bodies.fromVertices(
    position.x + centre.x,
    position.y + centre.y,
    [vertices],
    { frictionAir: 0.04 },
    true,
    0.01,
    0,
  );
  Body.setCentre(lilypad, position);
  lilypad.plugin.radius = Math.max(radius, ...vertices.map((vertex) => Vector.magnitude(vertex)));

  // Matter renders compound parts individually; draw the texture on one part.
  const parts = lilypad.parts.length > 1 ? lilypad.parts.slice(1) : lilypad.parts;
  for (const part of parts) part.render.visible = false;
  const part = parts[0];
  part.render.visible = true;
  const sprite = {
    texture,
    xScale: textureScale,
    yScale: textureScale,
    xOffset: 0.5 + (part.position.x - position.x) / (2 * radius),
    yOffset: 0.5 + (part.position.y - position.y) / (2 * radius),
  };
  part.render.sprite = sprite;
  lilypad.render.sprite = {
    texture,
    xScale: textureScale,
    yScale: textureScale,
  };
  if (parts.length === 1) Object.assign(lilypad.render.sprite, { xOffset: 0.5, yOffset: 0.5 });
  Body.applyForce(lilypad, lilypad.position, force);

  return lilypad;
}

export function generateLilypads(bounds: Bounds, occupied: readonly Body[] = []): Body[] {
  const w = bounds.max.x - bounds.min.x,
    h = bounds.max.y - bounds.min.y;

  const lilypads: Body[] = [];
  const lilypadCount = 3 + Math.ceil(Math.random() * 4);
  for (let i = 0; i < lilypadCount; i++) {
    const radius = Math.min(
      (0.5 + 0.5 * Math.random()) * Math.sqrt(w * h) * 0.125,
      Math.min(w, h) * 0.4,
    ),
      force = {
        x: (Math.random() - 0.5) * 0.5,
        y: (Math.random() - 0.5) * 0.5,
      },
      texture = `/images/lilypads/${Math.ceil(Math.random() * LILYPAD_TEXTURE_COUNT)}.svg`;

    const pad = makeLilypad({ x: 0, y: 0 }, radius, force, texture);
    const clearance: number = pad.plugin.radius;
    if (2 * clearance > Math.min(w, h)) continue;

    // Leave out a pad if the viewport is too crowded to place it safely.
    for (let attempt = 0; attempt < 100; attempt++) {
      const point = {
        x: bounds.min.x + clearance + Math.random() * (w - 2 * clearance),
        y: bounds.min.y + clearance + Math.random() * (h - 2 * clearance),
      };
      if ([...occupied, ...lilypads].some((other) =>
        Vector.magnitude(Vector.sub(point, other.position)) <
          clearance + other.plugin.radius + 8,
      )) continue;
      Body.setPosition(pad, point);
      lilypads.push(pad);
      break;
    }
  }

  return lilypads;
}

export function generateFreddyLilypad(bounds: Bounds): Body {
  const w = bounds.max.x - bounds.min.x,
    h = bounds.max.y - bounds.min.y;

  const radius = Math.min(
      (0.75 + 0.25 * Math.random()) * Math.sqrt(w * h) * 0.215,
      Math.min(w, h) * 0.4,
    ),
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
  const clearance: number = lilypad.plugin.radius;
  Body.setPosition(lilypad, {
    x: Math.max(bounds.min.x + clearance, Math.min(bounds.max.x - clearance, position.x)),
    y: Math.max(bounds.min.y + clearance, Math.min(bounds.max.y - clearance, position.y)),
  });

  return lilypad;
}

export function syncLilypadSprites(render: Render) {
  Events.on(render, "beforeRender", () => {
    for (const body of Composite.allBodies(render.engine.world)) {
      if (!body.plugin.radius) continue;
      // Matter rotates compound vertices, but leaves each part's angle unchanged.
      for (const part of body.parts.slice(1)) part.angle = body.angle;
    }
  });
}
