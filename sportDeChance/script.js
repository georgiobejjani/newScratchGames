const scratchCard = document.querySelector(".scratch-card");
const canvas = document.querySelector(".scratch-area");
const ctx = canvas.getContext("2d");
const revealThreshold = 0.5;
let isDrawing = false;
let ballArray = [];
let animationFrameId;
let apiEndpoint = 'https://api.test-ci.moobifun.com/'
let currentFrame = 0;
let confettiElements = [];
canvas.width = 240;
canvas.height = 233;
this.count = 0;
this.availableTickets = 0;
this.scratchType = 8;
this.winningValue = "";
this.myArray = [];
this.ticketId = 0;
this.targetScore = 0;
let isRequestInProgress = false;
this.overlayCleared = false;
this.sound = true;
const urlParams = new URLSearchParams(window.location.search);
this.token = urlParams.get("token");

const scratchImage = new Image();
scratchImage.src = "./assets/scratchedArea.png";

disableAndDimButton(document.getElementById("scratchAllButton"));
disableAndDimButton(document.getElementById("playAgainButton"));
const WinningSound = new Audio("./assets/winning-sound.mp3");
const losingSound = new Audio("./assets/loosing-sound.mp3");
const pixelRatio = window.devicePixelRatio || 1;
canvas.width = canvas.clientWidth * pixelRatio;
canvas.height = canvas.clientHeight * pixelRatio;

function createTexture() {
  if (!canvas) {
    console.error("Canvas element with class 'scratch-area' not found.");
    return;
  }
  canvas.width = scratchImage.width;
  canvas.height = scratchImage.height;
  const context = canvas.getContext("2d");
  context.globalCompositeOperation = "source-over";
  context.drawImage(scratchImage, 0, 0);
  context.globalCompositeOperation = "destination-out";
}

scratchImage.onload = function () {
  createTexture();
};

function checkIfRevealed() {
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;
  let transparentPixels = 0;

  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] === 0) {
      transparentPixels++;
    }
  }

  const totalPixels = canvas.width * canvas.height;
  const revealPercentage = transparentPixels / totalPixels;

  if (revealPercentage >= revealThreshold) {
    clearCanvas();
  }
}

document
  .getElementById("scratchAllButton")
  .addEventListener("click", function () {
    clearCanvas();
  });

document
  .getElementById("playAgainButton")
  .addEventListener("click", function () {
    playAgainFct();
  });

function clearCanvas() {
  window.top.postMessage("ScrollBehaviour", "*");
  disableAndDimButton(document.getElementById("scratchAllButton"));
  document.getElementById("replay-label").style.display = "none";
  if (this.availableTickets > 1) {
    document.getElementById("playAgainButton").style.display = "block";
    document.getElementById("playAgain-custom-loader").style.display = "block";
  }

  this.overlayCleared = true;
  playTicket(this.ticketId);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (this.winningValue !== "losing") {
    startScoreAnimation(this.targetScore);
  } else {
    loosingAnimation();
  }
}

canvas.addEventListener("mousedown", () => {
  if (this.availableTickets > 0) {
    if (!this.overlayCleared) {
      isDrawing = true;
      window.top.postMessage("noScrollBehaviour", "*");
    }
  }
});

