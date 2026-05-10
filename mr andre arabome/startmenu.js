// Start menu toggler and click-outside close
(function(){
    function toggleMenu(){
        const menu = document.getElementById('start-menu');
        const isOpen = menu.classList.toggle('open');
        menu.setAttribute('aria-hidden', !isOpen);
        document.body.classList.toggle('start-menu-open', isOpen);
        if(isOpen){
            menu.style.zIndex = '40000';
        }
    }

    document.addEventListener('click', (e)=>{
        const startBtn = document.getElementById('start-button');
        const menu = document.getElementById('start-menu');
        if(!startBtn || !menu) return;

        if(e.target === startBtn || startBtn.contains(e.target)){
            e.preventDefault();
            toggleMenu();
            return;
        }

        // Close when clicking outside menu
        if(menu.classList.contains('open') && !menu.contains(e.target)){
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden','true');
            document.body.classList.remove('start-menu-open');
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e)=>{
        const menu = document.getElementById('start-menu');
        if(e.key === 'Escape' && menu && menu.classList.contains('open')){
            menu.classList.remove('open');
            menu.setAttribute('aria-hidden','true');
            document.body.classList.remove('start-menu-open');
        }
    });
})();
