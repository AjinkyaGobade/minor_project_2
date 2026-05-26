# B-Tree and B+ Tree Interactive Visualizer

A fully interactive educational web application that demonstrates and simulates B Tree and B+ Tree data structures with animations and step-by-step operations.

## Features
- **Tree Selection:** Toggle between B-Tree and B+ Tree.
- **Adjustable Order:** Choose the order of the tree (e.g., 3, 4, 5) to see how it affects branching and node capacities.
- **Step-by-Step Operations:** Visualize Insertion, Deletion, and Searching step-by-step with explanatory text for each action.
- **Educational Panel:** Learn the mathematical properties, time complexities, and real-world database applications of these trees.
- **Customizable Experience:** Control animation speed, switch between dark and light modes, and generate random keys.

## Folder Structure
- `index.html`: The main user interface and layout.
- `style.css`: Modern, responsive styling with dark/light mode support.
- `app.js`: Main application logic, UI event listeners, and animation controller.
- `btree.js`: Core implementation of the B-Tree data structure and operations.
- `bplustree.js`: Core implementation of the B+ Tree data structure and operations.
- `visualizer.js`: Rendering logic to draw the trees on an HTML5 Canvas.

## How to Run Locally
1. Clone or download this directory.
2. Open the `index.html` file in any modern web browser. No server or build tools are required!

## Algorithms Explained

### B-Tree Property
For a B-Tree of order $m$:
- Every node has at most $m$ children.
- Every non-leaf node (except root) has at least $\lceil m/2 \rceil$ children.
- The root has at least two children if it is not a leaf node.
- A non-leaf node with $k$ children contains $k-1$ keys.
- All leaves appear in the same level.
- Maximum children = $m$, Maximum keys = $m-1$, Minimum keys = $\lceil m/2 \rceil - 1$.
- Height Complexity: $T(n) = O(\log n)$

### B+ Tree Leaf Linking
- Internal nodes strictly act as indexes (routing guides).
- All actual data records or pointers to records are stored in the leaf nodes.
- Leaf nodes are connected as a singly or doubly linked list, allowing for highly efficient range queries.
