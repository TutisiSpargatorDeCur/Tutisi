// INTRO ANIMATION
gsap.from("#intro h1", {
  opacity: 0,
  scale: 0.8,
  duration: 1
});

gsap.from("#intro p", {
  opacity: 0,
  delay: 0.5
});

gsap.to("#intro", {
  opacity: 0,
  delay: 2,
  duration: 1,
  onComplete: () => {
    document.getElementById("intro").style.display = "none";
    gsap.to("#main", { opacity: 1 });
  }
});

// LANGUAGE SWITCH
let currentLang = "ro";
const toggle = document.getElementById("langToggle");

toggle.addEventListener("click", () => {
  currentLang = currentLang === "ro" ? "en" : "ro";
  toggle.innerText = currentLang === "ro" ? "EN" : "RO";

  document.querySelectorAll("[data-ro]").forEach(el => {
    el.innerText = el.dataset[currentLang];
  });
});
