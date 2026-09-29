import { Body, Bodies, Bounds } from "matter-js";

const BORDER_DEPTH = 20;

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