canvas.addEventListener("mouseup", () => {
  window.top.postMessage("ScrollBehaviour", "*");
  if (this.availableTickets > 0) {
    if (!this.overlayCleared) {
      isDrawing = false;
      checkIfRevealed();
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  const bounds = canvas.getBoundingClientRect();
  if (this.availableTickets > 0) {
    console.log("moving", this.overlayCleared);

    if (!this.overlayCleared) {
      const x = (e.clientX - bounds.left) * pixelRatio;
      const y = (e.clientY - bounds.top) * pixelRatio;
      if (isDrawing) {
        clearOverlay(x, y);
      }
      checkIfRevealed();
    }
  }
});

canvas.addEventListener("touchstart", () => {
  if (this.availableTickets > 0) {
    if (!this.overlayCleared) {
      window.top.postMessage("noScrollBehaviour", "*");
      isDrawing = true;
    }
  }
});

canvas.addEventListener("touchend", () => {
  window.top.postMessage("ScrollBehaviour", "*");
  if (this.availableTickets > 0) {
    if (!this.overlayCleared) {
      isDrawing = false;
      checkIfRevealed();
    }
  }
});

canvas.addEventListener("touchmove", (e) => {
  const bounds = canvas.getBoundingClientRect();
  if (this.availableTickets > 0) {
    if (!this.overlayCleared) {
      if (isDrawing) {
        const touch = e.touches[0];
        const x = (touch.clientX - bounds.left) * pixelRatio;
        const y = (touch.clientY - bounds.top) * pixelRatio;
        clearOverlay(x, y);
      }
      checkIfRevealed();
    }
  }
});

document.body.addEventListener(
  "touchstart",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);
document.body.addEventListener(
  "touchend",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);
document.body.addEventListener(
  "touchmove",
  function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  },
  { passive: false }
);

function clearOverlay(x, y) {
  if (this.availableTickets > 0 && !this.overlayCleared) {
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

const counter = {
  count: 0,

  updateCountDisplay: function () {
    document.getElementById("count").textContent = this.count;
  },

  add: function () {
    console.log("hi");
    this.count += 1;
    this.updateCountDisplay();
  },

  remove: function () {
    console.log("hi");
    if (this.count === 0) {
      return;
    } else {
      this.count -= 1;
    }
    this.updateCountDisplay();
  },

  resetCount: function () {
    this.count = 0;
    this.updateCountDisplay();
  },
};

document.getElementById("add").addEventListener("click", function () {
  counter.add();
});

document.getElementById("remove").addEventListener("click", function () {
  counter.remove();
});

document.getElementById("buy").addEventListener("click", function () {
  buy();
});

function onBuyScratch(number) {
  showLoaderInsideButton(document.getElementById("buy"));
  fetch(
    `${apiEndpoint}scratch-api/tickets?isWallet=true&language=en`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: this.token,
        type: this.scratchType,
        numberOfTickets: number,
        gameType: this.scratchType,
      }),
    }
  )
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(function (response) {
      window.top.postMessage("called", "*");
      hideLoaderInsideButton(document.getElementById("buy"));
      if (response.status === 0 || response.status === 4) {
        openPopup();
        document.getElementById("dialog-content").innerHTML = response.message;
        console.log("noooooooooo", response.message, response.status);
      } else {
        document.getElementById("sucessBuy").classList.remove("hidden");
        setTimeout(function () {
          document.getElementById("sucessBuy").classList.add("hidden");
        }, 3000);
        getUnplayed();
      }
      if (this.availableTickets === 0 && !this.overlayCleared) {
        console.log("entered");
        fetchDataFromAPI();
      }
    })
    .catch(function (error) {
      console.error("Fetch error: " + error.message);
    });
}

