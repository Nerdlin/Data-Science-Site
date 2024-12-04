let arrowTimeout;

function showArrows() {
    document.body.classList.add('show-arrows');
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => {
        document.body.classList.remove('show-arrows');
    }, 3000);
}

document.addEventListener('mousemove', showArrows);

function navigateToPrevious() {
    window.location.href = 'features.html';
}

function navigateToNext() {
    window.location.href = 'skills.html';
}

