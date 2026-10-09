import { Body, Composite, Engine, Events, Render, Vector } from "matter-js";

export function enableDragging(engine: Engine, render: Render) {
  const canDrag = window.matchMedia("(hover: hover) and (pointer: fine)");
  const canvas = render.canvas;
  const masks = new Map<string, ImageData>();
  let draggedBody: Body | undefined;
  let pointerId: number | undefined;
  let target: Vector | undefined;
  let grabOffset: Vector | undefined;

  function position(event: PointerEvent): Vector {
    const rect = canvas.getBoundingClientRect();
    return {
      x:
        render.bounds.min.x +
        ((event.clientX - rect.left) / rect.width) *
          (render.bounds.max.x - render.bounds.min.x),
      y:
        render.bounds.min.y +
        ((event.clientY - rect.top) / rect.height) *
          (render.bounds.max.y - render.bounds.min.y),
    };
  }

  function hitsPad(body: Body, point: Vector): boolean {
    const sprite = body.render.sprite;
    if (body.isStatic || !sprite) return false;
    const texture: HTMLImageElement | undefined = render.textures[sprite.texture];
    if (!texture?.complete || !texture.naturalWidth) return false;

    let mask = masks.get(sprite.texture);
    if (!mask) {
      const surface = document.createElement("canvas");
      surface.width = texture.naturalWidth;
      surface.height = texture.naturalHeight;
      const context = surface.getContext("2d");
      if (!context) return false;
      context.drawImage(texture, 0, 0);
      mask = context.getImageData(0, 0, surface.width, surface.height);
      masks.set(sprite.texture, mask);
    }

    // Undo the body's rotation before sampling the centered sprite's alpha.
    const local = Vector.rotate(Vector.sub(point, body.position), -body.angle);
    const x = Math.floor(local.x / sprite.xScale + mask.width / 2);
    const y = Math.floor(local.y / sprite.yScale + mask.height / 2);
    if (x < 0 || y < 0 || x >= mask.width || y >= mask.height) return false;
    return mask.data[(y * mask.width + x) * 4 + 3] > 0;
  }

  function release() {
    draggedBody = undefined;
    target = undefined;
    grabOffset = undefined;
    const capturedId = pointerId;
    pointerId = undefined;
    if (capturedId !== undefined && canvas.hasPointerCapture(capturedId)) {
      canvas.releasePointerCapture(capturedId);
    }
  }

  Events.on(engine, "beforeUpdate", () => {
    if (!draggedBody || !target || !grabOffset) return;
    const body = draggedBody;
    const radius = body.plugin.radius;
    const offset = Vector.rotate(grabOffset, body.angle);
    // Keep the requested center inside the pond as the grabbed edge rotates.
    const destination = {
      x: Math.max(render.bounds.min.x + radius + offset.x,
        Math.min(render.bounds.max.x - radius + offset.x, target.x)),
      y: Math.max(render.bounds.min.y + radius + offset.y,
        Math.min(render.bounds.max.y - radius + offset.y, target.y)),
    };
    const point = Vector.add(body.position, offset);
    const delta = Vector.sub(destination, point);
    const distance = Vector.magnitude(delta);
    const maxPull = Math.min(radius * 0.5, 40);
    if (distance > maxPull) Vector.mult(delta, maxPull / distance, delta);
    const velocity = Body.getVelocity(body);
    const angularVelocity = Body.getAngularVelocity(body);
    // Pull before collision solving, with damping at the actual grabbed point.
    Body.applyForce(body, point, {
      x: body.mass * (delta.x * 0.00008 -
        (velocity.x - angularVelocity * offset.y) * 0.001),
      y: body.mass * (delta.y * 0.00008 -
        (velocity.y + angularVelocity * offset.x) * 0.001),
    });
  });

  // The pond sits behind page content, so listen above the canvas.
  window.addEventListener("pointerdown", (event) => {
    if (
      !canDrag.matches ||
      event.pointerType !== "mouse" ||
      event.button !== 0 ||
      draggedBody
    ) return;
    if (
      event.target instanceof Element &&
      event.target.closest(
        "a, button, input, textarea, select, label, summary, [contenteditable], [role='button']",
      )
    ) return;

    const point = position(event);
    const body = Composite.allBodies(engine.world)
      .reverse()
      .find((body) => hitsPad(body, point));
    if (!body) return;

    target = point;
    grabOffset = Vector.rotate(Vector.sub(point, body.position), -body.angle);
    draggedBody = body;
    pointerId = event.pointerId;
    canvas.setPointerCapture(pointerId);
    event.preventDefault();
  });

  window.addEventListener("pointermove", (event) => {
    if (!draggedBody || event.pointerId !== pointerId) return;
    if ((event.buttons & 1) === 0) {
      release();
      return;
    }
    target = position(event);
  });
  window.addEventListener("pointerup", (event) => {
    if (event.pointerId === pointerId && event.button === 0) release();
  });
  window.addEventListener("pointercancel", (event) => {
    if (event.pointerId === pointerId) release();
  });
  canvas.addEventListener("lostpointercapture", release);
  window.addEventListener("blur", release);
  window.addEventListener("resize", release);
  canDrag.addEventListener("change", release);
}
