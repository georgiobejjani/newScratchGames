// const debugEl = document.getElementById('debug');
const iconMaps = [
    ["crown", "seven", "star", "horseCoin", "flower", "heart", "coin", "diamond"], // iconMap for indexes[0]
    ["horseCoin", "star", "seven", "crown", "heart", "coin", "diamond", "flower"], // iconMap for indexes[1]
    ["diamond", "star", "crown", "seven", "coin", "flower", "heart", "horseCoin"]  // iconMap for indexes[2]
];
//[8,1,2,3,4,5,6,7]
icon_width = 79,
    icon_height = 94,
    num_icons = 8,
    time_per_icon = 50,
    this.indexes = [0, 0, 0];

let confettiElements = [];
this.availableTickets = 0;
this.rigged = true;
const spinSound = new Audio("./assets/spinSound.mp3");
let apiEndpoint = "https://api.test-ci.moobifun.com/";
this.scratchType = 4;
const urlParams = new URLSearchParams(window.location.search);
this.token = urlParams.get("token");
this.rotating = false;
this.rotated = false;
const spinButton = document.getElementById("startButton");
const playAgainBtn = document.getElementById("playAgnBtn");
const scoreDisplay = document.createElement('div');
const WinningSound = new Audio("./assets/winning-sound.mp3");
const losingSound = new Audio("./assets/loosing-sound.mp3");
function playSpinSound() {
    spinSound.currentTime = 0;
    spinSound.play();
}

document.getElementById('startButton').addEventListener('click', () => {
    rollAll();
    document.getElementById('sprite').classList.add('animHandle');
    playSpinSound();
});

document.getElementById('playAgnBtn').addEventListener('click', () => {
    playAgain();
});

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

function openHowToPlayDialog() {
    const myDialog = document.getElementById("howToPlayDialog");
    myDialog.showModal();
}

function closeHowToPlayDialog() {
    const myDialog = document.getElementById("howToPlayDialog");
    myDialog.close();
}

function openHowToWinDialog() {
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

function openPopup() {
    const myDialog = document.getElementById("myDialog");
    myDialog.showModal();
}

function closePopup() {
    const myDialog = document.getElementById("myDialog");
    myDialog.close();
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

    for (let i = 0; i < 100; i++) {
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

    confettiElements.forEach((confetti) => {
        confetti.remove();
    });
    confettiElements = [];
}

//counter 

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

const roll = (reel, offset = 0, target = null) => {
    let delta = (offset + 2) * num_icons + Math.round(Math.random() * num_icons);

    const style = getComputedStyle(reel),
        backgroundPositionY = parseFloat(style["background-position-y"]);

    if (target) {
        const currentIndex = backgroundPositionY / icon_height;
        delta = target - currentIndex + (offset + 6) * num_icons;
    }

    return new Promise((resolve, reject) => {


        const
            targetBackgroundPositionY = backgroundPositionY + delta * icon_height,
            normTargetBackgroundPositionY = targetBackgroundPositionY % (num_icons * icon_height);

        setTimeout(() => {
            reel.style.transition = `background-position-y ${(7 + 1 * delta) * time_per_icon}ms cubic-bezier(.41,-0.01,.63,1.09)`;
            reel.style.backgroundPositionY = `${backgroundPositionY + delta * icon_height}px`;
        }, offset * 150);

        setTimeout(() => {
            reel.style.transition = `none`;
            reel.style.backgroundPositionY = `${normTargetBackgroundPositionY}px`;
            resolve(delta % num_icons);
        }, (8 + 1 * delta) * time_per_icon + offset * 150);

    });
};

function rollAll() {
    if (this.rotating) return;
    this.rotated = true;
    playTicket(this.ticketId)

    const reelsList = document.querySelectorAll('.slots > .reel');

    const targets = this.targets;

    // debugEl.textContent = targets ? 'rolling (Rigged!) ...' : 'rolling...';
    this.rotating = true;
    Promise

        .all([...reelsList].map((reel, i) => roll(reel, i, targets ? targets[i] : null)))

        .then((deltas) => {
            document.getElementById('sprite').classList.remove('animHandle');
            deltas.forEach((delta, i) => this.indexes[i] = (this.indexes[i] + delta) % num_icons);
            // debugEl.textContent = this.indexes.map((index, i) => iconMaps[i][index]).join(' - ')
            this.rotating = false;
            if (this.availableTickets > 0) {
                enableAndDontDimButton(playAgainBtn);
                playAgainBtn.style.display = "block";
                disableAndDimButton(spinButton)
            }
            console.log('this.winningValue', this.winningValue)
            if (this.winningValue !== 'losing') {
                startScoreAnimation(this.targetScore);
            }
        });
};

function getRandomTargets() {
    const randomTargets = [];
    for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * iconMaps[i].length) + 1;
        randomTargets.push(randomIndex === 9 ? 1 : randomIndex); // If randomIndex is 9, change it to 1
    }
    return randomTargets;
}

