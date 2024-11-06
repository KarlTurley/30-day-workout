let deferredPrompt;

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("beforeinstallprompt event fired"); // Debugging log
  e.preventDefault();
  deferredPrompt = e;

  // Show the install modal
  showInstallModal();
});

function showInstallModal() {
  console.log("Showing install modal"); // Debugging log
  const modal = document.getElementById("installModal");
  if (modal) {
    modal.style.display = "flex";
  } else {
    console.log("Modal element not found"); // Log if modal element is missing
  }
}

function closeInstallModal() {
  console.log("Closing install modal"); // Debugging log
  const modal = document.getElementById("installModal");
  if (modal) {
    modal.style.display = "none";
  }
}

// Handle the "Install App" button in the modal
document.addEventListener("DOMContentLoaded", () => {
  const installAppButton = document.getElementById("installAppButton");
  
  if (installAppButton) {
    installAppButton.addEventListener("click", () => {
      console.log("Install button clicked"); // Debugging log
      if (deferredPrompt) {
        deferredPrompt.prompt(); // Show the install prompt
        deferredPrompt.userChoice.then((choiceResult) => {
          console.log("User choice:", choiceResult.outcome); // Log user choice
          deferredPrompt = null;
          closeInstallModal();
        });
      }
    });
  } else {
    console.log("Install button not found"); // Log if install button is missing
  }
  
  // Close button in the modal
  const closeModalButton = document.querySelector(".modal .close");
  if (closeModalButton) {
    closeModalButton.addEventListener("click", closeInstallModal);
  } else {
    console.log("Close button not found"); // Log if close button is missing
  }
});
