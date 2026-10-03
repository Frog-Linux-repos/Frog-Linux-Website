import { Composite, Engine, Render, Runner } from "matter-js";
import { generateFreddyLilypad, generateLilypads } from "./lilypads";
import { generateBorders } from "./borders";

function stop(engine: Engine) {
  // Clear bodies
  Composite.clear(engine.world, false, true);
}

function run(engine: Engine, render: Render) {
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

  // Add bodies
  Composite.add(engine.world, generateLilypads(bounds));
  Composite.add(engine.world, generateFreddyLilypad(bounds));
  Composite.add(engine.world, generateBorders(bounds));

  // Set size
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
    if (resizeTimeout === undefined) {
      stop(engine);
    } else {
      clearTimeout(resizeTimeout);
    }

    resizeTimeout = setTimeout(() => {
      resizeTimeout = undefined;
      run(engine, render);
    }, 100);
  });

  run(engine, render);
}
