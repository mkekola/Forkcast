// Without this, starting a drag from an inner element (e.g. the recipe
// title, which is a link) makes the browser render a generic gray
// name+hyperlink ghost instead of the whole card. Explicitly setting an
// element as the drag image keeps the ghost looking like the card
// regardless of which part of it the gesture started on, positioned so the
// cursor stays over the same spot it originally grabbed.
//
// `previewElement` lets the ghost be narrower than the draggable area
// itself - e.g. DraftsDrawer's draggable wraps both the recipe card and its
// "add to week" form, but only the card should render in the ghost. The
// offset is clamped to the preview's own bounds so grabbing from outside
// it (like that form) doesn't push the cursor off the edge of the ghost.
export function setWholeCardAsDragImage(event: DragEvent, previewElement?: HTMLElement) {
  if (!event.dataTransfer) {
    return;
  }

  const card = previewElement ?? (event.currentTarget as HTMLElement | null);

  if (!card) {
    return;
  }

  const rect = card.getBoundingClientRect();
  const offsetX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  const offsetY = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);
  event.dataTransfer.setDragImage(card, offsetX, offsetY);
}
