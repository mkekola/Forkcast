import { polyfill } from "mobile-drag-drop";
import "mobile-drag-drop/default.css";

// Native HTML5 drag'n'drop (used for moving drafts/planned meals) doesn't
// fire on touch devices at all. This polyfill translates touch gestures
// into the same dragstart/dragover/drop events our existing handlers
// already listen for, with a short hold before a touch starts a drag so
// that scrolling the page still works as expected.
export default defineNuxtPlugin(() => {
  polyfill({
    holdToDrag: 300,
  });

  // Required by the polyfill: without a dragenter listener that calls
  // preventDefault(), it treats every element as an invalid drop target.
  document.addEventListener("dragenter", (event) => {
    event.preventDefault();
  });
});
