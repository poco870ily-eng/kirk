const SECRET_KEY = "vG7#z9!Lp2@Qw8^Xr6&Nj4*Ta0%Yb1$F";
const ws = new WebSocket("wss://ja-i04k.onrender.com");

const statusEl = document.getElementById("status");
const eventsEl = document.getElementById("events");

function xor(a, b) {
  return a ^ b;
}

function decryptData(base64Text, key = SECRET_KEY) {
  const bytes = Uint8Array.from(atob(base64Text), c => c.charCodeAt(0));
  const keyBytes = Uint8Array.from(key, c => c.charCodeAt(0));

  let result = "";
  for (let i = 0; i < bytes.length; i++) {
    const temp = xor(bytes[i], keyBytes[i % keyBytes.length]);
    const decrypted = xor(temp, i % 256);
    result += String.fromCharCode(decrypted);
  }
  return result;
}

ws.onopen = () => {
  statusEl.textContent = "Connected";
};

ws.onclose = () => {
  statusEl.textContent = "Disconnected";
};

ws.onmessage = (event) => {
  try {
    const wrapper = JSON.parse(event.data);
    if (!wrapper.encrypted) return;

    const decrypted = decryptData(wrapper.data);
    const decoded = JSON.parse(decrypted);

    renderEvents(decoded);
  } catch (e) {
    console.error(e);
  }
};

function renderEvents(data) {
  eventsEl.innerHTML = "";

  if (!data.events) return;

  data.events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "event";

    div.innerHTML = `
      <div>
        <b>${ev.petName || "Unknown"}</b><br>
        Gen: ${ev.generation}<br>
        Players: ${ev.players}
      </div>
      <button onclick="copyJob('${ev.jobId}')">JOIN</button>
    `;

    eventsEl.appendChild(div);
  });
}

function copyJob(jobId) {
  navigator.clipboard.writeText(jobId);
  alert("JobId copied");
}
