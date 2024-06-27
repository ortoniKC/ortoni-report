// Functions to open and close a modal
function openModal() {
  let modal = document.getElementsByClassName("modal")[0];
  modal.classList.add("is-active")
}

function closeModal() {
  let modal = document.getElementsByClassName("modal")[0];
  modal.classList.remove("is-active")
}
// Add a keyboard event to close all modals
document.addEventListener('keydown', (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});