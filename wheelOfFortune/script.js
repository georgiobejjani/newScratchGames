//Settings
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const spinButton = document.getElementById("spinButton");
canvas.width = parseFloat(window.getComputedStyle(canvas).getPropertyValue('width'));
canvas.height = parseFloat(window.getComputedStyle(canvas).getPropertyValue('height'));
const playAgainButton = document.getElementById("playAgainButton");
const arrow = document.getElementById("arrow");
let apiEndpoint = "https://api.test-ci.moobifun.com/";
this.scratchType = 5;
const urlParams = new URLSearchParams(window.location.search);
this.token = urlParams.get("token");
const toRad = (1 / 180) * Math.PI;
let rotationAngle = 0;
this.spinning = false;
let arrowAnimationStep = 1;
this.spinToValue = '';
this.spinned = false;
this.ticketsToPlay = 0;
let confettiElements = [];
//Assets
const spinSound = new Audio("./assets/images/spinSound.mp3");
const wheelImage = new Image();
const WinningSound = new Audio("./assets/images/winning-sound.mp3");
const losingSound = new Audio("./assets/images/loosing-sound.mp3");
wheelImage.src = "./assets/images/wheel.png";
wheelImage.onload = () => {
  ctx.drawImage(wheelImage, 0, 0, canvas.width, canvas.height);
};

//--> Logical Part

//Spin sound play
function playSpinSound() {
  spinSound.currentTime = 0;
  spinSound.play();
}

//add remove tickets
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

function buy() {
  onBuyScratch(parseFloat(counter.count));
  counter.resetCount();
}

//Lights animationfunction
function lightAnimation() {
  const lightsContainer = document.querySelector(".lights");
  const numLights = 15;
  const delay = 100;
  for (let i = 0; i < numLights; i++) {
    setTimeout(() => {
      const light = document.createElement("div");
      light.classList.add("light");
      const angle = (360 / numLights) * i;
      const x = Math.cos((angle * Math.PI) / 180) * 50 + 48;
      const y = Math.sin((angle * Math.PI) / 180) * 50 + 48;
      light.style.left = x + "%";
      light.style.top = y + "%";
      lightsContainer.appendChild(light);
    }, i * delay);
  }
}


const wheel = {
  sections: [
    {
      number: "Prize 1",
      color: "#FF4136",
      value: "STW1"
    },
    {
      number: "Prize 2",
      color: "#0074D9",
      value: "STW2"
    },
    {
      number: "Prize 3",
      color: "#2ECC40",
      value: "losing"
    },
    {
      number: "Prize 4",
      color: "#FFDC00",
      value: "STW4"
    },
    {
      number: "Prize 5",
      color: "#FF851B",
      value: "STW5"
    },
    {
      number: "Prize 6",
      color: "#B10DC9",
      value: "STW6"
    },
    {
      number: "Prize 7",
      color: "#DC9",
      value: "STW7"
    },
    {
      number: "Prize 8",
      color: "#000000",
      value: "STW3"
    },
  ],
  centerX: canvas.width / 2,
  centerY: canvas.height / 2,
  radius: canvas.width / 2,
  startAngle: 0,
  draw() {
    const angle = 360 / this.sections.length;
    const textRadius = this.radius / 2;

    for (let i = 0; i < this.sections.length; i++) {
      const textAngle = angle * i + angle / 2;
      const sectionCenterAngle = this.startAngle + i * angle + angle / 2;
      const x =
        this.centerX + Math.cos(sectionCenterAngle * toRad) * textRadius;
      const y =
        this.centerY + Math.sin(sectionCenterAngle * toRad) * textRadius;

      ctx.beginPath();
      ctx.moveTo(this.centerX, this.centerY);
      ctx.arc(
        this.centerX,
        this.centerY,
        this.radius,
        i * angle * toRad,
        (i + 1) * angle * toRad
      );
      ctx.closePath();
      ctx.fillStyle = this.sections[i].color;
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "white";
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.sections[i].number, x, y);
    }
  },
};

function createSpinnerIndex(winningValue) {
  console.log('testWinningValue', winningValue)
  this.spinToValue = wheel.sections.findIndex(section => section.value === winningValue);
}

//Spin Wheel
function spinWheel() {
  if (this.spinning) return;
  this.spinned = true;
  playTicket(this.ticketId);
  playSpinSound();

  const finalAngle =
    -90 -
    ((360 / wheel.sections.length) * this.spinToValue +
      Math.random() * (360 / wheel.sections.length - 5)) +
    360 * (Math.floor(Math.random() * 5) + 5);

  this.spinning = true;
  const deceleration = 0.98;
  rotationAngle = rotationAngle % 360;
  let speed = calculateSpeed(finalAngle, rotationAngle, deceleration);

  const spinInterval = () => {
    drawWheel(rotationAngle);

    if (speed <= 0.1) {
      this.spinning = false;
      if (this.ticketsToPlay > 0) {
        enableAndDontDimButton(playAgainButton);
        spinButton.style.display = "none";
        playAgainButton.style.display = "block";
      }
      if (wheel.sections[this.spinToValue].value !== "losing") {
        createConfetti();
        startScoreAnimation(this.targetScore);
      } else {
        loosingAnimation();
      }
      return;
    }
    rotationAngle += speed;
    speed *= deceleration;

    requestAnimationFrame(spinInterval);

  };
  spinInterval();
}

