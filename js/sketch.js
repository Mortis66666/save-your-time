const black = 0;
const white = [255, 255, 255];
const grey = [211, 211, 211];
const red = [255, 0, 0];
const green = [0, 255, 0];
const blue = [0, 0, 255];
const lightBlue = [0, 153, 255];
const purple = [255, 0, 255];

const hourHandSize = 15;
const minuteHandSize = 30;
const secondHandSize = 50;

const lineThickness = 5;

const projectileSpeed = 0.2;
const projectileDamage = 5;
const monsterHealth = 5;
const monsterSpeed = 0.2;
const monsterDamage = 3;

const shieldHealRate = 5000;
const shieldHeal = 1;

let canvasWidth = window.innerWidth * 0.7;
let canvasHeight = window.innerHeight;
let midPointX = canvasWidth / 2;
let midPointY = canvasHeight / 2;

let clock;
let smallClock = null;
let shield = null;
let timeBomb = null;
let bg;
let soundFile;
let clockImage;
let smallClockImage;
let projectileImage;
let tickSound;
let clickSound;
let shootSound;
let enemyHurtSound;

let canUseMirror = true;
let canUseTimeBomb = true;
let canUseDoubleTrouble = true;

let hours = 0;
let minutes = 0;
let seconds = 0;

let start = false;
let isPageVisible = true;
let lastUpdate = 0;

let shoot = false;
let mirror = false;
let lastShoot = 0;
let shootRate = 250;

let bulletSizeMultiplier = 1;
let powerUpReloadTimeMultipler = 1;
let rewardMulitplier = 1;

const projectiles = [];
const monsters = [];
const rewards = [];

// TODO adjust broken stats
const waveRate = 10000;

const maxEpicRate = 50;
const adjustEpicRateEvery = 1;
const epicRateIncrease = 2;

const maxMythicRate = 30;
const adjustMythicRateEvery = 3;
const mythicRateIncrease = 2;

const adjustMinSpawnRateEvery = 2;
const adjustMaxSpawnRateEvery = 1;

let waveCount = 0;
let minSpawn = 1;
let maxSpawn = 1;
let lastWaveTime = 0;
let waveCountDown = 0;

let epicRate = 1;
let mythicRate = 0;

let score = 0;

const cooldowns = {
    mirrorCooldown: {
        duration: 180_000,
        startTime: null,
        timerId: null,
        onCooldownEnd: () => {
            canUseMirror = true;

            let element = document.getElementById("mirror-powerup");
            if (element) element.style.opacity = "1";
        }
    },
    timeBombCooldown: {
        duration: 600_000,
        startTime: null,
        timerId: null,
        onCooldownEnd: () => {
            canUseTimeBomb = true;

            let element = document.getElementById("timebomb-powerup");
            if (element) element.style.opacity = "1";
        }
    },
    doubleTroubleCooldown: {
        duration: 300_000,
        startTime: null,
        timerId: null,
        onCooldownEnd: () => {
            canUseDoubleTrouble = true;

            let element = document.getElementById("doubletrouble-powerup");
            if (element && !smallClock) element.style.opacity = "1";
        }
    },
    mirrorEnd: {
        duration: 30_000,
        startTime: null,
        timerId: null,
        onCooldownEnd: () => {
            mirror = false;
        }
    }
};

function preload() {
    bg = loadImage("assets/bg.png");
    clockImage = loadImage("assets/clock.png");
    smallClockImage = loadImage("assets/miniclock.png");
    projectileImage = loadImage("assets/bullet.png");

    soundFormats("ogg", "mp3");
    soundFile = loadSound("assets/bgmusic.mp3");

    soundFormats("ogg", "wav");
    tickSound = loadSound("assets/tick.wav");
    clickSound = loadSound("assets/click.wav");
    shootSound = loadSound("assets/shoot.wav");
    enemyHurtSound = loadSound("assets/enemyhurt.wav");
    tickSound.setVolume(10);
    clickSound.setVolume(10);
    shootSound.setVolume(10);
    enemyHurtSound.setVolume(10);
}

function setup() {
    let canvas = createCanvas(canvasWidth, canvasHeight);
    canvas.parent("main");

    clock = new Clock();

    soundFile.loop();

    document.onvisibilitychange = handleVisibilityChange;

    // setInterval(() => {
    //     for (let i = 0; i < 5; i++) {
    //         spawnMonster();
    //     }
    //     console.log("spawn 5");
    //     console.log("total:", monsters.length);
    // }, 5000);
}

