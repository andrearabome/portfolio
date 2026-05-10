(function(){
    const PAGE_MAP = {
        '': 'index.html',
        'home': 'index.html',
        'about': 'about.html',
        'projects': 'projects.html'
    };

    let currentPage = null;
    let isNavigating = false;

    function getPageFromHash(){
        const hash = window.location.hash.slice(1).toLowerCase() || '';
        return PAGE_MAP[hash] || 'index.html';
    }

    async function loadPageContent(page){
        try {
            const response = await fetch(page);
            if(!response.ok) throw new Error('Failed to load ' + page);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            const newNotepadsRow = doc.querySelector('.notepad-row');
            if(!newNotepadsRow) throw new Error('No notepad-row found in page');
            
            return newNotepadsRow.innerHTML;
        } catch(error){
            console.error('Router error:', error);
            return null;
        }
    }
    async function navigateToPage(page){
        if(isNavigating || page === currentPage) return;
        
        isNavigating = true;
        const content = await loadPageContent(page);
        if(!content){
            isNavigating = false;
            return;
        }
        
        // Disable transitions to prevent color flash
        const root = document.documentElement;
        root.classList.add('disable-transitions');
        
        // Replace notepad-row content
        const notepadsRow = document.querySelector('.notepad-row');
        if(notepadsRow){
            notepadsRow.innerHTML = content;
        }
        
        // Re-enable transitions after DOM paint
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                root.classList.remove('disable-transitions');
            });
        });
        
        currentPage = page;
        
        // Reinitialize all notepad handlers and taskbar
        if(window.initializeResizeHandles){
            window.initializeResizeHandles();
        }
        
        if(window.initNotepadTaskbar){
            window.initNotepadTaskbar();
        }
        
        if(window.placeNotepadsRandomly){
            window.placeNotepadsRandomly();
        }
        
        if(window.resetTabReminder){
            const event = new CustomEvent('pagechange');
            document.dispatchEvent(event);
        }
        
        window.scrollTo(0, 0);
        isNavigating = false;
    }

    function handleHashChange(){
        const newPage = getPageFromHash();
        if(newPage !== currentPage){
            navigateToPage(newPage);
        }
    }

    document.addEventListener('DOMContentLoaded', function(){
        currentPage = getPageFromHash();
        navigateToPage(currentPage);
        
        window.addEventListener('hashchange', handleHashChange);
    });
})();
