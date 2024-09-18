
document.addEventListener('DOMContentLoaded', (event) => {
    const imageThumbnail = document.getElementById('imageThumbnail');
    const imagePreview = document.getElementById('imagePreview');
    const imageBanner = document.getElementById('image');
    const image = document.getElementById('imageBanner');

    imageThumbnail.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            imagePreview.style.display = 'none';                }
    });
    image.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                imageBanner.src = e.target.result;
                imageBanner.style.display = 'block';
            }
            reader.readAsDataURL(file);
        } else {
            imageBanner.style.display = 'none';
        }
    });
});
