
const FORM_ENDPOINT = "https://formspree.io/f/mbgopwog";

const stepAsk  = document.getElementById("step-ask");
const stepForm = document.getElementById("step-form");
const stepDone = document.getElementById("step-done");
const choices  = document.getElementById("choices");
const yesBtn   = document.getElementById("yes");
const noBtn    = document.getElementById("no");
const hint     = document.getElementById("hint");
const form     = document.getElementById("date-form");
const errorEl  = document.getElementById("error");
const sendBtn  = document.getElementById("send");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hints = [
  "Hmm, that button seems broken.",
  "Are you sure? Try again.",
  "The Yes button is looking bigger…",
  "Okay, the No button is very shy today.",
  "Just press Yes. Sabe que usted quiere.",
  "Fine, I'll keep making Yes bigger."
];
let tries = 0;

/* Make the "No" button dodge, and make "Yes" grow each time. */
function dodge() {
  tries++;
  hint.textContent = hints[Math.min(tries - 1, hints.length - 1)];
  document.documentElement.style.setProperty("--yes-scale", Math.min(1 + tries * 0.12, 1.7));

  if (reduceMotion) return; // keep it still for people who prefer less motion

  const box = choices.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();
  const maxX = box.width - btn.width;
  const maxY = box.height - btn.height;

  noBtn.classList.add("dodging");
  noBtn.style.left = Math.random() * maxX + "px";
  noBtn.style.top  = Math.random() * maxY + "px";
}

noBtn.addEventListener("pointerenter", dodge);
noBtn.addEventListener("pointerdown", (e) => { e.preventDefault(); dodge(); });
noBtn.addEventListener("click", dodge); // keyboard users

yesBtn.addEventListener("click", () => {
  stepAsk.hidden = true;
  stepForm.hidden = false;
  form.elements.name.focus();
});

/* Don't allow picking a date in the past. */
form.elements.date.min = new Date().toISOString().split("T")[0];

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.textContent = "";

  if (!form.checkValidity()) {
    errorEl.textContent = "Please fill in your name, an activity, and a day.";
    return;
  }
  if (form.elements._gotcha.value) return; // bot caught by the honeypot

  if (FORM_ENDPOINT.includes("YOUR_FORM_ID")) {
    errorEl.textContent = "Form isn't connected yet: add your Formspree URL in script.js.";
    return;
  }

  sendBtn.disabled = true;
  sendBtn.textContent = "Sending…";

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: new FormData(form)
    });
    if (!res.ok) throw new Error("Request failed");
    stepForm.hidden = true;
    stepDone.hidden = false;
  } catch (err) {
    errorEl.textContent = "That didn't send. Check your connection and try again.";
    sendBtn.disabled = false;
    sendBtn.textContent = "Send my answer";
  }
});
