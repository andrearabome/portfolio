/* Simple theme toggle with localStorage persistence */
(function(){
    const CLASS = 'dark';

    function applyTheme(isDark){
        document.documentElement.classList.toggle(CLASS, isDark);
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

        // If there is a separate theme toggle button (theme.js supports both ids)
        document.querySelectorAll('#theme-toggle').forEach(btn=>{
            btn.textContent = isDark ? '☀️' : '🌑';
        });

        // Update start menu label and icon if present.
        const menuToggle = document.getElementById('start-theme-toggle');
        if(menuToggle){
            const label = menuToggle.querySelector('.label');
            if(label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';

            const icon = menuToggle.querySelector('.icon');
            if(icon) icon.textContent = isDark ? '☀️' : '🌑';
        }
    }

    const saved = localStorage.getItem('theme');
    if(saved === 'dark') applyTheme(true);

    document.addEventListener('click', (e)=>{
        const t = e.target;

        if(t && t.id === 'theme-toggle'){
            const isDark = !document.documentElement.classList.contains(CLASS);
            applyTheme(isDark);
        }

        if(t && (t.id === 'start-theme-toggle' || (t.closest && t.closest('#start-theme-toggle')))){
            e.preventDefault();
            const isDark = !document.documentElement.classList.contains(CLASS);
            applyTheme(isDark);
        }
    });

    // Set initial label/icon state on DOM ready
    document.addEventListener('DOMContentLoaded', ()=>{
        const isDark = document.documentElement.classList.contains(CLASS);

        document.querySelectorAll('#theme-toggle').forEach(btn=>{
            btn.textContent = isDark ? '☀️' : '🌑';
        });

        const menuToggle = document.getElementById('start-theme-toggle');
        if(menuToggle){
            const label = menuToggle.querySelector('.label');
            if(label) label.textContent = isDark ? 'Light Mode' : 'Dark Mode';

            const icon = menuToggle.querySelector('.icon');
            if(icon) icon.textContent = isDark ? '☀️' : '🌑';
        }
    });
})();
