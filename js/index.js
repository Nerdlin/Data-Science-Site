let arrowTimeout;

export function showArrows() {
    document.body.classList.add('show-arrows');
    clearTimeout(arrowTimeout);
    arrowTimeout = setTimeout(() => {
        document.body.classList.remove('show-arrows');
    }, 3000);
}

document.addEventListener('mousemove', showArrows);

export function navigateToPrevious() {
    window.location.href = 'index.html';
}

export function navigateToNext() {
    window.location.href = 'history.html';
}
