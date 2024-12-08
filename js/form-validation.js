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
