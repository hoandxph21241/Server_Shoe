document.addEventListener("DOMContentLoaded", (event) => {
  const actionButton = document.getElementById("actionButton");
  const actionMenu = document.getElementById("actionMenu");
  const imageUpload = document.getElementById("imageUpload");
  const imagePreview = document.getElementById("imagePreview");

  actionButton.addEventListener("click", () => {
    actionMenu.style.display =
      actionMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (
      !actionButton.contains(event.target) &&
      !actionMenu.contains(event.target)
    ) {
      actionMenu.style.display = "none";
    }
  });

  imageUpload.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      // Display a default image when no file is selected
      imagePreview.style.display = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const imageBrand = document.querySelectorAll(".brand-logos");

  imageBrand.forEach((img) => {
    img.addEventListener("load", () => {
      const brandId = img.getAttribute("data-id");
      const notification = document.getElementById(
        `editNotification${brandId}`
      );

      setTimeout(() => {
        if (notification) {
          notification.style.display = "block";
        }
      }, 2000);
    });
  });
});
