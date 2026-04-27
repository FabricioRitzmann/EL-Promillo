function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function setupWalletDragDrop({ container, getLayout, onLayoutChange, snap = 2 }) {
  if (!container) return () => {};

  const state = { key: null, pointerId: null, startX: 0, startY: 0, originX: 0, originY: 0 };

  const onPointerMove = (event) => {
    if (!state.key || state.pointerId !== event.pointerId) return;
    const dx = event.clientX - state.startX;
    const dy = event.clientY - state.startY;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const current = getLayout();
    const nextX = clamp(Math.round((state.originX + dx) / snap) * snap, 0, width - 24);
    const nextY = clamp(Math.round((state.originY + dy) / snap) * snap, 0, height - 24);
    onLayoutChange({
      ...current,
      [state.key]: { x: nextX, y: nextY }
    });
  };

  const onPointerUp = (event) => {
    if (state.pointerId !== event.pointerId) return;
    state.key = null;
    state.pointerId = null;
  };

  const onPointerDown = (event) => {
    const dragNode = event.target.closest('[data-drag-key]');
    if (!dragNode || !container.contains(dragNode)) return;
    const key = dragNode.dataset.dragKey;
    const layout = getLayout();
    state.key = key;
    state.pointerId = event.pointerId;
    state.startX = event.clientX;
    state.startY = event.clientY;
    state.originX = layout[key]?.x ?? 0;
    state.originY = layout[key]?.y ?? 0;
    dragNode.setPointerCapture(event.pointerId);
    event.preventDefault();
  };

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

  return () => {
    container.removeEventListener('pointerdown', onPointerDown);
    container.removeEventListener('pointermove', onPointerMove);
    container.removeEventListener('pointerup', onPointerUp);
    container.removeEventListener('pointercancel', onPointerUp);
  };
}