function startScoreAnimation(score) {
  const scoreAnimation = document.getElementById("scoreAnimation");
  scoreAnimation.textContent = `${'You win'+"\n"+score}`;
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


//Draw Wheel 
function drawWheel(rotation) {
  rotation = rotation % 360;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(rotation * toRad);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  ctx.drawImage(wheelImage, 0, 0, canvas.width, canvas.height);
  ctx.restore();
}

//CalculateSpeed Of Wheel Spin
function calculateSpeed(
  targetRotationAngle,
  initialRotationAngle,
  deceleration
) {
  var trySpeed = 10;
  while (true) {
    var speed = trySpeed;
    var current = initialRotationAngle;

    do {
      current += speed;
      speed *= deceleration;
    } while (speed > 0.1);

    if (Math.abs(current - targetRotationAngle) < 5) {
      return trySpeed;
    }
    trySpeed += 0.1;
  }
  return trySpeed;
}

function playAgain() {
  this.spinned = false;
  fetchDataFromAPI();
  this.spinToValue = '';
  lightAnimation();
  if (this.winningValue !== "losing") {
    stopWinningAnimation();
  } else {
    stopLoosingAnimation();
  }
}

wheel.draw();
spinButton.addEventListener("click", spinWheel.bind(this));
playAgainButton.addEventListener("click", playAgain.bind(this));

function disableAndDimButton(button) {
  button.disabled = true;
  button.style.opacity = 0.5;
  button.style.cursor = "not-allowed";
}

function enableAndDontDimButton(button) {
  button.disabled = false;
  button.style.opacity = 1;
  button.style.cursor = "pointer";
}

function createConfetti() {
  console.log('createConfetti')
  const confettiContainer = document.querySelector(".confetti-container");

  confettiElements.forEach((confetti) => {
    confettiContainer.removeChild(confetti);
  });
  confettiElements = [];

  for (let i = 0; i < 50; i++) {
    console.log("i", i);
    const confetti = document.createElement("div");
    confetti.className = "confetti";
    confetti.style.left = `${Math.random() * 100}%`;
    confetti.style.top = `${-100}px`;
    console.log("i", confetti);
    confetti.style.animationDelay = `${Math.random() * 5}s`;
    confettiContainer.appendChild(confetti);

    confettiElements.push(confetti);
  }
}

function openHowToPlayDialog() {
  console.log('hi')
  const myDialog = document.getElementById("howToPlayDialog");
  myDialog.showModal();
}

function closeHowToPlayDialog() {
  console.log('hi2')
  const myDialog = document.getElementById("howToPlayDialog");
  myDialog.close();
}

function openHowToWinDialog() {
  console.log('hi')
  const myDialog = document.getElementById("howToWinDialog");
  myDialog.showModal();
}

function closeHowToWinDialog() {
  const myDialog = document.getElementById("howToWinDialog");
  myDialog.close();
}

function openTicketDialog() {
  const myTicketsDialog = document.getElementById("ticketsDialog");
  myTicketsDialog.showModal();
}

function closeTicketDialog() {
  const myTicketsDialog = document.getElementById("ticketsDialog");
  myTicketsDialog.close();
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
  button.innerHTML = "Acheter";
}

function openPopup() {
  const myDialog = document.getElementById("myDialog");
  myDialog.showModal();
}

function closePopup() {
  const myDialog = document.getElementById("myDialog");
  myDialog.close();
}


// API'S
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
      console.log('tested', this.spinned, this.ticketsToPlay)
      if (this.ticketsToPlay === 0 && !this.spinned) {
        console.log('entered')
        fetchDataFromAPI();
      }
      if (this.ticketsToPlay === 0 && this.spinned) {
        disableAndDimButton(spinButton);
        enableAndDontDimButton(playAgainButton);
        playAgainButton.style.display = "block";
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
      console.log('response', response);
      if (response.status == 1 && response.tickets != null) {
        this.ticketsToPlay = response.numberOfTickets;
        const availableTicketsElement =
          document.getElementById("availableTickets");
        availableTicketsElement.textContent = this.ticketsToPlay;
        if (response.numberOfTickets > 0 && this.spinned) {
          console.log('hone disabled 1')
          disableAndDimButton(spinButton);
        } else if (response.numberOfTickets === 0 && this.spinned) {
          console.log('hone disabled 2')
          disableAndDimButton(spinButton);
        }
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

window.addEventListener("load", function () {
  fetchDataFromAPI();
  lightAnimation();
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
        console.log(response)
        if (response.status === 1 && response.tickets.length > 0) {
          if (response.numberOfTickets > 0 && !this.spinned) {
            disableAndDimButton(playAgainButton);
            enableAndDontDimButton(spinButton);
            playAgainButton.style.display = "none";
            spinButton.style.display = "block";
          }
          this.targetScore = response.tickets[0].prize;
          console.log(response.tickets[0].ticketValues);
          this.ticketId = response.tickets[0].id;
          this.myArray = response.tickets[0].ticketValues;
          this.winningValue = response.tickets[0].winningValue;
          this.ticketsToPlay = response.numberOfTickets;
          const availableTicketsElement =
            document.getElementById("availableTickets");
          availableTicketsElement.textContent = this.ticketsToPlay;
          createSpinnerIndex(this.winningValue);
        }
        if (response.status === 1 && response.tickets.length === 0) {
          console.log('hi')
          disableAndDimButton(playAgainButton);
          disableAndDimButton(spinButton);
          playAgainButton.style.display = "none";
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
          var cell4 = row.insertCell(3);

          cell1.textContent = item.id;
          cell2.textContent = item.purchaseDate;
          cell3.textContent = item.price;
          cell4.textContent = item.prize;
        });
        openTicketDialog();
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
