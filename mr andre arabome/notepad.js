document.addEventListener('click', function(e){
    // manual-only toggle (gallery tab)
    // - by default it should NOT show
    // - clicking its tab should toggle it, without interfering with other notepads
    if(e.target.matches('[data-manual-tab="manual-section"]')){
        e.preventDefault();
        const section = document.querySelector('.notepad[data-note="manual-section"]');
        if(!section) return;
        const isHidden = section.classList.contains('hidden');
        const currentlyHiddenByClass = section.classList.contains('hidden') || section.classList.contains('aria-hidden-true');

        if(isHidden || section.classList.contains('hidden')){
            // reopen
            section.classList.remove('hidden');
            section.setAttribute('aria-hidden','false');
            section.classList.remove('hidden');
            section.classList.remove('minimized');
        } else {
            // hide
            section.classList.add('hidden');
            section.setAttribute('aria-hidden','true');
        }
    }

    // minimize
    if(e.target.matches('.notepad .controls .min')){
        const win = e.target.closest('.notepad');
        if(win) win.classList.toggle('minimized');
    }

    // close
    if(e.target.matches('.notepad .controls .close')){
        const win = e.target.closest('.notepad');
        if(win){
            win.classList.add('hidden');
            win.setAttribute('aria-hidden','true');
        }
    }

    // max (we'll toggle a simple "maximized" class that stretches)
    if(e.target.matches('.notepad .controls .max')){
        const win = e.target.closest('.notepad');
        if(win) toggleMaximize(win);
    }
});

// double-click titlebar to maximize/restore like a desktop window
document.addEventListener('dblclick', function(e){
    if(e.target.closest && e.target.closest('.notepad .titlebar')){
        const win = e.target.closest('.notepad');
        if(win) toggleMaximize(win);
    }
});

