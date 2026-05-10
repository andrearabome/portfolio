(function(){
    const PAGES = {
        'index.html': 'Home',
        'about.html': 'About Me',
        'projects.html': 'Projects'
    };

    let currentPage = window.location.pathname.split('/').pop() || 'index.html';

    function getPageName(){
        const path = window.location.pathname.split('/').pop() || 'index.html';
        return path;
    }

    function normalizePageName(page){
        if(!page || page === '') return 'index.html';
        if(!page.endsWith('.html')) return page + '.html';
        return page;
    }

    function createHistoryState(page){
        return {
            page: normalizePageName(page),
            timestamp: Date.now()
        };
    }

    async function loadPageContent(page){
        const normalizedPage = normalizePageName(page);
        
        try {
            const response = await fetch(normalizedPage);
            if(!response.ok) throw new Error(`Failed to load ${normalizedPage}`);
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract the notepad-row content from the fetched page
            const newNotepadsRow = doc.querySelector('.notepad-row');
            if(!newNotepadsRow) throw new Error('No notepad-row found in page');
            
            return newNotepadsRow.innerHTML;
        } catch(error){
            console.error('Router error:', error);
            return null;
        }
    }

    async function navigateToPage(page){
        const normalizedPage = normalizePageName(page);
        
        // Don't reload if already on the page
        if(normalizedPage === currentPage) return;
        
        const content = await loadPageContent(normalizedPage);
        if(!content) return;
        
        // Replace notepad-row content
        const notepadsRow = document.querySelector('.notepad-row');
        if(notepadsRow){
            notepadsRow.innerHTML = content;
        }
        
        // Update current page tracker
        currentPage = normalizedPage;
        
        // Update browser history
        const state = createHistoryState(normalizedPage);
        const url = normalizedPage === 'index.html' ? './' : normalizedPage;
        window.history.pushState(state, '', url);
        
        // Reinitialize notepad handlers for new content
        if(window.initializeResizeHandles){
            window.initializeResizeHandles();
        }

        // Clear existing taskbar buttons and recreate them for the new notepads
        const taskbarCenter = document.querySelector('.taskbar-center');
        if(taskbarCenter){
            // remove previous buttons
            taskbarCenter.innerHTML = '';
        }

        if(window.initNotepadTaskbar){
            // small delay to mirror initial behavior
            setTimeout(window.initNotepadTaskbar, 50);
        }
        
        // Place notepads randomly (they're hidden by default anyway)
        if(window.placeNotepadsRandomly){
            window.placeNotepadsRandomly();
        }
        
        // Reset the tab reminder timer
        if(window.resetTabReminder){
            window.resetTabReminder();
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }

    function setupNavigationLinks(){
        document.addEventListener('click', function(e){
            // Check if clicked element is a navigation link
            const link = e.target.closest('a[href]');
            if(!link) return;
            
            const href = link.getAttribute('href');
            
            // Only handle internal page navigation
            if(href === 'index.html' || href === 'about.html' || href === 'projects.html' || href === './'){
                e.preventDefault();
                navigateToPage(href);
            }
        });
    }

    function handleHistoryPopState(event){
        if(event.state && event.state.page){
            const page = event.state.page;
            navigateToPage(page);
        }
    }

    document.addEventListener('DOMContentLoaded', function(){
        // Set up navigation link interception
        setupNavigationLinks();
        
        // Handle back/forward button
        window.addEventListener('popstate', handleHistoryPopState);
        
        // Initialize the current page in history
        const initialState = createHistoryState(currentPage);
        window.history.replaceState(initialState, '');
    });

    // Expose resetTabReminder function for tabreminder.js to call
    window.resetTabReminder = function(){
        // Notify tabreminder.js to reset
        const event = new CustomEvent('pagechange');
        document.dispatchEvent(event);
    };
})();
