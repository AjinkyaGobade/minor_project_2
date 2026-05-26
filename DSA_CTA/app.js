document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const treeTypeSelect = document.getElementById('tree-type');
    const treeOrderInput = document.getElementById('tree-order');
    const opInput = document.getElementById('op-input');
    const btnInsert = document.getElementById('btn-insert');
    const btnDelete = document.getElementById('btn-delete');
    const btnSearch = document.getElementById('btn-search');
    const btnRandom = document.getElementById('btn-random');
    
    const speedSlider = document.getElementById('speed-slider');
    const btnPrev = document.getElementById('btn-prev');
    const btnPlayPause = document.getElementById('btn-play-pause');
    const btnNext = document.getElementById('btn-next');
    const btnReset = document.getElementById('btn-reset');
    
    const btnDemoBTree = document.getElementById('btn-demo-btree');
    const btnDemoBPlusTree = document.getElementById('btn-demo-bplustree');
    
    const canvas = document.getElementById('tree-canvas');
    const canvasContainer = document.getElementById('canvas-container');
    const explanationText = document.getElementById('explanation-text');
    const statusIndicator = document.getElementById('status-indicator');
    
    const statMaxKeys = document.getElementById('stat-max-keys');
    const statMinKeys = document.getElementById('stat-min-keys');
    const statMaxChildren = document.getElementById('stat-max-children');

    const themeToggle = document.getElementById('theme-toggle');

    // App State
    let currentTreeType = 'btree';
    let currentOrder = 3;
    let tree = new BTree(currentOrder);
    let visualizer;
    
    let animationFrames = [];
    let currentFrameIdx = 0;
    let isPlaying = false;
    let animationTimer = null;
    let baseSpeed = 1000; // ms

    // Canvas Panning
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let isDragging = false;
    let startPanX = 0;
    let startPanY = 0;

    function resizeCanvas() {
        canvas.width = canvasContainer.clientWidth;
        canvas.height = canvasContainer.clientHeight;
        if(visualizer) drawCurrentState();
    }
    
    window.addEventListener('resize', resizeCanvas);

    function init() {
        visualizer = new TreeVisualizer(canvas);
        resizeCanvas();
        updateStats();
        setupCanvasInteraction();
    }

    // Canvas Interaction
    function setupCanvasInteraction() {
        canvasContainer.addEventListener('mousedown', (e) => {
            isDragging = true;
            startPanX = e.clientX - panX;
            startPanY = e.clientY - panY;
        });
        canvasContainer.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            panX = e.clientX - startPanX;
            panY = e.clientY - startPanY;
            drawCurrentState();
        });
        canvasContainer.addEventListener('mouseup', () => isDragging = false);
        canvasContainer.addEventListener('mouseleave', () => isDragging = false);
        
        // Simple zoom
        canvasContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomAmount = e.deltaY > 0 ? 0.9 : 1.1;
            scale *= zoomAmount;
            // Prevent too much zoom
            scale = Math.max(0.5, Math.min(scale, 3));
            drawCurrentState();
        });
    }

    function resetView() {
        scale = 1;
        panX = 0;
        panY = 0;
    }

    // Core Logic
    function updateStats() {
        const m = currentOrder;
        statMaxChildren.textContent = m;
        statMaxKeys.textContent = m - 1;
        statMinKeys.textContent = Math.ceil(m / 2) - 1;
    }

    function instantiateTree() {
        if (currentTreeType === 'btree') {
            tree = new BTree(currentOrder);
        } else {
            tree = new BPlusTree(currentOrder);
        }
        resetAnimation();
        drawCurrentState();
        setExplanation(`Created empty ${currentTreeType === 'btree' ? 'B-Tree' : 'B+ Tree'} of order ${currentOrder}.`, 'blue');
    }

    // Listeners
    treeTypeSelect.addEventListener('change', (e) => {
        currentTreeType = e.target.value;
        instantiateTree();
    });

    treeOrderInput.addEventListener('change', (e) => {
        let val = parseInt(e.target.value);
        if (isNaN(val) || val < 3) {
            val = 3;
            e.target.value = 3;
        }
        currentOrder = val;
        updateStats();
        instantiateTree();
    });

    function getInputValue() {
        const val = parseInt(opInput.value);
        if (isNaN(val)) {
            alert('Please enter a valid integer key.');
            return null;
        }
        opInput.value = '';
        return val;
    }

    btnInsert.addEventListener('click', () => {
        const val = getInputValue();
        if (val !== null) executeOperation('insert', val);
    });

    btnDelete.addEventListener('click', () => {
        const val = getInputValue();
        if (val !== null) executeOperation('delete', val);
    });

    btnSearch.addEventListener('click', () => {
        const val = getInputValue();
        if (val !== null) executeOperation('search', val);
    });

    btnRandom.addEventListener('click', () => {
        const val = Math.floor(Math.random() * 100);
        executeOperation('insert', val);
    });

    function executeOperation(op, val) {
        if (isPlaying) pauseAnimation();
        
        let frames = [];
        if (op === 'insert') frames = tree.insert(val);
        else if (op === 'delete') frames = tree.delete(val);
        else if (op === 'search') frames = tree.search(val);

        if (frames && frames.length > 0) {
            startAnimation(frames);
        } else {
            drawCurrentState(); // In case no frames generated
        }
    }

    // Animation System
    function startAnimation(frames) {
        animationFrames = frames;
        currentFrameIdx = 0;
        playAnimation();
    }

    function resetAnimation() {
        pauseAnimation();
        animationFrames = [];
        currentFrameIdx = 0;
        resetView();
    }

    function playAnimation() {
        if (animationFrames.length === 0 || currentFrameIdx >= animationFrames.length) return;
        isPlaying = true;
        btnPlayPause.innerHTML = '<i class="fa-solid fa-pause"></i>';
        
        drawFrame(animationFrames[currentFrameIdx]);
        
        const delay = baseSpeed * (101 - speedSlider.value) / 50;
        
        animationTimer = setTimeout(() => {
            currentFrameIdx++;
            if (currentFrameIdx < animationFrames.length) {
                playAnimation();
            } else {
                pauseAnimation();
            }
        }, delay);
    }

    function pauseAnimation() {
        isPlaying = false;
        btnPlayPause.innerHTML = '<i class="fa-solid fa-play"></i>';
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }
    }

    function drawFrame(frame) {
        if (!frame) return;
        visualizer.ctx.save();
        visualizer.ctx.translate(panX, panY);
        visualizer.ctx.scale(scale, scale);
        
        visualizer.drawTree(frame.treeSnapshot, currentTreeType, frame.highlightNodeIds, frame.highlightKeys);
        
        visualizer.ctx.restore();

        setExplanation(frame.message, frame.opColor);
    }

    function drawCurrentState() {
        visualizer.ctx.save();
        visualizer.ctx.translate(panX, panY);
        visualizer.ctx.scale(scale, scale);
        visualizer.drawTree(tree.root, currentTreeType, [], []);
        visualizer.ctx.restore();
    }

    function setExplanation(msg, colorType) {
        explanationText.textContent = msg;
        const colorVar = `--${colorType}-color`;
        statusIndicator.style.background = `var(${colorVar}, var(--primary-color))`;
        statusIndicator.style.boxShadow = `0 0 10px var(${colorVar}, var(--primary-color))`;
    }

    // Playback Controls
    btnPlayPause.addEventListener('click', () => {
        if (isPlaying) pauseAnimation();
        else {
            if (currentFrameIdx >= animationFrames.length) currentFrameIdx = 0;
            playAnimation();
        }
    });

    btnNext.addEventListener('click', () => {
        pauseAnimation();
        if (currentFrameIdx < animationFrames.length - 1) {
            currentFrameIdx++;
            drawFrame(animationFrames[currentFrameIdx]);
        }
    });

    btnPrev.addEventListener('click', () => {
        pauseAnimation();
        if (currentFrameIdx > 0) {
            currentFrameIdx--;
            drawFrame(animationFrames[currentFrameIdx]);
        }
    });

    btnReset.addEventListener('click', () => {
        instantiateTree();
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        themeToggle.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        drawCurrentState();
    });

    // Tabs logic
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
        });
    });

    // Demos
    async function runSequence(ops) {
        pauseAnimation();
        for (let op of ops) {
            let frames = [];
            if (op.type === 'insert') frames = tree.insert(op.val);
            else if (op.type === 'delete') frames = tree.delete(op.val);
            else if (op.type === 'search') frames = tree.search(op.val);
            else if (op.type === 'range') frames = tree.rangeQuery(op.val[0], op.val[1]);
            
            animationFrames = frames;
            currentFrameIdx = 0;
            
            for (let i = 0; i < frames.length; i++) {
                drawFrame(frames[i]);
                await new Promise(r => setTimeout(r, 800));
            }
        }
        setExplanation("Demo completed.", "success");
    }

    btnDemoBTree.addEventListener('click', () => {
        treeTypeSelect.value = 'btree';
        currentTreeType = 'btree';
        treeOrderInput.value = 3;
        currentOrder = 3;
        instantiateTree();
        
        const seq = [10, 20, 5, 6, 12, 30, 7, 17].map(v => ({type: 'insert', val: v}));
        seq.push({type: 'delete', val: 6});
        seq.push({type: 'delete', val: 7});
        runSequence(seq);
    });

    btnDemoBPlusTree.addEventListener('click', () => {
        treeTypeSelect.value = 'bplustree';
        currentTreeType = 'bplustree';
        treeOrderInput.value = 3;
        currentOrder = 3;
        instantiateTree();
        
        const seq = [5, 15, 25, 35, 45, 55, 65].map(v => ({type: 'insert', val: v}));
        seq.push({type: 'search', val: 45});
        seq.push({type: 'range', val: [15, 55]});
        runSequence(seq);
    });

    init();
});
