# Circuit Designer

An interactive digital logic circuit simulator for exploring Boolean logic, gates, and circuit design.

## Getting Started

### Components

The sidebar contains the following circuit components:

**Input/Output**
- **Switch**: A togglable input (click to switch ON/OFF)
- **Bulb**: An output indicator (lights up when receiving a HIGH signal)

**Logic Gates**
- **AND**: Outputs HIGH only when ALL inputs are HIGH
- **OR**: Outputs HIGH when ANY input is HIGH
- **NOT**: Inverts the input (HIGH becomes LOW, LOW becomes HIGH)
- **XOR**: Outputs HIGH when inputs are DIFFERENT

## Building Circuits

### Adding Components

- **Click** a component in the sidebar to add it to the canvas
- **Drag** the component from the sidebar to place it anywhere

### Creating Connections

1. Click on an **output port** (right side of a component)
2. A wire will start drawing from that port
3. Click on an **input port** (left side of another component) to complete the connection

### Moving Components

- **Drag** any component to reposition it on the canvas
- Components snap to a grid for neat alignment

### Selecting Components

- **Click** a component to select it
- **Drag** on empty canvas to marquee select multiple components

## Using the Circuit

### Toggling Inputs

- **Click** on a Switch component to toggle between ON (green) and OFF (gray)
- The circuit simulation updates automatically

### Viewing Results

- **Bulbs** light up yellow when receiving a HIGH signal
- Watch wire colors change: green = HIGH, gray = LOW

## Toolbar Features

### Quick Demos

Load pre-built example circuits to understand each gate:
- **AND**: Two switches connected to an AND gate and bulb
- **OR**: Two switches connected to an OR gate and bulb
- **NOT**: One switch connected to a NOT gate and bulb
- **XOR**: Two switches connected to an XOR gate and bulb

### Generate Truth Table

Click **Generate Truth Table** to automatically:
1. Identify all switch inputs in your circuit
2. Test all possible input combinations
3. Display outputs for each combination in a formatted table

### Other Actions

- **Clear**: Remove all components and connections
- **Link**: Generate a shareable URL preserving the current circuit

## Truth Table Reference

| Gate | Input A | Input B | Output |
|------|---------|---------|--------|
| AND  | 0 | 0 | 0 |
| AND  | 0 | 1 | 0 |
| AND  | 1 | 0 | 0 |
| AND  | 1 | 1 | 1 |
| OR   | 0 | 0 | 0 |
| OR   | 0 | 1 | 1 |
| OR   | 1 | 0 | 1 |
| OR   | 1 | 1 | 1 |
| XOR  | 0 | 0 | 0 |
| XOR  | 0 | 1 | 1 |
| XOR  | 1 | 0 | 1 |
| XOR  | 1 | 1 | 0 |
| NOT  | 0 | — | 1 |
| NOT  | 1 | — | 0 |

## Tips for Teaching

1. Start with the **Quick Demo** circuits to introduce each gate
2. Use **Generate Truth Table** to verify student-built circuits
3. Challenge students to build circuits that match specific truth tables
4. Share completed circuits using the **Link** button for homework
5. Have students predict outputs before clicking switches
