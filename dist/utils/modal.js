const isOpenClass = "modal-is-open";
const openingClass = "modal-is-opening";
const closingClass = "modal-is-closing";
const scrollbarWidthCssVar = "--pico-scrollbar-width";
const animationDuration = 400; // ms
let visibleModal = null;

// Toggle modal
function toggleModal(event) {
  event.preventDefault();
  const modal = document.getElementById(event.currentTarget.dataset.target);
  if (!modal) return;
  if (modal) {
    if (modal.open) {
      closeModal(modal);
    } else {
      openModal(modal);
    }
  }
}

// Open modal
function openModal(modal) {
  const html = document.documentElement;
  const scrollbarWidth = getScrollbarWidth();
  if (scrollbarWidth) {
    html.style.setProperty(scrollbarWidthCssVar, `${scrollbarWidth}px`);
  }
  html.classList.add(isOpenClass, openingClass);
  setTimeout(function () {
    visibleModal = modal;
    html.classList.remove(openingClass);
  }, animationDuration);
  modal.showModal();
}

// Close modal
function closeModal(modal) {
  visibleModal = null;
  const html = document.documentElement;
  html.classList.add(closingClass);
  setTimeout(function () {
    html.classList.remove(closingClass, isOpenClass);
    html.style.removeProperty(scrollbarWidthCssVar);
    modal.close();
  }, animationDuration);
}

// Close with a click outside
document.addEventListener("click", function (event) {
  if (visibleModal === null) return;
  const modalContent = visibleModal.querySelector("article");
  const isClickInside = modalContent.contains(event.target);
  if (!isClickInside) {
    closeModal(visibleModal);
  }
});

// Close with Esc key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && visibleModal) {
    closeModal(visibleModal);
  }
});

// Get scrollbar width
function getScrollbarWidth() {
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  return scrollbarWidth;
}

// Is scrollbar visible
function isScrollbarVisible() {
  return document.body.scrollHeight > screen.height;
}
