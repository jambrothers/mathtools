## 2025-02-19 - Excessive Event Listener Re-attachment in Custom Hooks
**Learning:** Custom hooks that manage event listeners (like `useDraggable`) must be careful about dependency arrays. Including state that updates frequently (like `position` during a drag) or unstable objects (like `options` passed from parent) in the `useEffect` dependency array causes event listeners to be removed and added on every frame.
**Action:** Use `useRef` to hold the latest values of state/props needed inside event handlers, allowing them to be removed from the `useEffect` dependency array. This keeps the effect stable and prevents listener churn.

## 2026-02-10 - Double Re-render in Drag Operations
**Learning:** React state updates on every drag frame (`onDragMove`) cause significant performance overhead due to full parent re-renders. When using a library like `useDraggable` that handles local visual state, updating the parent state during drag is redundant for single-item drags.
**Action:** Optimize drag handlers to skip parent state updates for single-item drags, relying on `useDraggable` for visual feedback and only committing the final position to parent state on `onDragEnd`. Preserve state updates for multi-selection dragging where relative movement of other items is required.

## 2026-02-10 - Throttling Drag Updates for Grid Snapping
**Learning:** In drag-and-drop interactions with grid snapping, emitting updates on every raw pointer move causes unnecessary re-renders even when the snapped position hasn't changed. This is especially costly when dragging multiple items, as the parent component re-renders the entire list on every frame.
**Action:** Implement throttling inside the drag handler by calculating the new snapped position first, comparing it to the current position, and returning early if they are identical. Also, ensure that the delta passed to consumers reflects the *snapped* change, ensuring visual and logical state remain synchronized.

## 2026-02-12 - Imperative DOM Updates for Drag Ghosts
**Learning:** React state updates (`useState`) during high-frequency drag events (like touch/pointer moves) cause re-renders on every frame, which can be laggy, especially for simple visual feedback like a "ghost" element following the cursor.
**Action:** Use `useRef` to store the pointer position and a ref to the DOM element (e.g., the ghost), then update the element's style imperatively in the event handler. Only use state to mount/unmount the element or for low-frequency changes (like start/end of drag).
