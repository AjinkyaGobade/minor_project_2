class BTreeNode {
    constructor(leaf = true) {
        this.keys = [];
        this.children = [];
        this.leaf = leaf;
        this.id = Math.random().toString(36).substring(2, 10);
    }

    clone() {
        const newNode = new BTreeNode(this.leaf);
        newNode.id = this.id;
        newNode.keys = [...this.keys];
        newNode.children = this.children.map(c => c.clone());
        return newNode;
    }
}

class BTree {
    constructor(order = 3) {
        this.order = order;
        this.root = new BTreeNode(true);
        this.frames = []; // Stores steps for animation
    }

    recordFrame(message, highlightNodeIds = [], highlightKeys = [], opColor = "blue") {
        this.frames.push({
            treeSnapshot: this.root.clone(),
            message,
            highlightNodeIds,
            highlightKeys, // array of {nodeId, keyIndex}
            opColor
        });
    }

    search(key) {
        this.frames = [];
        this.recordFrame(`Starting search for key ${key}...`, [this.root.id], [], "blue");
        const result = this._search(this.root, key);
        if (result) {
            this.recordFrame(`Key ${key} found!`, [result.node.id], [{nodeId: result.node.id, keyIndex: result.index}], "success");
        } else {
            this.recordFrame(`Key ${key} not found in the tree.`, [], [], "danger");
        }
        return this.frames;
    }

    _search(node, key) {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) {
            i++;
        }
        
        this.recordFrame(`Comparing ${key} in node`, [node.id], [{nodeId: node.id, keyIndex: Math.min(i, node.keys.length - 1)}], "blue");

        if (i < node.keys.length && key === node.keys[i]) {
            return { node, index: i };
        }

        if (node.leaf) {
            return null;
        }