function getUnplayed() {
  let token = this.token;
  let type = this.scratchType;
  let pagesize = 1000;
  let pagenb = "0&isFinished=0";
  let url = `${apiEndpoint}scratch-api/tokens/${token}/tickets?Type=${type}&PageNumber=${pagenb}&PageSize=${pagesize}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      if (response.status == 1 && response.tickets != null) {
        this.availableTickets = response.numberOfTickets;
        const availableTicketsElement =
          document.getElementById("availableTickets");
        availableTicketsElement.textContent = this.availableTickets;
        document.getElementById("playAgain-custom-loader").style.display =
          "none";
        document.getElementById("replay-label").style.display = "block";
        if (response.numberOfTickets > 0 && this.overlayCleared) {
          enableAndRestoreButton(document.getElementById("playAgainButton"));
          document
            .getElementById("playAgainButton")
            .classList.add("blinking-button");
        }
      } else {
        console.log(response);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

window.addEventListener("load", function () {
  fetchDataFromAPI();
});

function fetchDataFromAPI() {
  if (this.token) {
    let token = this.token;
    let type = this.scratchType;
    let pagesize = 1000;
    let pagenb = "0&isFinished=0";
    let url = `${apiEndpoint}scratch-api/tokens/${token}/tickets?Type=${type}&PageNumber=${pagenb}&PageSize=${pagesize}`;
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((response) => {
        if (response.status === 1 && response.tickets.length > 0) {
          if (response.numberOfTickets > 0 && !this.overlayCleared) {
            enableAndRestoreButton(document.getElementById("scratchAllButton"));
          }
          console.log("restored", response.numberOfTickets);
          this.targetScore = response.tickets[0].prize;
          console.log(response.tickets[0].ticketValues);
          this.ticketId = response.tickets[0].id;
          this.myArray = response.tickets[0].ticketValues;
          this.winningValue = response.tickets[0].winningValue;
          this.availableTickets = response.numberOfTickets;
          const availableTicketsElement =
            document.getElementById("availableTickets");
          availableTicketsElement.textContent = this.availableTickets;
          createValuesArray(response.tickets[0].ticketValues);
        } else {
          console.log(response);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
}

function getInfos() {
  document.getElementById("ticket-icon").style.display = "none";
  document.getElementById("ticket-custom-loader").style.display = "block";
  let token = this.token;
  let type = this.scratchType;
  let pagesize = 1000;
  let pagenb = 0;
  let url = `${apiEndpoint}scratch-api/tokens/${token}/tickets?Type=${type}&PageNumber=${pagenb}&PageSize=${pagesize}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      document.getElementById("ticket-icon").style.display = "block";
      document.getElementById("ticket-custom-loader").style.display = "none";
      if (response.tickets) {
        let temp = [];
        response.tickets
          .filter((item) => item.ticketState !== "PENDING")
          .map((val, index) => {
            temp.push(val);
          });
        var tableBody = document
          .getElementById("ticketsDialog-content")
          .getElementsByTagName("tbody")[0];
        console.log("resp", temp);
        while (tableBody.firstChild) {
          tableBody.removeChild(tableBody.firstChild);
        }
        temp.forEach(function (item) {
          var row = tableBody.insertRow(tableBody.rows.length);
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);

          cell1.textContent = item.id;
          cell2.textContent = item.purchaseDate;
          cell3.textContent = item.price;
        });
        openTicketPopup();
      } else {
        openPopup();
        document.getElementById("dialog-content").innerHTML = response.message;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function getWinningsInfos() {
  document.getElementById("winnings-icon").style.display = "none";
  document.getElementById("winnings-custom-loader").style.display = "block";
  let token = this.token;
  let type = this.scratchType;
  let pagesize = 1000;
  let pagenb = 0;
  let url = `${apiEndpoint}scratch-api/tokens/${token}/tickets?Type=${type}&isFinished=1&isWinning=true&PageNumber=${pagenb}&PageSize=${pagesize}`;
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      document.getElementById("winnings-icon").style.display = "block";
      document.getElementById("winnings-custom-loader").style.display = "none";
      if (response.tickets) {
        let temp = [];
        response.tickets
          .filter((item) => item.ticketState !== "PENDING")
          .map((val, index) => {
            temp.push(val);
          });
        var tableBody = document
          .getElementById("winningDialog-content")
          .getElementsByTagName("tbody")[0];
        console.log("resp", temp);
        while (tableBody.firstChild) {
          tableBody.removeChild(tableBody.firstChild);
        }
        temp.forEach(function (item) {
          var row = tableBody.insertRow(tableBody.rows.length);
          var cell1 = row.insertCell(0);
          var cell2 = row.insertCell(1);
          var cell3 = row.insertCell(2);

          cell1.textContent = item.id;
          cell2.textContent = item.purchaseDate;
          cell3.textContent = item.prize;
        });
        openWinningPopup();
      } else {
        openPopup();
        document.getElementById("dialog-content").innerHTML = response.message;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function openTicketInfo() {
  getInfos();
}

function openWinningInfo() {
  getWinningsInfos();
}

function playTicket(ticketId) {
  console.log("called");

  fetch(`${apiEndpoint}scratch-api/tickets?language=en`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: this.token,
      gameType: this.scratchType,
      ticketId: ticketId,
    }),
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((response) => {
      console.log("response", response);
      window.top.postMessage("called", "*");
      getUnplayed(scratchType);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function createValuesArray(values) {
  var valuesOnly = [];
  var targetElement = document.getElementById("arrayContainer");
  targetElement.innerHTML = "";
  valuesOnly = values
    .filter(function (obj) {
      return obj.value !== undefined;
    })
    .map(function (obj) {
      return obj.value;
    });

  values.forEach(function (obj) {
    if (obj.value !== undefined) {
      var element;

      if (obj.value === "roue") {
        divElement = document.createElement("div");
        divElement.classList.add("valueWrapper");
        element = document.createElement("img");
        element.classList.add("value-image");
        element.src = "./assets/roue.png";
        divElement.appendChild(element);
      } else {
        divElement = document.createElement("div");
        divElement.classList.add("valueWrapper");
        element = document.createElement("span");
        element.classList.add("value-label");
        element.textContent = obj.value;
        divElement.appendChild(element);
      }

      targetElement.appendChild(divElement);
    }
  });
}

function createLoader() {
  var loader = document.createElement("div");
  loader.classList.add("custom-loader");
  return loader;
}

function showLoaderInsideButton(button) {
  if (!button) {
    console.error("Button element is undefined.");
    return;
  }

  var loader = createLoader();
  button.innerHTML = "";
  button.appendChild(loader);
}

function hideLoaderInsideButton(button) {
  if (!button) {
    console.error("Button element is not found.");
    return;
  }
  button.innerHTML = "acheter";
}

function disableAndDimButton(button) {
  if (button) {
    button.originalStyles = {
      opacity: button.style.opacity || "",
      pointerEvents: button.style.pointerEvents || "",
    };
    button.style.display = "none";
    button.disabled = true;
    button.style.opacity = "0.5";
    button.style.pointerEvents = "none";
  } else {
    console.error("Button element not found.");
  }
}

function enableAndRestoreButton(button) {
  console.log("i am enabled");
  if (button) {
    button.disabled = false;
    button.style.display = "block";
    if (button.originalStyles) {
      button.style.opacity = button.originalStyles.opacity;
      button.style.pointerEvents = button.originalStyles.pointerEvents;
    }
  } else {
    console.error("Button element not found.");
  }
}
function playAgainFct() {
  createTexture();
  this.overlayCleared = false;
  fetchDataFromAPI();
  disableAndDimButton(document.getElementById("playAgainButton"));
  document
    .getElementById("playAgainButton")
    .classList.remove("blinking-button");
  if (this.winningValue !== "losing") {
    stopWinningAnimation();
  } else {
    stopLoosingAnimation();
  }
}

function buy() {
  onBuyScratch(parseFloat(counter.count));
  counter.resetCount();
}

function openPopup() {
  const myDialog = document.getElementById("myDialog");
  myDialog.showModal();
}

function closePopup() {
  const myDialog = document.getElementById("myDialog");
  myDialog.close();
}

function openTicketPopup() {
  const myTicketsDialog = document.getElementById("ticketsDialog");
  myTicketsDialog.showModal();
}

function closeTicketPopup() {
  const myTicketsDialog = document.getElementById("ticketsDialog");
  myTicketsDialog.close();
}

function openHowToPlayPopup() {
  const myDialog = document.getElementById("howToPlayDialog");
  myDialog.showModal();
}

function closeHowToPlayPopup() {
  const myDialog = document.getElementById("howToPlayDialog");
  myDialog.close();
}
function openHowToWinPopup() {
  const myDialog = document.getElementById("howToWinDialog");
  myDialog.showModal();
}

function closeHowToWinPopup() {
  const myDialog = document.getElementById("howToWinDialog");
  myDialog.close();
}

function openWinningPopup() {
  const myTicketsDialog = document.getElementById("winningDialog");
  myTicketsDialog.showModal();
}

function closeWinningPopup() {
  const myTicketsDialog = document.getElementById("winningDialog");
  myTicketsDialog.close();
}

function startScoreAnimation(score) {
  console.log("scorecounter", score);
  const scoreAnimation = document.getElementById("scoreAnimation");
  scoreAnimation.textContent = `${'You win' + "\n" + score}`;
  scoreAnimation.classList.remove("hidden");
  WinningSound.play();
  createConfetti();
}

function createConfetti() {
  const confettiContainer = document.querySelector(".confetti-container");

  confettiElements.forEach((confetti) => {
    confettiContainer.removeChild(confetti);
  });
  confettiElements = [];

  for (let i = 0; i < 200; i++) {
    console.log("i", i);
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 850}px`;
    console.log("i", confetti);
    confetti.style.animationDelay = `${Math.random() * 10}s`;
    confettiContainer.appendChild(confetti);

    confettiElements.push(confetti);
  }
}

function loosingAnimation() {
  losingSound.play();
}

function stopLoosingAnimation() {
  if (losingSound) {
    losingSound.pause();
    losingSound.currentTime = 0;
  }
}

function stopWinningAnimation() {
  const scoreAnimation = document.getElementById("scoreAnimation");
  scoreAnimation.classList.add("hidden");

  WinningSound.pause();
  WinningSound.currentTime = 0;

  confettiElements.forEach((confetti) => {
    confetti.remove();
  });
  confettiElements = [];
}
