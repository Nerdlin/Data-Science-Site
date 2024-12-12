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
        fetch('feedback.json')
            .then(response => response.json())
            .then(data => {
                data.push(feedback);
                return data;
            })
            .catch(() => {
                return [feedback];
            })
            .then(updatedData => {
                const jsonData = JSON.stringify(updatedData, null, 2);
                download(jsonData, 'feedback.json', 'application/json');
            });
    }

    function download(content, fileName, contentType) {
        const a = document.createElement('a');
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(a.href);
    }
});