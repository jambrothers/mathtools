# Number Line Tool

An interactive number line for exploring integers, fractions, and decimals.

## Features

- **Flexible Range**: Set custom minimum and maximum values for the number line.
- **Dynamic Interaction**:
    - **Add Points**: Click anywhere on the line to place a point.
    - **Move Points**: Drag points to new positions.
    - **Delete Points**: Click a point to remove it.
    - **Add Jumps**: create curved arrows (arcs) between points to show addition/subtraction or intervals.
- **Visual Controls**:
    - **Zoom**: Zoom in/out to focus on specific ranges.
    - **Labels**: Toggle tick labels on/off.
    - **Hide Values**: Hide the specific values of points (useful for estimation exercises).
    - **Negative Region**: Shade the negative side of the number line for emphasis.
    - **Snap to Ticks**: Force points to align with integer ticks.

## Interaction Modes

Switch between modes using the toolbar at the bottom or keyboard shortcuts:

| Mode | Shortcut | Description |
| :--- | :---: | :--- |
| **Select / Move** | `V` | Default mode. Click to select points, drag to move them. |
| **Add Point** | `P` | Click anywhere on the line to add a new point. |
| **Delete Point** | `D` | Click an existing point to remove it. |
| **Add Jump** | `J` | Click a starting point, then a destination point to create an arc. |

## Sidebar Controls

### Viewport Range
Manually set the **Min** and **Max** values to define the visible range. Use the preset buttons for common ranges (e.g., -10 to 10, 0 to 100).

### Points
Manage all points on the line.
- **Reveal/Hide All**: Toggle visibility of all point values at once.
- **Eye Icon**: Hide/Show the value of a specific point.
- **Trash Icon**: Delete a specific point.
- **Add Input**: Manually enter a value to add a precise point.

### Jump Arcs
Create arcs between points to visualize operations.
- Select "From" and "To" points from the dropdowns.
- Add a custom label (optional) or use the calculated difference (e.g., "+5").

### Display Settings
- **Show Tick Labels**: Show/hide numbers on the axis.
- **Hide Point Values**: Show/hide the values above the points.
- **Shade Negative Region**: Adds a background color to the negative side of zero.
- **Snap to Ticks**: Constraints point movement to integer positions.

## Export & Share

- **Copy Link**: Generates a unique URL containing the current state of the number line (range, points, settings).
- **Export**: Download the current view as a **PNG** image or **SVG** vector file for use in worksheets or presentations.
