const upSecond = document.getElementById("up-second");
const downSecond = document.getElementById("down-second");
const upMinute = document.getElementById("up-minute");
const downMinute = document.getElementById("down-minute");
const upHour = document.getElementById("up-hour");
const downHour = document.getElementById("down-hour");
const controls = document.getElementById("controls");
const shops = document.getElementById("shops");
const mainUi = document.getElementById("main-ui");
const playBtn = document.getElementById("play");
const playAgain = document.getElementById("play-again");
const displayScore = document.getElementById("score");
const displayHighscore = document.getElementById("highscore");
const startPage = document.querySelector(".start");
const flashText = document.querySelector(".flash-text");
const lose = document.querySelectorAll(".lose");

let bulletSizeLevel = 0;
let helpingHandLevel = 0;
let powerupReloadtimeLevel = 0;
let shieldLevel = 0;
let rewardBoosterLevel = 0;

// TODO adjust max level
let maxBulletSizeLevel = 5;
let maxHelpingHandLevel = 5;
let maxPowerupReloadtimeLevel = 10;
let maxShieldLevel = 10;
let maxRewardBoosterLevel = 30;

//adjust starting cost
let bulletSizeCost = 40;
let helpingHandCost = 60;
let powerupReloadTimeCost = 50;
let shieldCost = 40;
let rewardBoosterCost = 40;

let shieldtime = 15;

//cooldown timer
let mirrorTimer =  0
let doubleTroubleTimer = 0
let timeBombTimer = 0

function lost(score) {
    flashText.style.visibility = "visible";
    [...lose].forEach(el => {
        el.classList.remove("hide");
    });

    localStorage.setItem(
        "highscore",
        Math.max(localStorage.getItem("highscore") || 0, score)
    );

    displayHighscore.innerText = `Your highscore: ${Math.floor(
        localStorage.getItem("highscore")
    )}`;
    displayScore.innerText = `Your score: ${Math.floor(score)}`;
}

window.onkeydown = e => {
    return !(e.keyCode == 32);
};

playBtn.onclick = () => {
    startPage.style.visibility = "hidden";
    playBtn.style.visibility = "hidden";
    flashText.style.visibility = "hidden";
    start = true;
    //start gameplay
    spawnControls();
};

playAgain.onclick = () => location.reload();

controls.onclick = spawnControls;

function spawnControls() {
    mainUi.innerHTML = ``;
    // Create section "shoot"
    const shootSection = document.createElement("section");
    shootSection.className = "shoot";
    const timeUnits = ["second", "minute", "hour"];
    timeUnits.forEach(unit => {
        const article = document.createElement("article");
        const h5 = document.createElement("h5");
        h5.textContent = `${unit.charAt(0).toUpperCase() + unit.slice(1)} hand`;
        article.appendChild(h5);
        const upDiv = document.createElement("div");
        upDiv.id = `up-${unit}`;
        upDiv.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';

        upDiv.onclick = () => {
            eval(`${unit}s++`);
            tickSound.play();
        };

        article.appendChild(upDiv);
        const p = document.createElement("p");
        p.id = unit;
        p.textContent = "00";
        article.appendChild(p);
        const downDiv = document.createElement("div");
        downDiv.id = `down-${unit}`;
        downDiv.innerHTML = '<i class="fa-solid fa-arrow-down"></i>';

        downDiv.onclick = () => {
            eval(`if (--${unit}s <= 0) {
                ${unit}s += 60;
            }`);
            tickSound.play();
        };

        article.appendChild(downDiv);
        shootSection.appendChild(article);
    });
    mainUi.appendChild(shootSection);
    // Create section "powerups"
    const powerupsSection = document.createElement("section");
    powerupsSection.className = "powerups";
    const h2 = document.createElement("h2");
    h2.textContent = "Powerups";
    powerupsSection.appendChild(h2);
    const powerups = [
        {
            title: "Mirror",
            description: "You can shoot enemies behind and in front of the clock hand",
            img: "assets/mirror.png",
            id: "mirror-powerup",
            checkAvailable: "canUseMirror",
            onclick: img => () => {
                if (canUseMirror && !mirror) {
                    img.style.visibility = "visible";
                    mirror = true;
                    canUseMirror = false;
                    startCooldown("mirrorCooldown");
                    mirrorTimer =  Date.now() - cooldowns['mirrorCooldown'].startTime
                    img.textContent = mirrorTimer
                    startCooldown("mirrorEnd");
                }
            }
        },
        {
            title: "Double Trouble",
            description: "Summon a second clock to fight enemies alongside",
            img: "assets/doubletrouble.png",
            id: "doubletrouble-powerup",
            checkAvailable: "canUseDoubleTrouble && !smallClock",
            onclick: img => () => {
                if (canUseDoubleTrouble && !smallClock) {
                    img.style.visibility = "visible";
                    smallClock = new SmallClock();
                    canUseDoubleTrouble = false;
                    startCooldown("doubleTroubleCooldown");
                    doubleTroubleTimer = Date.now() - cooldowns['doubleTroubleCooldown'].startTime
                    img.textContent = doubleTroubleTimer
                }
            }
        },
        {
            title: "Time Bomb",
            description: "A bomb that that will kill all enemy in less than 5 seconds",
            img: "assets/timebomb.png",
            id: "timebomb-powerup",
            checkAvailable: "canUseTimeBomb",
            onclick: img => () => {
                if (canUseTimeBomb && !timeBomb) {
                    img.style.visibility = "visible";
                    timeBomb = new TimeBomb();
                    canUseTimeBomb = false;
                    startCooldown("timeBombCooldown");
                    timeBombTimer = Date.now() - cooldowns['timeBombCooldown'].startTime
                    img.textContent = timeBombTimer
                }
            }
        }
    ];
    powerups.forEach((powerup, index) => {
        const article = document.createElement("article");
        article.className = `power${index + 1}`;

        const powerupsTitleDiv = document.createElement("div");
        powerupsTitleDiv.className = "powerups-title";
        powerupsTitleDiv.innerHTML = `${powerup.title}<i class="fa-solid fa-info"></i>`;
        article.appendChild(powerupsTitleDiv);

        const powerupsTooltipP = document.createElement("p");
        powerupsTooltipP.className = "powerups-tooltip";
        powerupsTooltipP.innerHTML = `<span>Description: </span>${powerup.description}`;
        powerupsTitleDiv.appendChild(powerupsTooltipP);

        const img = document.createElement("img");
        img.id = powerup.id;
        img.className = "powerup-img";
        img.setAttribute("src", powerup.img);

        const loadText = document.createElement("p");
        loadText.textContent = powerup.timer;
        loadText.className = "powerup-load-text"
        article.appendChild(loadText)

        if (!eval(powerup.checkAvailable)) {
            loadText.style.visibility = "visible";
        }

        const powerupImage = document.createElement("div");
        powerupImage.onclick = powerup.onclick(loadText);
        powerupImage.appendChild(img);
        powerupImage.appendChild(loadText);
        
        article.appendChild(powerupImage);
        powerupsSection.appendChild(article);
    });
    mainUi.appendChild(powerupsSection);
}

