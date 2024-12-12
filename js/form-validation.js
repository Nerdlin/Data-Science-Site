document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        let isValid = true;

        const textFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
        textFields.forEach(field => {
            if (field.value.trim() === '') {
                isValid = false;
                alert(`Поле ${field.name} обязательно для заполнения.`);
            }
        });

        const emailField = form.querySelector('input[type="email"]');
        if (emailField) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(emailField.value)) {
                isValid = false;
                alert('Введите корректный email.');
            }
        }

        if (isValid) {
            alert('Форма успешно отправлена!');
            form.submit();
        }
    });
});

document.addEventListener('DOMContentLoaded', (event) => {
    const form = document.getElementById('feedback-form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        const feedback = {};

        formData.forEach((value, key) => {
            feedback[key] = value;
        });

        saveFeedback(feedback);
    });

    function saveFeedback(feedback) {
        fetch('/submit_feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(feedback)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Отзыв сохранен:', data);
        })
        .catch((error) => {
            console.error('Ошибка при сохранении отзыва:', error);
        });
    }
});