// ensure keyboard accessibility: allow Enter on control spans
document.addEventListener('keydown', function(e){
    if((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.matches('.notepad .controls span')){
        document.activeElement.click();
        e.preventDefault();
    }
});

function ensureResizeHandles(win){
    if(!win || win.dataset.handlesReady === 'true') return;
    const handleDefs = [
        ['top', 'n'],
        ['right', 'e'],
        ['bottom', 's'],
        ['left', 'w'],
        ['corner nw', 'nw'],
        ['corner ne', 'ne'],
        ['corner sw', 'sw'],
    ];

    handleDefs.forEach(([className, dir]) => {
        const handle = document.createElement('div');
        handle.className = `resize-handle ${className}`;
        handle.dataset.resize = dir;
        handle.setAttribute('aria-hidden', 'true');
        win.appendChild(handle);
    });

    // Preserve the existing bottom-right decorative resizer if present by converting it.
    const legacy = win.querySelector('.resizer');
    if(legacy){
        legacy.classList.remove('resizer');
        legacy.classList.add('resize-handle', 'corner', 'se');
        legacy.dataset.resize = 'se';
    }

    win.dataset.handlesReady = 'true';
}

function initializeResizeHandles(){
    document.querySelectorAll('.notepad').forEach(ensureResizeHandles);
}

function snapshotWindowState(win){
    if(win.dataset.maxSnapshot) return;
    win.dataset.maxSnapshot = JSON.stringify({
        position: win.style.position || '',
        left: win.style.left || '',
        top: win.style.top || '',
        right: win.style.right || '',
        bottom: win.style.bottom || '',
        width: win.style.width || '',
        height: win.style.height || '',
        zIndex: win.style.zIndex || '',
        overflow: win.style.overflow || '',
    });
}

function restoreWindowState(win){
    const snapshot = win.dataset.maxSnapshot ? JSON.parse(win.dataset.maxSnapshot) : null;
    if(!snapshot) return;
    win.style.position = snapshot.position;
    win.style.left = snapshot.left;
    win.style.top = snapshot.top;
    win.style.right = snapshot.right;
    win.style.bottom = snapshot.bottom;
    win.style.width = snapshot.width;
    win.style.height = snapshot.height;
    win.style.zIndex = snapshot.zIndex;
    win.style.overflow = snapshot.overflow;
    delete win.dataset.maxSnapshot;
}

function maximizeWindow(win){
    snapshotWindowState(win);
    win.classList.add('maximized');
    win.style.position = 'fixed';
    win.style.left = '24px';
    win.style.top = '24px';
    win.style.right = '24px';
    win.style.bottom = '64px';
    win.style.width = '';
    win.style.height = '';
    win.style.zIndex = 11000;
    win.style.overflow = 'auto';
}

function toggleMaximize(win){
    if(win.classList.contains('maximized')){
        win.classList.remove('maximized');
        restoreWindowState(win);
        return;
    }
    maximizeWindow(win);
}

// POSITION NOTEPADS IN 2x2 GRID (ensure all visible on screen)
function placeNotepadsRandomly(){
    const container = document.querySelector('.notepad-row');
    if(!container) return;

    // mobile fallback: remove absolute positioning
    if(window.matchMedia('(max-width: 768px)').matches){
        container.style.minHeight = '';
        const pads = container.querySelectorAll('.notepad');
        pads.forEach(p=>{ p.style.position = ''; p.style.left=''; p.style.top=''; p.style.width=''; p.style.height=''; });
        return;
    }

    container.style.position = 'relative';
    const pads = Array.from(container.querySelectorAll('.notepad')).filter(p=>!p.classList.contains('hidden'));
    const padding = 12;
    const minNotebookWidth = 280;
    const minNotebookHeight = 180;
    
    // Use full viewport dimensions
    const availableHeight = window.innerHeight - 40 - padding * 2;
    const availableWidth = window.innerWidth - padding * 2;

    pads.forEach(p=>{ p.style.position = 'absolute'; });

    // Use 2x2 grid layout for 4 notepads
    if(pads.length === 4){
        const gridWidth = Math.floor((availableWidth - padding) / 2);
        const gridHeight = Math.floor(availableHeight / 2);
        const notepadWidth = Math.max(minNotebookWidth, gridWidth - padding);
        const notepadHeight = Math.max(minNotebookHeight, gridHeight - padding);
        
        const positions = [
            { left: padding, top: padding },
            { left: padding + gridWidth, top: padding },
            { left: padding, top: padding + gridHeight },
            { left: padding + gridWidth, top: padding + gridHeight }
        ];
        
        pads.forEach((p, idx)=>{
            const pos = positions[idx];
            const randomOffsetX = Math.random() * Math.max(0, gridWidth - notepadWidth - padding * 2);
            const randomOffsetY = Math.random() * Math.max(0, gridHeight - notepadHeight - padding * 2);
            
            p.style.width = `${notepadWidth}px`;
            p.style.height = `${notepadHeight}px`;
            p.style.left = `${pos.left + randomOffsetX}px`;
            p.style.top = `${pos.top + randomOffsetY}px`;
        });
        
        container.style.minHeight = `${availableHeight + padding * 2}px`;
    } else {
        // Fallback for non-4-notepad scenarios
        const colWidth = Math.floor((availableWidth - padding) / 2);
        pads.forEach((p, idx)=>{
            const col = idx % 2;
            const row = Math.floor(idx / 2);
            const notepadWidth = Math.max(minNotebookWidth, colWidth - padding);
            
            p.style.width = `${notepadWidth}px`;
            p.style.left = `${padding + col * (colWidth + padding / 2)}px`;
            p.style.top = `${padding + row * (minNotebookHeight + padding)}px`;
        });
        
        container.style.minHeight = `${Math.ceil(pads.length / 2) * minNotebookHeight + padding * 3}px`;
    }
}

window.addEventListener('resize', function(){
    // debounce
    clearTimeout(window.__notepadResizeTimer);
    window.__notepadResizeTimer = setTimeout(placeNotepadsRandomly, 150);
});

document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.notepad').forEach(win=>{
        win.classList.add('hidden');
        win.setAttribute('aria-hidden','true');
    });

    // small delay to let layout settle
    setTimeout(placeNotepadsRandomly, 80);
    setTimeout(initializeResizeHandles, 90);
});

