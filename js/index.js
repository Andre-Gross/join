document.addEventListener('DOMContentLoaded', function() {
    
    setTimeout(() => {
        document.body.classList.add('fade-out'); 
    }, 1500);

    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2500); 
});