function draw() {
    if (!start || clock.health <= 0) return;
    background(bg);
    // background(grey);

    let now = Date.now();
    let deltaTime = now - lastUpdate;

    if (lastUpdate !== 0) {
        if (!lastWaveTime) clock.takeDamage(deltaTime / 1000);

        seconds += deltaTime / 1000;
        minutes += Math.floor(seconds / 60);
        seconds %= 60;
        hours += Math.floor(minutes / 60);
        minutes %= 60;
        hours %= 12;

        timeDisplay(...[hours, minutes, seconds].map(Math.floor));
    }

    if (monsters.length === 0) {
        if (lastWaveTime === 0) {
            lastWaveTime = now;
        } else if (now - lastWaveTime > waveRate) {
            console.log("Wave:", ++waveCount);
            lastWaveTime = 0;

            if (waveCount % adjustEpicRateEvery === 0) {
                epicRate = Math.min(epicRate + epicRateIncrease, maxEpicRate);
            }
            if (waveCount % adjustMythicRateEvery === 0) {
                mythicRate = Math.min(
                    mythicRate + mythicRateIncrease,
                    maxMythicRate
                );
            }
            if (waveCount % adjustMaxSpawnRateEvery === 0) {
                maxSpawn++;
            }
            if (waveCount % adjustMinSpawnRateEvery === 0) {
                minSpawn++;
            }

            for (let i = 0; i < randint(minSpawn, maxSpawn); i++) {
                spawnMonster();
            }
        } else {
            waveCountDown = Math.floor((now - lastWaveTime) / 1000);
        }
    }

    clock.hands.hour.degree = -30 * hours + -0.5 * minutes;
    clock.hands.minute.degree = -6 * minutes + -0.1 * seconds;
    clock.hands.second.degree = -6 * seconds;

    if (smallClock) {
        smallClock.hands.hour.degree = -30 * hours + -0.5 * minutes;
        smallClock.hands.minute.degree = -6 * minutes + -0.1 * seconds;
        smallClock.hands.second.degree = -6 * seconds;
    }

    let delta = lastUpdate === 0 ? 0 : deltaTime;

    clock.draw();
    smallClock?.update(delta);
    smallClock?.draw();

    shield?.update();
    shield?.draw();

    timeBomb?.update();
    timeBomb?.draw();

    for (let projectile of projectiles) {
        projectile.update(delta);
        projectile.draw();
    }

    for (let monster of monsters) {
        monster.update(delta);
        monster.draw();
    }

    for (let reward of rewards) {
        reward.update(delta);
        reward.draw();
    }

    // console.log(shoot);
    if (shoot && now - lastShoot > shootRate) {
        clock.shoot();
        smallClock?.shoot();
        lastShoot = now;
        shootSound.play();
    }
    shoot = false;

    lastUpdate = now;
}

function keyPressed(e) {
    if (!start) return;
    e.preventDefault();
    if (keyCode === " ".charCodeAt(0)) {
        shoot = true;
    } else if (keyCode === 100 || keyCode == 83) {
        seconds++;
        tickSound.play();
    } else if (keyCode === 101 || keyCode == 65) {
        minutes++;
        tickSound.play();
    } else if (keyCode === 102 || keyCode == 81) {
        hours++;
        tickSound.play();
    } else if (keyCode === 97 || keyCode == 87) {
        if (--seconds <= 0) {
            seconds += 60;
        }
        tickSound.play();
    } else if (keyCode === 98 || keyCode == 68) {
        if (--minutes <= 0) {
            minutes += 60;
        }
        tickSound.play();
    } else if (keyCode === 99 || keyCode == 69) {
        if (--hours <= 0) {
            hours += 60;
        }
        tickSound.play();
    }

    if (keyCode === 80 && lastWaveTime) {
        let reward =
            waveRate / 1000 - Math.floor((Date.now() - lastWaveTime) / 1000);
        clock.health += reward;
        rewards.push(new Reward(midPointX, canvasHeight * 0.3, reward));
        lastWaveTime = 1;
    }
}

function mouseClicked() {
    if (!start) return;
    // Check if mouse is inside canvas
    if (
        mouseX >= 0 &&
        mouseX <= canvasWidth &&
        mouseY >= 0 &&
        mouseY <= canvasHeight
    ) {
        shoot = true;
    } else {
        clickSound.play();
    }
}

touchStarted = mouseClicked;

function windowResized() {
    console.log("window resize");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight;
    midPointX = canvasWidth / 2;
    midPointY = canvasHeight / 2;

    clock.x = midPointX;
    clock.y = midPointY;
    resizeCanvas(canvasWidth, canvasHeight);
}

function randint(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function killProjectile(projectile) {
    projectiles.splice(projectiles.indexOf(projectile), 1);
}

function killMonster(monster) {
    monsters.splice(monsters.indexOf(monster), 1);
}

function killReward(reward) {
    rewards.splice(rewards.indexOf(reward), 1);
}

function spawnMonster() {
    let x0 = 0;
    let y0 = 0;
    let x1 = canvasWidth - 1;
    let y1 = canvasHeight - 1;

    let choice = randint(0, 3);

    switch (choice) {
        case 0:
            x0 = canvasWidth - 1;
            break;
        case 1:
            x1 = 0;
            break;
        case 2:
            y0 = canvasHeight - 1;
            break;
        case 3:
            y1 = 0;
            break;
    }

    // console.log(x0, y0, x1, y1);

    let x = randint(x0, x1);
    let y = randint(y0, y1);

    let randomNum = Math.random() * 100;
    let monster;
    let args = [x, y, createVector(midPointX - x, midPointY - y)];

    if (randomNum < epicRate) {
        monster = Monster.epic(...args);
    } else if (randomNum < epicRate + mythicRate) {
        monster = Monster.mythic(...args);
    } else {
        monster = Monster.normal(...args);
    }

    monsters.push(monster);
}

function startCooldown(cooldownName) {
    const cooldown = cooldowns[cooldownName];
    cooldown.startTime = Date.now();
    const remainingTime = cooldown.duration - (Date.now() - cooldown.startTime);
    cooldown.timerId = setTimeout(() => {
        cooldown.onCooldownEnd();
    }, remainingTime);
}

function pauseCooldown(cooldownName) {
    const cooldown = cooldowns[cooldownName];
    clearTimeout(cooldown.timerId);
    const remainingTime = cooldown.duration - (Date.now() - cooldown.startTime);
    cooldown.remainingTime = remainingTime > 0 ? remainingTime : 0;
}

function resumeCooldown(cooldownName) {
    const cooldown = cooldowns[cooldownName];
    if (cooldown.remainingTime > 0) {
        cooldown.timerId = setTimeout(() => {
            cooldown.onCooldownEnd();
        }, cooldown.remainingTime);
    }
}