shops.onclick = () => {
    mainUi.innerHTML = "";
    const upgradesSection = document.createElement("section");
    upgradesSection.classList.add("upgrades");

    const upgrades = [
        {
            img: "assets/bulletsize.png",
            title: "Bullet Size",
            description: "Increase size of bullet",
            level: bulletSizeLevel,
            cost: bulletSizeCost,
            onclick: (level, upgradeButton) => () => {
                if (
                    clock.health >= bulletSizeCost &&
                    bulletSizeLevel < maxBulletSizeLevel
                ) {
                    clock.takeDamage(bulletSizeCost);
                    bulletSizeMultiplier += 0.6;
                    bulletSizeLevel++;
                    level.textContent = `Level: ${bulletSizeLevel}`;
                    bulletSizeCost *= 1.25;

                    if (bulletSizeLevel == maxBulletSizeLevel) {
                        upgradeButton.textContent = `Max`
                    } else {                        
                        upgradeButton.textContent = `Cost: ${Math.floor(
                            bulletSizeCost
                        )}sec`;
                    }
                }
            }
        },
        {
            img: "assets/helpinghand.png",
            title: "Helping Hand",
            description:
                "Add more hand that automatically shoot enemies.",
            level: helpingHandLevel,
            cost: helpingHandCost,
            onclick: (level, upgradeButton) => () => {
                if (
                    clock.health >= helpingHandCost &&
                    helpingHandLevel < maxHelpingHandLevel
                ) {
                    // TODO add helping hand
                    clock.takeDamage(helpingHandCost);
                    helpingHandLevel++;
                    level.textContent = `Level: ${helpingHandLevel}`;
                    helpingHandCost *= 1.25;
                    if (helpingHandLevel == maxHelpingHandLevel) {
                        upgradeButton.textContent = `Max`
                    } else {
                        upgradeButton.textContent = `Cost: ${Math.floor(
                            helpingHandCost
                        )}sec`;
                    }

                    clock.addHand();
                }
            }
        },
        {
            img: "assets/powerupreloadtime.png",
            title: "Powerup Reload Time",
            description: "Speed up reload time of powerups.",
            level: powerupReloadtimeLevel,
            cost: powerupReloadTimeCost,
            onclick: (level, upgradeButton) => () => {
                if (
                    clock.health >= powerupReloadTimeCost &&
                    powerupReloadtimeLevel < maxPowerupReloadtimeLevel
                ) {
                    clock.takeDamage(powerupReloadTimeCost);
                    powerUpReloadTimeMultipler /= 1000; // ???, by upgrading this you get a higher reload time?
                    powerupReloadtimeLevel++;
                    powerupReloadTimeCost *= 1.25;
                    if (powerupReloadtimeLevel == maxPowerupReloadtimeLevel) {
                        upgradeButton.textContent = `Max`
                    } else {
                        upgradeButton.textContent = `Cost: ${Math.floor(
                            powerupReloadTimeCost
                        )}sec`;
                    }
                    level.textContent = `Level: ${powerupReloadtimeLevel}`;
                }
            }
        },
        {
            img: "assets/shield.png",
            title: "Shield",
            description: "Add a shield around the clock to protect it.",
            level: shieldLevel,
            cost: shieldCost,
            onclick: (level, upgradeButton) => () => {
                if (
                    clock.health >= shieldCost &&
                    shieldLevel < maxShieldLevel
                ) {
                    clock.takeDamage(shieldCost);
                    shieldLevel++;
                    shieldCost *= 1.25;
                    if (shieldLevel == maxShieldLevel) {
                        upgradeButton.textContent = `Max`
                    } else {
                        upgradeButton.textContent = `Cost: ${Math.floor(
                            shieldCost
                        )}sec`;
                    }
                    level.textContent = `Level: ${shieldLevel}`;

                    shield = new Shield(shieldtime * shieldLevel);
                    //TODO shield
                }
            }
        },
        {
            img: "assets/rewardbooster.png",
            title: "Reward booster",
            description:
                "Increase the amount of time gain after killing enemies.",
            level: rewardBoosterLevel,
            cost: rewardBoosterCost,
            onclick: (level, upgradeButton) => () => {
                if (
                    clock.health >= rewardBoosterCost &&
                    rewardBoosterLevel < maxRewardBoosterLevel
                ) {
                    clock.takeDamage(rewardBoosterCost);
                    rewardMulitplier += 0.2;
                    rewardBoosterLevel++;
                    rewardBoosterCost *= 1.25;
                    if (rewardBoosterCost == maxRewardBoosterLevel) {
                        upgradeButton.textContent = `Max`
                    } else {
                        upgradeButton.textContent = `Cost: ${Math.floor(
                            rewardBoosterCost
                        )}sec`;
                        }
                    level.textContent = `Level: ${rewardBoosterLevel}`;
                }
            }
        }
    ];

    // Iterate through each upgrade
    upgrades.forEach(upgrade => {
        // Create an article element
        const article = document.createElement("article");

        // Create a div element for the powerups title
        const powerupsTitle = document.createElement("div");
        powerupsTitle.classList.add("powerups-title");

        // Create an image element
        const img = document.createElement("img");
        img.className = "upgrade-img";
        img.setAttribute("src", upgrade.img);
        powerupsTitle.appendChild(img);

        // Create a text node for the title
        const title = document.createTextNode(upgrade.title);
        powerupsTitle.appendChild(title);

        // Create an info icon
        const infoIcon = document.createElement("i");
        infoIcon.classList.add("fa-solid", "fa-info");
        powerupsTitle.appendChild(infoIcon);

        // Create a tooltip
        const tooltip = document.createElement("p");
        tooltip.classList.add("powerups-tooltip");

        // Create a description label
        const descriptionLabel = document.createElement("span");
        descriptionLabel.textContent = "Description: ";
        tooltip.appendChild(descriptionLabel);

        // Create a text node for the description
        const description = document.createTextNode(upgrade.description);
        tooltip.appendChild(description);
        powerupsTitle.appendChild(tooltip);

        // Append the powerups title to the article
        article.appendChild(powerupsTitle);

        // Create a paragraph element for the level
        const level = document.createElement("p");
        level.textContent = `Level: ${upgrade.level}`;
        article.appendChild(level);

        // Create a div element for the upgrade button
        const upgradeButton = document.createElement("div");
        upgradeButton.classList.add("upgrade-button");
        upgradeButton.textContent = `Cost: ${upgrade.cost}sec`;

        // Set the onclick event for the upgrade button
        upgradeButton.onclick = upgrade.onclick(level, upgradeButton);
        article.appendChild(upgradeButton);

        // Append the article to the upgrades section
        upgradesSection.appendChild(article);
    });

    // Add the section to the DOM
    mainUi.append(upgradesSection);
};

function timeDisplay(hours, minutes, seconds) {
    try {
        const second = document.getElementById("second");
        const minute = document.getElementById("minute");
        const hour = document.getElementById("hour");
        hour.innerText = hours < 10 ? (hours == 0 ? 12 : "0" + hours) : hours;
        minute.innerText = minutes < 10 ? "0" + minutes : minutes;
        second.innerText = seconds < 10 ? "0" + seconds : seconds;
    } catch (e) {}
}

function handleVisibilityChange() {
    if (document.hidden) {
        // Page is hidden
        draw();
        isPageVisible = false;

        Object.keys(cooldowns).forEach(cooldownName => {
            pauseCooldown(cooldownName);
        });
    } else {
        // Page is visible
        let now = Date.now();
        let leaveTime = now - lastUpdate;

        if (lastWaveTime) {
            lastWaveTime += leaveTime;
        }

        if (shield) {
            shield.lastHealTime += leaveTime;
        }

        lastUpdate = now;
        isPageVisible = true;

        Object.keys(cooldowns).forEach(cooldownName => {
            resumeCooldown(cooldownName);
        });
    }

    console.log(isPageVisible);
}
