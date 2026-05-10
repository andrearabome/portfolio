(function(){
    const REMINDER_DELAY = 3 * 60 * 1000; // 3 minutes
    let reminderTimeout = null;
    let messageElement = null;

    function createReminderMessage(){
        const message = document.createElement('div');
        message.id = 'tab-reminder';
        message.className = 'tab-reminder flashing';
        message.textContent = 'you might want to check the taskbar mate';
        message.setAttribute('aria-live', 'polite');
        message.setAttribute('role', 'status');
        
        const xpDesktop = document.querySelector('.xp-desktop');
        if(xpDesktop){
            xpDesktop.insertBefore(message, xpDesktop.firstChild);
        } else {
            document.body.insertBefore(message, document.body.firstChild);
        }
        
        return message;
    }

    function showReminder(){
        if(!messageElement){
            messageElement = createReminderMessage();
        }
        messageElement.classList.remove('hidden');
    }

    function hideReminder(){
        if(messageElement){
            messageElement.classList.add('hidden');
        }
    }

    function hasOpenNotepad(){
        const notepads = document.querySelectorAll('.notepad');
        for(let notepad of notepads){
            if(!notepad.classList.contains('hidden') && !notepad.classList.contains('minimized')){
                return true;
            }
        }
        return false;
    }

    function startReminderTimer(){
        // Clear any existing timer
        if(reminderTimeout){
            clearTimeout(reminderTimeout);
        }

        // Set a new timer
        reminderTimeout = setTimeout(function(){
            if(!hasOpenNotepad()){
                showReminder();
            }
        }, REMINDER_DELAY);
    }

    function resetReminder(){
        hideReminder();
        startReminderTimer();
    }

    document.addEventListener('DOMContentLoaded', function(){
        // Create message element
        messageElement = createReminderMessage();
        hideReminder();
        
        // Start the initial timer
        startReminderTimer();

        // Listen for notepad open/close events
        document.addEventListener('click', function(e){
            // Check if a notepad was just opened or closed
            if(e.target.matches('.notepad .controls .close') ||
               e.target.matches('.notepad .controls .min') ||
               e.target.matches('[data-manual-tab]') ||
               e.target.closest('.taskbar-notepad-btn')){
                // Reset the timer on any notepad interaction
                resetReminder();
            }
        });
        // Listen for page navigation (router.js will dispatch this)
        document.addEventListener('pagechange', function(){
            resetReminder();
        });

        // Also monitor visibility changes using MutationObserver
        const observer = new MutationObserver(function(mutations){
            for(let mutation of mutations){
                if(mutation.type === 'attributes' && mutation.attributeName === 'class'){
                    const target = mutation.target;
                    if(target.classList.contains('notepad')){
                        // Check if any notepad is now visible and not hidden
                        if(!hasOpenNotepad()){
                            // All notepads are hidden, show the reminder if timer has expired
                            if(reminderTimeout === null){
                                showReminder();
                            }
                        } else {
                            // A notepad was opened, reset the timer
                            resetReminder();
                        }
                    }
                }
            }
        });

        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    });
})();
