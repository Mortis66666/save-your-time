class Monster extends Sprite {
    constructor(
        x,
        y,
        vector,
        size = 30,
        debugColor,
        health = monsterHealth,
        speed = monsterSpeed,
        damage = monsterDamage,
        reward = 1
    ) {
        super(x, y, vector, size, health, speed, damage);
        this.debugColor = debugColor;
        this.reward = reward;
    }

    static normal(x, y, vector) {
        return new Monster(x, y, vector, 30, grey, 5, 0.02, 20, 6);
    }

    static epic(x, y, vector, choice) {
        switch (choice || randint(1, 3)) {
            case 1:
                return new Monster(x, y, vector, 40, grey, 25, 0.017, 15, 15); // tank
            case 2:
                return new Monster(x, y, vector, 30, blue, 4, 0.05, 10, 9); // speedy
            case 3:
                return new Monster(x, y, vector, 30, red, 5, 0.02, 60, 7); // assassin
        }
    }

    static mythic(x, y, vector, choice) {
        switch (choice || randint(1, 3)) {
            case 1:
                return new Monster(x, y, vector, 40, blue, 25, 0.05, 15, 15); // speedy tank
            case 2:
                return new Monster(x, y, vector, 30, purple, 4, 0.05, 60, 9); // speedy assassin
            case 3:
                return new Monster(x, y, vector, 40, red, 25, 0.02, 60, 7); // tank assassin
        }
    }

    draw() {
        fill(this.debugColor);
        noStroke();
        circle(this.x, this.y, this.size);
    }

    update(delta) {
        if (
            this.x < 0 ||
            this.x > canvasWidth ||
            this.y < 0 ||
            this.y > canvasHeight
        ) {
            this.kill();
        } else {
            super.update(delta);

            if (
                dist(this.x, this.y, clock.x, clock.y) <
                clock.size / 2 + this.size / 2
            ) {
                clock.takeDamage(this.damage);
                return this.kill();
            }

            if (smallClock) {
                if (
                    dist(this.x, this.y, smallClock.x, smallClock.y) <
                    smallClock.size / 2 + this.size / 2
                ) {
                    smallClock.takeDamage(this.damage);
                    return this.kill();
                }
            }

            if (shield) {
                if (
                    dist(this.x, this.y, shield.x, shield.y) <
                    shield.size / 2 + this.size / 2
                ) {
                    shield.takeDamage(this.damage);
                    return this.kill();
                }
            }
        }
    }

    takeDamage(n) {
        super.takeDamage(n);
        enemyHurtSound.play();
    }

    kill() {
        if (this.health <= 0) {
            let reward =
                (dist(this.x, this.y, clock.x, clock.y) /
                    Math.sqrt(
                        (canvasWidth / 2) ** 2 + (canvasHeight / 2) ** 2
                    )) *
                this.reward *
                rewardMulitplier;
            clock.health += reward;

            rewards.push(new Reward(this.x, this.y, Math.ceil(reward)));
        }

        killMonster(this);
    }
}
