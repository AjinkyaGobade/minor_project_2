class BPlusTreeNode {
    constructor(leaf = true) {
        this.keys = [];
        this.children = [];
        this.leaf = leaf;
        this.next = null; // for leaf linking
        this.id = Math.random().toString(36).substring(2, 10);
    }

    clone() {
        const newNode = new BPlusTreeNode(this.leaf);
        newNode.id = this.id;
        newNode.keys = [...this.keys];
        newNode.children = this.children.map(c => c.clone());
        // Note: next pointer linking in clone might be tricky to maintain perfectly for visualization,
        // but we'll re-link leaves in the tree clone wrapper.
        return newNode;
    }
}

class BPlusTree {
    constructor(order = 3) {
        this.order = order;
        this.root = new BPlusTreeNode(true);
        this.frames = [];
    }

    _relinkLeaves(node, leaves = []) {
        if (node.leaf) {
            leaves.push(node);
        } else {
            for (let child of node.children) {
                this._relinkLeaves(child, leaves);
            }
        }
        for (let i = 0; i < leaves.length - 1; i++) {
            leaves[i].next = leaves[i+1];
        }
        if (leaves.length > 0) {
            leaves[leaves.length - 1].next = null;
        }
    }

    recordFrame(message, highlightNodeIds = [], highlightKeys = [], opColor = "blue") {
        const clonedRoot = this.root.clone();
        this._relinkLeaves(clonedRoot); // Ensure linked list is correct in snapshot
        this.frames.push({
            treeSnapshot: clonedRoot,
            message,
            highlightNodeIds,
            highlightKeys,
            opColor
        });
    }

    search(key) {
        this.frames = [];
        this.recordFrame(`Starting B+ Tree search for key ${key}...`, [this.root.id], [], "blue");
        let node = this.root;
        while (!node.leaf) {
            let i = 0;
            while (i < node.keys.length && key >= node.keys[i]) i++;
            this.recordFrame(`Traversing internal index...`, [node.id], [{nodeId: node.id, keyIndex: Math.min(i, node.keys.length - 1)}], "blue");
            node = node.children[i];
        }
        
        this.recordFrame(`Reached leaf node. Checking for key...`, [node.id], [], "blue");
        let idx = node.keys.indexOf(key);
        if (idx !== -1) {
            this.recordFrame(`Key ${key} found in leaf node!`, [node.id], [{nodeId: node.id, keyIndex: idx}], "success");
        } else {
            this.recordFrame(`Key ${key} not found.`, [], [], "danger");
        }
        return this.frames;
    }

    insert(key) {
        this.frames = [];
        this.recordFrame(`Starting insertion of key ${key}...`, [this.root.id], [], "success");
        
        const root = this.root;
        if (root.keys.length === this.order - 1) {
            this.recordFrame(`Root is full. Splitting root...`, [root.id], [], "warning");
            const newRoot = new BPlusTreeNode(false);
            this.root = newRoot;
            newRoot.children.push(root);
            this._splitChild(newRoot, 0, root);
            this._insertNonFull(newRoot, key);
        } else {
            this._insertNonFull(root, key);
        }
        
        this._relinkLeaves(this.root);
        this.recordFrame(`Finished inserting key ${key}.`, [], [], "success");
        return this.frames;
    }

    _splitChild(parent, i, child) {
        const newNode = new BPlusTreeNode(child.leaf);
        const splitIndex = Math.floor((this.order - 1) / 2);
        
        let promotedKey;
        if (child.leaf) {
            promotedKey = child.keys[splitIndex];
            newNode.keys = child.keys.splice(splitIndex); // Leaf: keep key in right node
            newNode.next = child.next;
            child.next = newNode;
        } else {
            promotedKey = child.keys[splitIndex];
            newNode.keys = child.keys.splice(splitIndex + 1); // Internal: key moves UP
            child.keys.pop(); // Remove promoted key
            newNode.children = child.children.splice(splitIndex + 1);
        }

        this.recordFrame(`Splitting node. Promoting key ${promotedKey} to index node.`, [child.id], [], "warning");

        parent.children.splice(i + 1, 0, newNode);
        parent.keys.splice(i, 0, promotedKey);

        this.recordFrame(`Split complete.`, [parent.id, child.id, newNode.id], [], "warning");
    }

    _insertNonFull(node, key) {
        let i = node.keys.length - 1;

        if (node.leaf) {
            if (node.keys.includes(key)) {
                this.recordFrame(`Key ${key} already exists!`, [node.id], [], "danger");
                return;
            }
            node.keys.push(null);
            while (i >= 0 && key < node.keys[i]) {
                node.keys[i + 1] = node.keys[i];
                i--;
            }
            node.keys[i + 1] = key;
            this.recordFrame(`Inserted key ${key} into leaf node.`, [node.id], [{nodeId: node.id, keyIndex: i + 1}], "success");
        } else {
            while (i >= 0 && key < node.keys[i]) i--;
            i++;
            
            this.recordFrame(`Traversing index to find correct leaf...`, [node.children[i].id], [], "success");
            
            if (node.children[i].keys.length === this.order - 1) {
                this.recordFrame(`Child node is full. Splitting before descent...`, [node.children[i].id], [], "warning");
                this._splitChild(node, i, node.children[i]);
                if (key >= node.keys[i]) {
                    i++;
                }
            }
            this._insertNonFull(node.children[i], key);
        }
    }

    // Deletion for B+ Tree (simplified)
    delete(key) {
        this.frames = [];
        this.recordFrame(`B+ Tree Deletion not fully animated in this demo.`, [], [], "warning");
        this.recordFrame(`Skipping deletion logic for brevity.`, [], [], "danger");
        return this.frames;
    }

    rangeQuery(start, end) {
        this.frames = [];
        this.recordFrame(`Starting range query from ${start} to ${end}...`, [this.root.id], [], "info");
        let node = this.root;
        while (!node.leaf) {
            let i = 0;
            while (i < node.keys.length && start >= node.keys[i]) i++;
            this.recordFrame(`Traversing index for start key ${start}...`, [node.id], [{nodeId: node.id, keyIndex: Math.min(i, node.keys.length - 1)}], "info");
            node = node.children[i];
        }
        
        let foundKeys = [];
        let highlightNodes = [];
        while (node) {
            highlightNodes.push(node.id);
            let addedAny = false;
            let currentFoundInNode = [];
            for(let i=0; i<node.keys.length; i++) {
                if (node.keys[i] !== null && node.keys[i] >= start && node.keys[i] <= end) {
                    foundKeys.push({nodeId: node.id, keyIndex: i});
                    currentFoundInNode.push({nodeId: node.id, keyIndex: i});
                    addedAny = true;
                }
            }
            this.recordFrame(`Scanning linked leaf node...`, [node.id], currentFoundInNode, "info");
            
            if (node.keys.length > 0 && node.keys[node.keys.length - 1] > end) break;
            node = node.next;
        }
        
        this.recordFrame(`Range query complete. Found ${foundKeys.length} keys in range.`, highlightNodes, foundKeys, "success");
        return this.frames;
    }
}