        this.recordFrame(`Key ${key} not found in current node, moving to child...`, [node.children[i].id], [], "blue");
        return this._search(node.children[i], key);
    }

    insert(key) {
        this.frames = [];
        if (this._searchSync(this.root, key)) {
            this.recordFrame(`Key ${key} already exists in the tree.`, [], [], "danger");
            return this.frames;
        }

        this.recordFrame(`Starting insertion of key ${key}...`, [this.root.id], [], "success");
        const root = this.root;
        if (root.keys.length === this.order - 1) {
            this.recordFrame(`Root is full. Splitting root...`, [root.id], [], "warning");
            const newRoot = new BTreeNode(false);
            this.root = newRoot;
            newRoot.children.push(root);
            this._splitChild(newRoot, 0, root);
            this._insertNonFull(newRoot, key);
        } else {
            this._insertNonFull(root, key);
        }
        
        this.recordFrame(`Finished inserting key ${key}.`, [], [], "success");
        return this.frames;
    }

    _searchSync(node, key) {
        let i = 0;
        while (i < node.keys.length && key > node.keys[i]) i++;
        if (i < node.keys.length && key === node.keys[i]) return true;
        if (node.leaf) return false;
        return this._searchSync(node.children[i], key);
    }

    _splitChild(parent, i, child) {
        const t = Math.ceil(this.order / 2);
        const newNode = new BTreeNode(child.leaf);
        
        const splitIndex = Math.floor((this.order - 1) / 2);
        const promotedKey = child.keys[splitIndex];

        this.recordFrame(`Splitting node. Promoting key ${promotedKey}...`, [child.id], [{nodeId: child.id, keyIndex: splitIndex}], "warning");

        newNode.keys = child.keys.splice(splitIndex + 1);
        child.keys.pop(); // remove promoted key

        if (!child.leaf) {
            newNode.children = child.children.splice(splitIndex + 1);
        }

        parent.children.splice(i + 1, 0, newNode);
        parent.keys.splice(i, 0, promotedKey);

        this.recordFrame(`Split complete. Key ${promotedKey} moved to parent.`, [parent.id, child.id, newNode.id], [{nodeId: parent.id, keyIndex: i}], "warning");
    }

    _insertNonFull(node, key) {
        let i = node.keys.length - 1;

        if (node.leaf) {
            this.recordFrame(`Found leaf node to insert key ${key}.`, [node.id], [], "success");
            node.keys.push(null); // placeholder
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                i--;
            }
            node.keys[i + 1] = key;
            this.recordFrame(`Inserted key ${key} into leaf node.`, [node.id], [{nodeId: node.id, keyIndex: i + 1}], "success");
        } else {
            while (i >= 0 && key < node.keys[i]) {
                i--;
            }
            i++;
            
            this.recordFrame(`Traversing to child for insertion...`, [node.children[i].id], [], "success");
            
            if (node.children[i].keys.length === this.order - 1) {
                this.recordFrame(`Child node is full. Splitting child...`, [node.children[i].id], [], "warning");
                this._splitChild(node, i, node.children[i]);
                if (key > node.keys[i]) {
                    i++;
                }
            }
            this._insertNonFull(node.children[i], key);
        }
    }

    // Simplified deletion for visualizer (real B-tree deletion is complex to animate fully in short time)
    // We'll implement a basic structure and record frames
    delete(key) {
        this.frames = [];
        this.recordFrame(`Starting deletion of key ${key}...`, [this.root.id], [], "danger");
        
        if (!this._searchSync(this.root, key)) {
            this.recordFrame(`Key ${key} not found to delete.`, [], [], "danger");
            return this.frames;
        }

        this._deleteRec(this.root, key);

        if (this.root.keys.length === 0 && !this.root.leaf) {
            this.recordFrame(`Root is empty, making its only child the new root.`, [this.root.id], [], "warning");
            this.root = this.root.children[0];
        }

        this.recordFrame(`Finished deleting key ${key}.`, [], [], "danger");
        return this.frames;
    }

    _deleteRec(node, key) {
        let idx = node.keys.indexOf(key);
        
        if (idx !== -1) {
            this.recordFrame(`Found key ${key} to delete.`, [node.id], [{nodeId: node.id, keyIndex: idx}], "danger");
            if (node.leaf) {
                node.keys.splice(idx, 1);
                this.recordFrame(`Deleted key ${key} from leaf node.`, [node.id], [], "danger");
            } else {
                // Not a leaf. For simplicity in this demo, replace with predecessor.
                // In a robust implementation, we check left/right child keys, etc.
                const predNode = this._getPredecessor(node, idx);
                const predKey = predNode.keys[predNode.keys.length - 1];
                this.recordFrame(`Node is internal. Replacing ${key} with predecessor ${predKey}...`, [node.id, predNode.id], [], "warning");
                node.keys[idx] = predKey;
                this._deleteRec(node.children[idx], predKey);
            }
        } else {
            let i = 0;
            while (i < node.keys.length && key > node.keys[i]) i++;
            
            if (node.leaf) {
                return; // Not found
            }
            
            this.recordFrame(`Key ${key} not in this node, traversing to child...`, [node.children[i].id], [], "danger");
            
            // Ensure child has enough keys before going down
            const minKeys = Math.ceil(this.order / 2) - 1;
            if (node.children[i].keys.length <= minKeys) {
                this.recordFrame(`Child has minimum keys. Balancing before traversing...`, [node.children[i].id], [], "warning");
                this._fill(node, i);
            }
            
            // Adjust 'i' if merged
            if (i > node.keys.length) {
                this._deleteRec(node.children[i - 1], key);
            } else {
                this._deleteRec(node.children[i], key);
            }
        }
    }

    _getPredecessor(node, idx) {
        let cur = node.children[idx];
        while (!cur.leaf) {
            cur = cur.children[cur.children.length - 1];
        }
        return cur;
    }

    _fill(node, idx) {
        const minKeys = Math.ceil(this.order / 2) - 1;
        if (idx !== 0 && node.children[idx - 1].keys.length > minKeys) {
            this._borrowFromPrev(node, idx);
        } else if (idx !== node.children.length - 1 && node.children[idx + 1].keys.length > minKeys) {
            this._borrowFromNext(node, idx);
        } else {
            if (idx !== node.children.length - 1) {
                this._merge(node, idx);
            } else {
                this._merge(node, idx - 1);
            }
        }
    }

    _borrowFromPrev(node, idx) {
        const child = node.children[idx];
        const sibling = node.children[idx - 1];
        
        child.keys.unshift(node.keys[idx - 1]);
        node.keys[idx - 1] = sibling.keys.pop();
        
        if (!child.leaf) {
            child.children.unshift(sibling.children.pop());
        }
        this.recordFrame(`Borrowed key from left sibling.`, [node.id, child.id, sibling.id], [], "warning");
    }

    _borrowFromNext(node, idx) {
        const child = node.children[idx];
        const sibling = node.children[idx + 1];
        
        child.keys.push(node.keys[idx]);
        node.keys[idx] = sibling.keys.shift();
        
        if (!child.leaf) {
            child.children.push(sibling.children.shift());
        }
        this.recordFrame(`Borrowed key from right sibling.`, [node.id, child.id, sibling.id], [], "warning");
    }

    _merge(node, idx) {
        const child = node.children[idx];
        const sibling = node.children[idx + 1];
        
        child.keys.push(node.keys[idx]);
        child.keys.push(...sibling.keys);
        
        if (!child.leaf) {
            child.children.push(...sibling.children);
        }
        
        node.keys.splice(idx, 1);
        node.children.splice(idx + 1, 1);
        this.recordFrame(`Merged nodes.`, [node.id, child.id], [], "warning");
    }
}