// TASKBAR: create entries for each notepad and allow reopen/minimize
function initNotepadTaskbar(){
    const container = document.querySelector('.notepad-row');
    if(!container) return;
    const taskbarCenter = document.querySelector('.taskbar-center');
    if(!taskbarCenter) return;

    // Clear existing taskbar buttons to avoid duplicates when reinitializing
    taskbarCenter.querySelectorAll('.taskbar-notepad-btn').forEach(b => b.remove());

    const pads = Array.from(container.querySelectorAll('.notepad'));
    pads.forEach((p, idx)=>{
        const id = p.dataset.note || `notepad-${idx}`;
        p.dataset.note = id;
        const titleEl = p.querySelector('.titlebar .title');
        const title = titleEl ? titleEl.textContent.trim() : `Notepad ${idx+1}`;

        const btn = document.createElement('button');
        btn.className = 'taskbar-notepad-btn';
        btn.type = 'button';
        btn.textContent = title;
        btn.dataset.target = id;

        // Reflect current state: closed if hidden, pressed if visible and not minimized
        if(p.classList.contains('hidden')){
            btn.classList.add('closed');
            btn.setAttribute('aria-pressed','false');
        } else if(p.classList.contains('minimized')){
            btn.classList.remove('closed');
            btn.setAttribute('aria-pressed','false');
        } else {
            btn.classList.remove('closed');
            btn.setAttribute('aria-pressed','true');
        }

        btn.addEventListener('click', function(){
            const target = container.querySelector(`.notepad[data-note="${this.dataset.target}"]`);
            if(!target) return;
            if(target.classList.contains('hidden')){
                // reopen
                target.classList.remove('hidden');
                target.setAttribute('aria-hidden','false');
                target.classList.remove('minimized');
                target.style.display = '';
                placeNotepadsRandomly();
                window.__notepadZIndex = (window.__notepadZIndex || 11000) + 1;
                target.style.zIndex = window.__notepadZIndex;
                this.classList.remove('closed');
                this.setAttribute('aria-pressed','true');
            } else {
                // toggle minimize to simulate backgrounding
                target.classList.toggle('minimized');
                const isMin = target.classList.contains('minimized');
                this.setAttribute('aria-pressed', isMin ? 'false' : 'true');
            }
        });

        taskbarCenter.appendChild(btn);
    });
}

document.addEventListener('DOMContentLoaded', function(){
    // set up taskbar after a short delay so notepads exist
    setTimeout(initNotepadTaskbar, 120);

    // monitor close actions to mark taskbar buttons as closed
    document.addEventListener('click', function(e){
        if(e.target.matches('.notepad .controls .close')){
            const win = e.target.closest('.notepad');
            if(!win) return;
            const id = win.dataset.note;
            const btn = document.querySelector(`.taskbar-center .taskbar-notepad-btn[data-target="${id}"]`);
            if(btn) { btn.classList.add('closed'); btn.setAttribute('aria-pressed','false'); }
        }
    });
});

// DRAG & TOUCH: enable moving notepads by their titlebar
(function(){
    let dragging = false;
    let target = null;
    let container = null;
    let offsetX = 0;
    let offsetY = 0;

    function startDrag(e){
        const title = (e.target.closest && e.target.closest('.notepad .titlebar')) || null;
        if(!title) return;
        // ignore clicks on control buttons
        if(e.target.closest('.controls')) return;
        target = title.closest('.notepad');
        container = target.closest('.notepad-row');
        if(!target || !container) return;

        // dragging should exit maximize so the window can move freely
        if(target.classList.contains('maximized')){
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            restoreWindowState(target);
            const rect = target.getBoundingClientRect();
            offsetX = clientX - rect.left;
            offsetY = clientY - rect.top;
        }

        // ensure absolute positioning
        target.style.position = 'absolute';
        const rect = target.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        offsetX = clientX - rect.left;
        offsetY = clientY - rect.top;

        window.__notepadZIndex = (window.__notepadZIndex || 11000) + 1;
        target.style.zIndex = window.__notepadZIndex;
        dragging = true;
        document.body.classList.add('dragging');
        e.preventDefault();
    }

    function onMove(e){
        if(!dragging || !target) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const w = target.offsetWidth;
        const h = target.offsetHeight;
        const cRect = container.getBoundingClientRect();
        let left = clientX - cRect.left - offsetX;
        let top = clientY - cRect.top - offsetY;
        
        // Calculate absolute position in viewport
        const absLeft = cRect.left + left;
        const absTop = cRect.top + top;
        
        // Clamp to keep notepad visible with 50px minimum on edges
        const minVisible = 50;
        const taskbarTop = window.innerHeight - 40;
        
        const clampedAbsLeft = Math.max(-w + minVisible, Math.min(absLeft, window.innerWidth - minVisible));
        const clampedAbsTop = Math.max(-h + minVisible, Math.min(absTop, taskbarTop - h));
        
        // Convert back to relative position
        left = clampedAbsLeft - cRect.left;
        top = clampedAbsTop - cRect.top;
        
        target.style.left = left + 'px';
        target.style.top = top + 'px';
        e.preventDefault();
    }

    function endDrag(){
        if(!dragging) return;
        dragging = false;
        target = null;
        container = null;
        document.body.classList.remove('dragging');
    }

    document.addEventListener('mousedown', startDrag);
    document.addEventListener('touchstart', startDrag, {passive:false});
    document.addEventListener('mousemove', onMove);
    document.addEventListener('touchmove', onMove, {passive:false});
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchend', endDrag);
})();

