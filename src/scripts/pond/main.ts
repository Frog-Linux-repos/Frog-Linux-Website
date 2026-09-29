import { Composite, Engine, Render, Runner } from "matter-js";
import { generateFreddyLilypad, generateLilypads } from "./lilypads";
import { generateBorders } from "./borders";

function startPond(composite: Composite, render: Render) {
  const w = window.innerWidth,
    h = window.innerHeight;
  const bounds = {
    min: {
      x: -0.5 * w,
      y: -0.5 * h,
    },
    max: {
      x: 0.5 * w,
      y: 0.5 * h,
    },
  };

  // Bodies
  Composite.clear(composite, false, true);
  Composite.add(composite, generateLilypads(bounds));
  Composite.add(composite, generateFreddyLilypad(bounds));
  Composite.add(composite, generateBorders(bounds));

  // Size
  Render.setSize(render, w, h);
  Render.lookAt(render, bounds, { x: 0, y: 0 }, true);
}

export function makePond(canvas: HTMLCanvasElement) {
  // Engine
  const engine = Engine.create({
    gravity: { x: 0, y: 0 },
  });

  // Render
  const render = Render.create({
    canvas: canvas,
    engine: engine,
    options: {
      wireframes: false,
      background: "transparent",
    },
  });
  Render.run(render);

  // Runner
  const runner = Runner.create();
  Runner.run(runner, engine);

  let resizeTimeout: number | undefined = undefined;

  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => startPond(engine.world, render), 100);
  });

  startPond(engine.world, render);
}
