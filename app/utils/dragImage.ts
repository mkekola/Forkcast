// Without this, starting a drag from an inner element (e.g. the recipe
// title, which is a link) makes the browser render a generic gray
// name+hyperlink ghost instead of the whole card. Explicitly setting
// dragstart's own currentTarget as the drag image keeps the ghost the full
// card regardless of which part of it the gesture started on, positioned
// so the cursor stays over the same spot it originally grabbed.
export function setWholeCardAsDragImage(event: DragEvent) {
  if (!event.dataTransfer) {
    return;
  }

  const card = event.currentTarget as HTMLElement | null;

  if (!card) {
    return;
  }

  const rect = card.getBoundingClientRect();
  event.dataTransfer.setDragImage(card, event.clientX - rect.left, event.clientY - rect.top);
}
