// Functions to open and close a modal
function openModal() {
  let modal = document.querySelector("#testImage");
  modal.classList.add("is-active")
}
function openVideo(){
 let modal = document.querySelector("#testVideo");;
  modal.classList.add("is-active")
}
function closeVideo(){
  let modal = document.querySelector("#testVideo");;
   modal.classList.remove("is-active")
 }
function closeModal() {
  let modal = document.querySelector("#testImage");;
  modal.classList.remove("is-active")
}
// Add a keyboard event to close all modals
document.addEventListener('keydown', (event) => {
  if (event.key === "Escape") {
    closeModal();
  }
});