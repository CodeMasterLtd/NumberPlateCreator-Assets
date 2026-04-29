let devMode = false;
let vurl;

window.addEventListener("load", () => {
  const savedTheme = localStorage.getItem("theme");
  const savedRepost = localStorage.getItem("reposted");
  const savedVerified = localStorage.getItem("verified");

  document.body.classList.toggle("dark", savedTheme === "dark");

  const repostedOn = savedRepost !== "none";
  const verifiedOn = savedVerified !== "none";

  const repostEl = document.getElementById("reposted");
  const verifiedEl = document.getElementById("verified");

  repostEl.style.display = repostedOn ? "flex" : "none";
  verifiedEl.style.display = verifiedOn ? "inline" : "none";

  syncButtons(repostedOn, verifiedOn);
  loadViews();
  updateTweetTime();

  setInterval(loadViews, 30000);
  setInterval(updateTweetTime, 60000);
});

function isDevMode() {
  if (devMode == true) {
        vurl = "dev.criptweet.cripdevelopments";
  } else {
        vurl = "criptweet.cripdevelopments";
  }  
  return vurl;
}

function syncButtons(repostedOn, verifiedOn) {
  const repostBtn = document.getElementById("btnRepost");
  const verifiedBtn = document.getElementById("btnVerified");
  const themeBtn = document.getElementById("btnTheme");

  repostBtn.classList.toggle("active", repostedOn);
  verifiedBtn.classList.toggle("active", verifiedOn);

  themeBtn.classList.toggle("active", document.body.classList.contains("dark"));
}

const modal = document.getElementById("instructionsModal");
const openBtn = document.getElementById("openIns");
const closeBtn = document.getElementById("closeIns");

const imageModal = document.getElementById("imageModal");
const guideImage = document.getElementById("guideImage");
const closeImg = document.getElementById("closeImg");
const openGuide = document.getElementById("openGuide");

guideImage.addEventListener("click", () => {
  imageModal.style.display = "flex";
});

// OPEN modal
openGuide.addEventListener("click", () => {
  imageModal.style.display = "flex";
});

// CLOSE button
closeImg.addEventListener("click", () => {
  imageModal.style.display = "none";
});

// CLICK outside image closes
imageModal.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
  }
});

// open
openBtn.addEventListener("click", () => {
  modal.style.display = "flex";
});

// close
closeBtn.addEventListener("click", () => {
  modal.style.display = "none";
});

// click outside box to close
modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.style.display = "none";
  }
});

document.getElementById("btnVerified").onclick = function () {
  toggleVerified(this);
};

document.getElementById("btnRepost").onclick = function () {
  toggleReposted(this);
};

document.getElementById("btnTheme").onclick = function () {
  toggleTheme(this);
};

document.getElementById("exportBtn").addEventListener("click", async () => {
  await trackShareView();

  setTimeout(() => {
    generateImage();
  }, 1500);
  setTimeout(() => {
    exportImage();
  }, 2000);
});

// click profile pic → open file picker
document.getElementById("profilePic").addEventListener("click", () => {
  document.getElementById("uploadProfile").click();
});

// click tweet image area → open file picker
document.getElementById("tweetImage").addEventListener("click", () => {
  document.getElementById("uploadImage").click();
});

// UPLOAD PROFILE IMAGE
document.getElementById("uploadProfile").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    document.getElementById("profilePic").src = event.target.result;
  };
  reader.readAsDataURL(e.target.files[0]);
});


// UPLOAD IMAGE
document.getElementById("uploadImage").addEventListener("change", function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    const img = document.getElementById("tweetImage");
    img.src = event.target.result;
    img.style.display = "block";
  };
  reader.readAsDataURL(e.target.files[0]);
});


// EDITOR 
const editor = document.getElementById("tweetText");
let rawText = "";

editor.addEventListener("input", () => {
  rawText = editor.innerText.replace(/\n{2,}/g, "\n\n");
});


// ENTER KEY FIX 
editor.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    // let browser handle it naturally
    return;
  }
});


