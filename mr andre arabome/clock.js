(function(){
    const elId = 'taskbar-clock';
    function pad(n){ return n.toString().padStart(2,'0'); }
    function updateClock(){
        const el = document.getElementById(elId);
        if(!el) return;
        const now = new Date();
        // Use Intl to format according to user's locale and timezone
        try{
            const fmt = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', second: '2-digit' });
            el.textContent = fmt.format(now);
        }catch(e){
            // Fallback
            const hours = now.getHours();
            const minutes = pad(now.getMinutes());
            const seconds = pad(now.getSeconds());
            el.textContent = hours + ':' + minutes + ':' + seconds;
        }
    }
    document.addEventListener('DOMContentLoaded', ()=>{
        updateClock();
        setInterval(updateClock, 1000);
    });
})();
