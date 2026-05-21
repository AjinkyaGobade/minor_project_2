class TreeVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.nodeWidth = 40;
        this.nodeHeight = 30;
        this.levelHeight = 80;
        this.padding = 10;
        
        // Colors
        this.styles = {
            bg: getComputedStyle(document.body).getPropertyValue('--bg-color').trim(),
            line: getComputedStyle(document.body).getPropertyValue('--line-color').trim(),
            nodeBg: getComputedStyle(document.body).getPropertyValue('--node-bg').trim(),
            nodeBorder: getComputedStyle(document.body).getPropertyValue('--node-border').trim(),
            text: getComputedStyle(document.body).getPropertyValue('--node-text').trim(),
            highlightNode: getComputedStyle(document.body).getPropertyValue('--highlight-bg').trim() || '#fef08a'
        };
    }

    updateStyles() {
        this.styles.bg = getComputedStyle(document.body).getPropertyValue('--bg-color').trim();
        this.styles.line = getComputedStyle(document.body).getPropertyValue('--line-color').trim();
        this.styles.nodeBg = getComputedStyle(document.body).getPropertyValue('--node-bg').trim();
        this.styles.nodeBorder = getComputedStyle(document.body).getPropertyValue('--node-border').trim();
        this.styles.text = getComputedStyle(document.body).getPropertyValue('--node-text').trim();
        this.styles.highlightNode = getComputedStyle(document.body).getPropertyValue('--highlight-bg').trim();
    }

    drawTree(root, treeType, highlightNodeIds = [], highlightKeys = []) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!root || root.keys.length === 0) return;

        this.updateStyles();
        this.ctx.font = "14px Inter, sans-serif";
        this.ctx.textAlign = "center";
        this.ctx.textBaseline = "middle";

        const positions = new Map();
        this._calculatePositions(root, 0, positions);
        
        // Center the tree horizontally
        let minX = Infinity;
        let maxX = -Infinity;
        positions.forEach(pos => {
            if (pos.x < minX) minX = pos.x;
            if (pos.x + pos.width > maxX) maxX = pos.x + pos.width;
        });

        const treeWidth = maxX - minX;
        const offsetX = (this.canvas.width - treeWidth) / 2 - minX;
        const offsetY = 50;

        positions.forEach(pos => {
            pos.x += offsetX;
            pos.y += offsetY;
        });

        this._drawEdges(root, positions, treeType);
        this._drawNodes(root, positions, highlightNodeIds, highlightKeys, treeType);
    }

    _calculatePositions(node, level, positions, leftBoundary = 0) {
        if (!node) return leftBoundary;

        const nodeBoxWidth = Math.max(1, node.keys.length) * this.nodeWidth;
        let currentLeft = leftBoundary;

        if (node.leaf) {
            positions.set(node.id, { x: currentLeft, y: level * this.levelHeight, width: nodeBoxWidth });
            return currentLeft + nodeBoxWidth + this.padding * 2;
        }

        let childLefts = [];
        for (let i = 0; i < node.children.length; i++) {
            currentLeft = this._calculatePositions(node.children[i], level + 1, positions, currentLeft);
            childLefts.push(currentLeft);
        }

        // Center parent over children
        const firstChildId = node.children[0].id;
        const lastChildId = node.children[node.children.length - 1].id;
        const firstChildPos = positions.get(firstChildId);
        const lastChildPos = positions.get(lastChildId);

        const centerOfChildren = (firstChildPos.x + lastChildPos.x + lastChildPos.width) / 2;
        const parentX = centerOfChildren - (nodeBoxWidth / 2);

        positions.set(node.id, { x: parentX, y: level * this.levelHeight, width: nodeBoxWidth });
        return currentLeft;
    }

    _drawEdges(node, positions, treeType) {
        if (!node) return;
        
        const pos = positions.get(node.id);
        const startY = pos.y + this.nodeHeight;

        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const childPos = positions.get(child.id);
            
            // Connect bottom of parent key slot to top of child
            // Approx slot position:
            const slotX = pos.x + (i * this.nodeWidth); // roughly separating them
            const targetX = childPos.x + (childPos.width / 2);

            this.ctx.beginPath();
            this.ctx.moveTo(slotX === pos.x ? slotX + this.nodeWidth/2 : slotX, startY);
            this.ctx.lineTo(targetX, childPos.y);
            this.ctx.strokeStyle = this.styles.line;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            this._drawEdges(child, positions, treeType);
        }

        // Draw B+ Tree leaf links
        if (treeType === 'bplustree' && node.leaf && node.next) {
            const nextPos = positions.get(node.next.id);
            if (nextPos) {
                this.ctx.beginPath();
                this.ctx.moveTo(pos.x + pos.width, pos.y + this.nodeHeight / 2);
                this.ctx.lineTo(nextPos.x, nextPos.y + this.nodeHeight / 2);
                this.ctx.strokeStyle = '#8b5cf6'; // distinctive color for links
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 5]);
                this.ctx.stroke();
                
                // Draw arrow head
                this.ctx.beginPath();
                this.ctx.moveTo(nextPos.x, nextPos.y + this.nodeHeight / 2);
                this.ctx.lineTo(nextPos.x - 8, nextPos.y + this.nodeHeight / 2 - 4);
                this.ctx.lineTo(nextPos.x - 8, nextPos.y + this.nodeHeight / 2 + 4);
                this.ctx.fillStyle = '#8b5cf6';
                this.ctx.fill();
                
                this.ctx.setLineDash([]);
            }
        }
    }

    _drawNodes(node, positions, highlightNodeIds, highlightKeys, treeType) {
        if (!node) return;

        const pos = positions.get(node.id);
        const isHighlightedNode = highlightNodeIds.includes(node.id);

        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = isHighlightedNode ? '#f59e0b' : this.styles.nodeBorder;
        this.ctx.fillStyle = isHighlightedNode ? this.styles.highlightNode : this.styles.nodeBg;
        
        // Draw main bounding box
        this.ctx.fillRect(pos.x, pos.y, pos.width, this.nodeHeight);
        this.ctx.strokeRect(pos.x, pos.y, pos.width, this.nodeHeight);

        // Draw keys and dividers
        for (let i = 0; i < node.keys.length; i++) {
            const keyX = pos.x + i * this.nodeWidth;
            
            // Check if specific key is highlighted
            const isKeyHighlighted = highlightKeys.some(hk => hk.nodeId === node.id && hk.keyIndex === i);
            if (isKeyHighlighted) {
                this.ctx.fillStyle = 'rgba(239, 68, 68, 0.4)'; // Reddish tint for key
                this.ctx.fillRect(keyX, pos.y, this.nodeWidth, this.nodeHeight);
            }

            // Draw divider
            if (i > 0) {
                this.ctx.beginPath();
                this.ctx.moveTo(keyX, pos.y);
                this.ctx.lineTo(keyX, pos.y + this.nodeHeight);
                this.ctx.stroke();
            }

            // Draw text
            this.ctx.fillStyle = this.styles.text;
            const val = node.keys[i];
            this.ctx.fillText(val !== null ? val : '-', keyX + this.nodeWidth / 2, pos.y + this.nodeHeight / 2);
        }

        for (let i = 0; i < node.children.length; i++) {
            this._drawNodes(node.children[i], positions, highlightNodeIds, highlightKeys, treeType);
        }
    }
}