function SlotTargets(value) {
    switch (value) {
        case "L7-1": {
            this.targets = [1, 2, 3];
            break;
        }
        case "L7-2": {
            this.targets = [2, 1, 1];
            break;
        }
        case "L7-3": {
            this.targets = [3, 8, 7];
            break;
        }
        case "L7-4": {
            this.targets = [4, 7, 5];
            break;
        }
        case "L7-5": {
            this.targets = [5, 4, 6];
            break;
        }
        case "L7-6": {
            this.targets = [6, 5, 4];
            break;
        }
        case "L7-7": {
            this.targets = [7, 6, 8];
            break;
        }
        case "L7-8": {
            this.targets = [8, 3, 2];
            break;
        }
        case "losing": {
            this.targets = getRandomTargets();
            break;
        }
    }
}

function playAgain() {
    this.rotated = false;
    fetchDataFromAPI();
    this.targets = [0, 0, 0];
    if (this.winningValue !== "losing") {
        stopWinningAnimation();
    }
}

function disableAndDimButton(button) {
    button.disabled = true;
    button.style.cursor = "not-allowed";
}

function enableAndDontDimButton(button) {
    button.disabled = false;
    button.style.cursor = "pointer";
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
            } else {
                document.getElementById("sucessBuy").classList.remove("hidden");
                setTimeout(function () {
                    document.getElementById("sucessBuy").classList.add("hidden");
                }, 3000);
                getUnplayed();
            }
            if (this.availableTickets === 0 && !this.rotated) {
                console.log('entered')
                fetchDataFromAPI();
            }
            if (this.availableTickets === 0 && this.rotated) {
                disableAndDimButton(spinButton);
                enableAndDontDimButton(playAgainBtn);
                playAgainBtn.style.display = "block";
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
                this.availableTickets = response.numberOfTickets;
                const availableTicketsElement =
                    document.getElementById("availableTickets");
                availableTicketsElement.textContent = this.availableTickets;
                if (response.numberOfTickets > 0 && this.rotated) {
                    console.log('hone disabled 1')

                } else if (response.numberOfTickets === 0 && this.rotated) {
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
                    if (response.numberOfTickets > 0 && !this.rotated) {
                        disableAndDimButton(playAgainBtn);
                        enableAndDontDimButton(spinButton);
                        playAgainBtn.style.display = "none";
                        spinButton.style.display = "block";
                    }
                    this.targetScore = response.tickets[0].prize;
                    this.ticketId = response.tickets[0].id;
                    this.myArray = response.tickets[0].ticketValues;
                    this.winningValue = response.tickets[0].winningValue;
                    this.availableTickets = response.numberOfTickets;
                    const availableTicketsElement =
                        document.getElementById("availableTickets");
                    availableTicketsElement.textContent = this.availableTickets;
                    console.log('response', response, this.winningValue);
                    SlotTargets(this.winningValue);
                }
                if (response.status === 1 && response.tickets.length === 0) {
                    console.log('hi')
                    disableAndDimButton(playAgainBtn);
                    disableAndDimButton(spinButton);
                    playAgainBtn.style.display = "none";
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