// RESIZE: enable bottom-right corner resizing (mouse + touch)
(function(){
    let resizing = false;
    let target = null;
    let container = null;
    let startX = 0;
    let startY = 0;
    let startW = 0;
    let startH = 0;
    let startLeft = 0;
    let startTop = 0;
    let resizeDir = 'se';

    function startResize(e){
        const res = e.target.closest && e.target.closest('.notepad .resize-handle');
        if(!res) return;
        target = res.closest('.notepad');
        container = target.closest('.notepad-row');
        if(!target || !container) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = target.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        startX = clientX;
        startY = clientY;
        startW = rect.width;
        startH = rect.height;
        startLeft = rect.left - containerRect.left;
        startTop = rect.top - containerRect.top;
        resizeDir = res.dataset.resize || 'se';
        resizing = true;
        window.__notepadZIndex = (window.__notepadZIndex || 11000) + 1;
        target.style.zIndex = window.__notepadZIndex;
        // ensure absolute
        target.style.position = 'absolute';
        e.preventDefault();
    }

    function onResizeMove(e){
        if(!resizing || !target) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;
        const cRect = container.getBoundingClientRect();
        const minW = 220;
        const minH = 120;

        let newLeft = startLeft;
        let newTop = startTop;
        let newW = startW;
        let newH = startH;

        if(resizeDir.includes('e')) newW = startW + dx;
        if(resizeDir.includes('s')) newH = startH + dy;
        if(resizeDir.includes('w')){
            newW = startW - dx;
            newLeft = startLeft + dx;
        }
        if(resizeDir.includes('n')){
            newH = startH - dy;
            newTop = startTop + dy;
        }

        // clamp minimum size while keeping the opposite edge anchored
        if(newW < minW){
            if(resizeDir.includes('w')) newLeft -= (minW - newW);
            newW = minW;
        }
        if(newH < minH){
            if(resizeDir.includes('n')) newTop -= (minH - newH);
            newH = minH;
        }

        // prevent overlap with taskbar (40px tall, fixed at bottom)
        const taskbarHeight = 40;
        const containerRect = container.getBoundingClientRect();
        const absTop = containerRect.top + newTop;
        const absBottom = absTop + newH;
        const taskbarTop = window.innerHeight - taskbarHeight;
        
        if(absBottom > taskbarTop){
            newH = taskbarTop - absTop;
            if(newH < minH){
                newH = minH;
                newTop = taskbarTop - containerRect.top - minH;
            }
        }
        
        // keep notepad at least partially visible (50px minimum on any edge)
        const minVisible = 50;
        const absLeft = containerRect.left + newLeft;
        
        if(absLeft + newW < minVisible){
            newLeft = minVisible - newW - containerRect.left;
        }
        if(absLeft > window.innerWidth - minVisible){
            newLeft = window.innerWidth - minVisible - containerRect.left;
        }

        target.style.left = `${newLeft}px`;
        target.style.top = `${newTop}px`;
        target.style.width = `${newW}px`;
        target.style.height = `${newH}px`;
        e.preventDefault();
    }

    function endResize(){
        if(!resizing) return;
        resizing = false;
        target = null;
        container = null;
    }

    document.addEventListener('mousedown', startResize);
    document.addEventListener('touchstart', startResize, {passive:false});
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('touchmove', onResizeMove, {passive:false});
    document.addEventListener('mouseup', endResize);
    document.addEventListener('touchend', endResize);
})();

// Keep resize handles present if notepads are recreated/changed.
document.addEventListener('DOMContentLoaded', function(){
    initializeResizeHandles();
});