// FORMAT TEXT
function getFormattedHTML() {
  let text = rawText;

  // escape HTML
  text = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // 🔥 PRESERVE LINE BREAKS
  text = text.replace(/\n/g, "<br>");

  // formatting
  text = text.replace(/\*\*\*(.*?)\*\*\*/g, `<span class="bold">$1</span>`);
  text = text.replace(/\*\*(.*?)\*\*/g, `<span class="bold">$1</span>`);
  text = text.replace(/\*(.*?)\*/g, `<span class="italic">$1</span>`);
  text = text.replace(/@(\w+)/g, `<span class="mention">@$1</span>`);
  text = text.replace(/#(\w+)/g, `<span class="mention">#$1</span>`);

  return text;
}

// PASTE IMAGE SUPPORT
document.addEventListener("paste", function (e) {
  const items = e.clipboardData.items;

  for (let item of items) {
    if (item.type.indexOf("image") !== -1) {
      const file = item.getAsFile();
      const reader = new FileReader();

      reader.onload = function (event) {
        const img = document.getElementById("tweetImage");
        img.src = event.target.result;
        img.style.display = "block";
      };

      reader.readAsDataURL(file);
    }
  }
});


// TOGGLE VERIFIED
function toggleVerified(btn) {
  const el = document.getElementById("verified");
  const isOn = el.style.display !== "none";

  el.style.display = isOn ? "none" : "inline";

  btn.classList.toggle("active", !isOn);

  localStorage.setItem("verified", isOn ? "none" : "inline");
}

// TOGGLE REPOSTED
function toggleReposted(btn) {
  const el = document.getElementById("reposted");
  const isOn = el.style.display !== "none";

  el.style.display = isOn ? "none" : "flex";

  btn.classList.toggle("active", !isOn);

  localStorage.setItem("reposted", isOn ? "none" : "flex");
}


// TOGGLE THEME
function toggleTheme(btn) {
  const isDark = document.body.classList.toggle("dark");

  btn.classList.toggle("active", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// UPDATE TWEET TIME
function updateTweetTime() {
  const el = document.getElementById("tweetTime");

  const now = new Date();

  let hours = now.getHours();
  let minutes = now.getMinutes().toString().padStart(2, "0");

  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;

  const day = now.getDate().toString().padStart(2, "0");
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const year = now.getFullYear();

  el.textContent = `${hours}:${minutes}${ampm} · ${day}/${month}/${year}`;
}


// EXPORT IMAGE

function generateImage() {
  const textBox = document.getElementById("tweetText");
  textBox.innerHTML = getFormattedHTML();
}


function exportImage() {
  const tweet = document.getElementById("tweet");

  const textBox = document.getElementById("tweetText");

  textBox.innerHTML = getFormattedHTML();

  html2canvas(tweet, {
    backgroundColor: null,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "cripTweet.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
}

async function trackShareView() {
  try {
    const vurl = isDevMode();

    await fetch(`https://api.counterapi.dev/v1/${vurl}/up`);
  } catch (err) {
    console.error("View counter error:", err);
  }
}

async function loadViews() {
  const viewsEl = document.getElementById("views");
  const viewstxtEl = document.getElementById("viewsTxt");

  try {
    const vurl = isDevMode();

    const res = await fetch(`https://api.counterapi.dev/v1/${vurl}/visits-alltime/up`);
    const data = await res.json();

    const count = data?.count ?? 0;

    const format = (n) => {
      if (n >= 1_000_000) return (n/1_000_000).toFixed(1) + "M";
      if (n >= 1000) return (n/1000).toFixed(1) + "K";
      return n;
    };

    const formatTxt = (n) => {
      if (n <= 1) return " View";
      if (n >= 1) return " Views";
      return n;
    };

    viewsEl.textContent = format(count);
    viewsEl.title = "All-time Users";
    viewstxtEl.textContent = formatTxt(count);

  } catch (e) {
    console.error("View load error:", e);
    viewsEl.textContent = "0";
  }
}