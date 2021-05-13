var game;

var canvas_W = 750;
var canvas_H = 500;

var background;
var clouds;

var heightText;
var heightText2;
var winningText;
var winningText2;
var endScoreText;
var playerScoreText;
var player2ScoreText;
var modeText;

var cursors;

var WASDKeys = {};

// ----- sounds -----
var squeek1;
var squeek2;
var music;
var musicConfig;
var enemy_2_sound;
var enemy_1_sound;
var enemy_die;

// -------------- CONFIG ---------------
var config = {
    type: Phaser.CANVAS,
    width: canvas_W,
    height: canvas_H,
    canvas: document.getElementById('canvas'),
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 2000
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};
game = new Phaser.Game(config);

game.height = 0;
game.platform_count = 0;
game.new = false;
game.ended = false;
game.mode = "single";
game.players = [];
game.y_step = 0.5;



// ======================== PRELOAD =========================
function preload() {
    // --------- IMAGES LOADING -----------
    this.load.image('background', 'svg/background.svg');
    this.load.image('background_single', 'svg/background_single.svg');
    this.load.image('background_single_new_high', 'svg/background_single_new_high.svg');
    this.load.image('background_cooperative', 'svg/background_cooperative.svg');
    this.load.image('background_nobody_won', 'svg/background_nobody_won.svg');
    this.load.image('background_player1_won', 'svg/background_player1_won.svg');
    this.load.image('background_player2_won', 'svg/background_player2_won.svg');

    this.load.image('clouds', 'svg/clouds.svg');
    this.load.spritesheet('duck', 'svg/duck.svg', {
        frameWidth: 50,
        frameHeight: 50
    });
    this.load.spritesheet('duck2', 'svg/duck2.svg', {
        frameWidth: 50,
        frameHeight: 50
    });
    this.load.spritesheet('enemy', 'svg/enemy.svg', {
        frameWidth: 85,
        frameHeight: 40
    });

    this.load.spritesheet('enemy_2', 'svg/enemy2.svg', {
        frameWidth: 85,
        frameHeight: 40
    });

    this.load.image('bread', 'svg/bread.svg');
    this.load.image('block', 'svg/block.svg');
    this.load.image('platform', 'svg/platform.svg');

    // SOUNDS: https://freesound.org
    this.load.audio('squeek1', 'mp3/squeek1.mp3');
    this.load.audio('squeek2', 'mp3/squeek2.mp3');
    //this.load.audio('music', 'mp3/tambourine.mp3');
    this.load.audio('music', 'mp3/best_music_ever.mp3');
    this.load.audio('enemy_1_sound', 'mp3/passive_aggressive.mp3');
    this.load.audio('enemy_2_sound', 'mp3/airplane.mp3');
    this.load.audio('enemy_die', 'mp3/enemy_die.mp3');
}

// ======================== CREATE ==========================
function create() {
    // CAMERA
    this.cameras.main.setBounds(0, 0, canvas_W, canvas_H);
    // BACKGROUND IMAGE
    background = this.add.image(canvas_W / 2, canvas_H / 2, 'background');
    clouds = this.add.image(canvas_W / 2, canvas_H / 2, 'clouds');
    clouds.count = 0
    // WORLD BUILDING
    game.platforms = this.physics.add.group();
    addFirstLevelPlatform(this)
    addSecondLevelPlatform(this)
    // next platforms create in update()
    // ------- PLAYERS --------
    // PLAYER 1
    game.players[0] = this.physics.add.sprite(50, 50, 'duck');
    cursors = this.input.keyboard.createCursorKeys();
    game.players[0].setBounce(0.2);
    game.players[0].setCollideWorldBounds(false);
    game.players[0].body.setMass(10);
    game.players[0].max_platform = 0
    game.players[0].score = 0
    game.players[0].jump_stage = 0
    game.players[0].dead = false
    // PLAYER 2
    if (game.mode != "single") {
        game.players[1] = this.physics.add.sprite(canvas_W - 50, 50, 'duck2');
        game.players[1].setBounce(0.2);
        game.players[1].setCollideWorldBounds(false);
        game.players[1].body.setMass(10);
        game.players[1].max_platform = 0
        game.players[1].score = 0
        game.players[1].jump_stage = 0
        game.players[1].dead = false
        WASDKeys.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        WASDKeys.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        WASDKeys.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        WASDKeys.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    }
    // ENEMY
    game.enemy = this.physics.add.sprite(1000, 0, 'enemy');
    game.enemy.setCollideWorldBounds(false);
    game.enemy.body.setAllowGravity(false);
    game.enemy.setImmovable(true);

    game.enemy_2 = this.physics.add.sprite(1000, 0, 'enemy_2');
    game.enemy_2.setCollideWorldBounds(false);
    game.enemy_2.body.setAllowGravity(false);
    game.enemy_2.setImmovable(true);
    game.enemy_2.angle = 0;
    game.enemy_2.angle_r = 0;
    game.enemy_2.setSize(20, 60);
    game.enemy_2.dir = 0;
    game.enemy_2.speed = 7;

    // ---------- ANIMATIONS ------------
    // -------- ducks animation ---------
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('duck', {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn',
        frames: [{
            key: 'duck',
            frame: 4
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('duck', {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'left2',
        frames: this.anims.generateFrameNumbers('duck2', {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'turn2',
        frames: [{
            key: 'duck2',
            frame: 2
        }],
        frameRate: 20
    });
    this.anims.create({
        key: 'right2',
        frames: this.anims.generateFrameNumbers('duck2', {
            start: 3,
            end: 5
        }),
        frameRate: 10,
        repeat: -1
    });
    this.anims.create({
        key: 'fly',
        frames: this.anims.generateFrameNumbers('enemy', {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: 20
    });
    this.anims.create({
        key: 'enemy_atack',
        frames: this.anims.generateFrameNumbers('enemy', {
            start: 3,
            end: 4
        }),
        frameRate: 10,
        repeat: 10
    });

    this.anims.create({
        key: 'fly_2',
        frames: this.anims.generateFrameNumbers('enemy_2', {
            start: 0,
            end: 2
        }),
        frameRate: 10,
        repeat: 20
    });
    this.anims.create({
        key: 'enemy_atack_2',
        frames: this.anims.generateFrameNumbers('enemy_2', {
            start: 3,
            end: 4
        }),
        frameRate: 10,
        repeat: 10
    });

    game.enemy.anims.play('fly', true);
    game.enemy_2.anims.play('fly_2', true);
    // BREAD
    game.bread = this.physics.add.group({
        key: 'bread',
        repeat: 11,
        setXY: {
            x: 12,
            y: 0,
            stepX: 70
        }
    });
    game.bread.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    });
    // TEXT init
    if (game.mode == "single") {
        playerScoreText = this.add.text(16, 48, 'PLAYER score: ' + game.players[0].score, {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        heightText = this.add.text(16, 16, 'Platforms: 0', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
    } else if (game.mode == "cooperate") {
        playerScoreText = this.add.text(16, 48, 'PLAYERS score: ' + game.players[0].score, {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        heightText = this.add.text(16, 16, 'Player 1 platforms: 0', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        heightText2 = this.add.text(16, 30, 'Player 2 platforms: 0', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
    } else {
        playerScoreText = this.add.text(16, 48, 'PLAYER 1 score: ' + game.players[0].score, {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        player2ScoreText = this.add.text(16, 60, 'PLAYER 2 score: ' + game.players[1].score, {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        heightText = this.add.text(16, 16, 'Player 1 platforms: 0', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
        heightText2 = this.add.text(16, 30, 'Player 2 platforms: 0', {
            fontSize: '16px',
            fill: '#000',
            fontStyle: "bold"
        });
    }
    winningText = this.add.text(canvas_W / 2 - 150, 60, '', {
        fontSize: '50px',
        fill: '#fff',
        strokeThickness: 10,
        stroke: '#000',
        shadowStroke: true,
        fontStyle: "bold"
    });
    endScoreText = this.add.text(120, canvas_H - 80, '', {
        fontSize: '50px',
        fill: '#fff',
        strokeThickness: 10,
        stroke: '#000',
        shadowStroke: true,
        fontStyle: "bold"
    }); // ------------------------------------------------------
    modeText = this.add.text(16, canvas_H - 32, game.mode, {
        fontSize: '18px',
        fill: '#000'
    });

    // PHYSICS
    this.physics.add.overlap(game.players[0], game.bread, collectBread, null, this);
    this.physics.add.collider(game.bread, game.platforms);

    this.physics.add.collider(game.players[0], game.platforms, platformCollision);
    this.physics.add.collider(game.players[0], game.enemy, killEnemy);
    this.physics.add.overlap(game.players[0], game.enemy, enemyAttack, null, this);
    this.physics.add.collider(game.players[0], game.enemy_2);
    this.physics.add.overlap(game.players[0], game.enemy_2, enemyAttack, null, this);
    if (game.mode != "single") {
        this.physics.add.collider(game.players[1], game.platforms, platformCollision);
        this.physics.add.collider(game.players[0], game.players[1]);
        this.physics.add.collider(game.players[1], game.enemy, killEnemy);
        this.physics.add.overlap(game.players[1], game.bread, collectBread, null, this);
        this.physics.add.overlap(game.players[1], game.enemy, enemyAttack, null, this);
        this.physics.add.collider(game.players[1], game.enemy_2);
        this.physics.add.overlap(game.players[1], game.enemy_2, enemyAttack, null, this);
    }

    console.log(game.players[1]);

    // Starts animations, removes glowing button
    game.ended = false;
    document.getElementById("new_game").classList.remove("glowing-button")

    // ------------ SOUNDS ---------------
    squeek1 = this.sound.add('squeek1');
    squeek2 = this.sound.add('squeek2');
    music = this.sound.add('music');
    musicConfig = {
        mute: false,
        loop: true
    };
    music.play(musicConfig);
    enemy_1_sound = this.sound.add('enemy_1_sound');
    enemy_2_sound = this.sound.add('enemy_2_sound');
    enemy_die = this.sound.add('enemy_die');
}

// ======================= UPDATE ========================
function update() {
    if (!game.ended) {
        // background update
        clouds.count += 0.005

        clouds.x = clouds.x + Math.sin(clouds.count);
        clouds.y = clouds.y + Math.cos(clouds.count);

        game.height += 1
        game.enemy.y += 1 * game.y_step;
        game.enemy.x += 3;

        game.enemy_2.y += Math.cos(game.enemy_2.angle_r) * game.enemy_2.speed;
        game.enemy_2.x += Math.sin(game.enemy_2.angle_r) * game.enemy_2.speed;

        updatePlatformsPosition();
    }

    // check if not new game
    if (game.new) {
        this.scene.restart();
        game.new = false;
    }
    // PLAYER
    if (cursors.left.isDown) {
        game.players[0].setVelocityX(-250);
        game.players[0].anims.play('left', true);
    } else if (cursors.right.isDown) {
        game.players[0].setVelocityX(250);
        game.players[0].anims.play('right', true);
    } else {
        game.players[0].setVelocityX(0);
        game.players[0].anims.play('turn');
    }

    // Jumping w/ double jump
    if (cursors.up.isDown && game.players[0].body.touching.down && game.players[0].jump_stage == 0) {
        game.players[0].setVelocityY(-700);
        game.players[0].jump_stage = 1;
        squeek1.play();
    } else if (!cursors.up.isDown && !game.players[0].body.touching.down && game.players[0].jump_stage == 1) {
        game.players[0].jump_stage = 2;
    } else if (cursors.up.isDown && !game.players[0].body.touching.down && game.players[0].jump_stage == 2) {
        game.players[0].setVelocityY(-700);
        game.players[0].jump_stage = 3;
        squeek1.play();
    } else if (game.players[0].body.touching.down && game.players[0].jump_stage != 0) {
        game.players[0].jump_stage = 0;
    }


    // PLAYER2
    try {
        if (game.mode != "single") {
            if (WASDKeys.keyA.isDown) {
                game.players[1].setVelocityX(-250);
                game.players[1].anims.play('left2', true);
            } else if (WASDKeys.keyD.isDown) {
                game.players[1].setVelocityX(250);
                game.players[1].anims.play('right2', true);
            } else {
                game.players[1].setVelocityX(0);
                game.players[1].anims.play('turn2');
            }
            if (WASDKeys.keyW.isDown && game.players[1].body.touching.down && game.players[1].jump_stage == 0) {
                game.players[1].setVelocityY(-700);
                game.players[1].jump_stage = 1;
                squeek2.play();
            } else if (!WASDKeys.keyW.isDown && !game.players[1].body.touching.down && game.players[1].jump_stage == 1) {
                game.players[1].jump_stage = 2;
            } else if (WASDKeys.keyW.isDown && !game.players[1].body.touching.down && game.players[1].jump_stage == 2) {
                game.players[1].setVelocityY(-700);
                game.players[1].jump_stage = 3;
                squeek2.play();
            } else if (game.players[1].body.touching.down && game.players[1].jump_stage != 0) {
                game.players[1].jump_stage = 0;
            }

        }
    } catch (e) {
        console.log('there is no player2 yet');
    }

    // add next platform and remove the oldest
    if (game.height * game.y_step >= 100) {
        game.height = 1;
        addNextLevelPlatform(this, game.platform_count % 3 == 0);
        removePlatformsOverMap();
        if (game.platform_count % 4 == 0) {
            game.enemy.y = -50;
            game.enemy.x = -200;
            game.enemy.anims.play('fly', true);
            breadDrop(this);
        }

        if (game.platform_count % 5 == 0) {
            game.y_step = game.y_step + 0.1
        }

        // enemy_2 spawning
        if (game.platform_count > 10 && (game.platform_count - 10) % 3 == 0) {
            spawnEnemy2();
        }
    }



    // check if players aren't alive
    if (!game.ended) {
        if (game.mode == "single") {
            singleModeLoose();
        } else if (game.mode == "cooperate") {
            cooperateModeLoose();
        } else {
            enemyModeLoose();
        }
    }
}

// ============== FUNCTIONS ===============
function breadDrop(scene) {
    // BREAD GROUP
    game.bread = scene.physics.add.group({
        key: 'bread',
        repeat: 11,
        setXY: {
            x: 12,
            y: 0,
            stepX: 70
        }
    });
    game.bread.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    });
    scene.physics.add.overlap(game.players[0], game.bread, collectBread, null, this);
    scene.physics.add.collider(game.bread, game.platforms);
    if (game.mode != "single") {
        scene.physics.add.overlap(game.players[1], game.bread, collectBread, null, this);
    }
}

function collectBread(_player, bread) {
    bread.disableBody(true, true);
    if (game.mode == "enemy") {
        if (_player == game.players[0]) {
            game.players[0].score += 1;
            playerScoreText.setText('PLAYER 1 score: ' + game.players[0].score);
        } else {
            game.players[1].score += 1;
            player2ScoreText.setText('PLAYER 2 score: ' + game.players[1].score);
        }
    } else if (game.mode == "single") {
        game.players[0].score += 1;
        playerScoreText.setText('PLAYER score: ' + game.players[0].score);
    } else {
        game.players[0].score += 1;
        playerScoreText.setText('PLAYERS score: ' + (game.players[0].score + game.players[1].score));
    }
}

function enemyAttack(_player, _enemy) {
    _player.y = canvas_H + 50;
    _player.dead = true
    _enemy.anims.play('enemy_atack', true);
    enemy_1_sound.play();
}

function killEnemy(_player, _enemy) {

    if (Math.floor(_player.y + 45) == Math.floor(_enemy.y)) {
        _enemy.x = 5000;
        if (_player == game.players[0]) {
            game.players[0].score += 10;
            playerScoreText.setText('PLAYER 1 score: ' + game.players[0].score);
        } else {
            game.players[1].score += 10; // dodałam 0 bo było 1
            if (game.mode == "cooperate")
                playerScoreText.setText('PLAYER 2 score: ' + (game.players[1].score + game.players[0].score));
            else
                try {
                    player2ScoreText.setText('PLAYER 2 score: ' + game.players[1].score);
                } catch {}
        }
        enemy_die.play();
    }
}

function platformCollision(_player, platform) {
    if (platform.y == _player.y + 38) {
        if (_player.max_platform < platform.number) {
            _player.max_platform = platform.number
        }
    }

    if (game.mode != "single") {
        heightText.setText('Player 1 platforms: ' + game.players[0].max_platform);
        try {
            heightText2.setText('Player 2 platforms: ' + game.players[1].max_platform);
        } catch (e) {
            console.log('there is no player 2 yet');
        }
    } else {
        heightText.setText('Platforms: ' + game.players[0].max_platform);
    }
}


function startNewGame() {
    restartGame()
}


function endGame() {
    game.ended = true;
    document.getElementById("new_game").classList.add("glowing-button")
    // cleaning sprites off screen
    game.platforms.children.iterate((child) => {
        child.x = 5000;
    });

    updatePlatformsPosition()
    game.platforms.clear()


    try {
        game.enemy.destroy()
        game.enemy_2.destroy()
        clouds.destroy()
    } catch {}

    game.y_step = 0.5;

    music.stop();
}

function restartGame() {
    game.new = true;
    game.height = 0;
    game.platform_count = 0;
    game.players[0].score = 0;
    try {
        game.players[1].score = 0;
    } catch {}
    music.stop();
}

function setSingleMode() {
    game.mode = "single";
    restartGame();
}

function setCooperateMode() {
    game.mode = "cooperate";
    restartGame();
}

function setEnemyMode() {
    game.mode = "enemy";
    restartGame();
}
// CHECK WHO WINS
// -------- SINGLE MODE ----------
function singleModeLoose() {
    if (game.players[0].y > canvas_H + 10) { // player 1 is over map

        let score = game.players[0].score * (game.players[0].max_platform)

        winningText.setText('GAME OVER');
        endScoreText.setText('TOTAL SCORE: ' + score);
        background.setTexture('background_single')
        if (localStorage.highScore == undefined)
            localStorage.highScore = 0

        if (localStorage.highScore < score) {
            localStorage.highScore = score
            background.setTexture('background_single_new_high')
        }

        game.players[0].dead = true
        endGame()
    }
}
// --------- ENEMY MODE ----------
function enemyModeLoose() {
    if (game.players[0].y > canvas_H + 10 || game.players[1].y > canvas_H + 10) { // player over map
        if (game.players[0].y > canvas_H + 10) { // player 1 is over map
            game.players[0].dead = true;
            if (game.players[1].y > canvas_H + 10) { // player 1 and 2 is over map
                game.players[1].dead = true;
                winningText.setText('NOBODY WON');
                background.setTexture('background_nobody_won')
            } else { // only player 1 is over map
                winningText.setText('PLAYER 2 WON');
                background.setTexture('background_player2_won')
            }
        } else { // only player 2 is over map
            game.players[1].dead = true;
            winningText.setText('PLAYER 1 WON');
            background.setTexture('background_player1_won')
        }
        endGame()
    }
}
// --------- COOPERATE MODE -----------
function cooperateModeLoose() {
    if (game.players[0].y > canvas_H + 10 && game.players[1].y > canvas_H + 10) { // no more players on map
        winningText.setText('GAME OVER');
        if (game.players[0].max_platform > game.players[1].max_platform)
            endScoreText.setText('TOTAL SCORE: ' + ((game.players[0].score + game.players[1].score) * game.players[0].max_platform));
        else
            endScoreText.setText('TOTAL SCORE: ' + ((game.players[0].score + game.players[1].score) * game.players[1].max_platform));
        background.setTexture('background_cooperative')
        game.players[0].dead = true;
        game.players[1].dead = true;
        endGame()
        return
    }
    if (game.players[0].y > canvas_H + 10 || game.players[1].y > canvas_H + 10) { // player over map
        if (game.players[0].y > canvas_H + 10) { // player 1 is over map
            game.players[0].dead = true;
            if (game.players[1].y > canvas_H + 10) { // player 1 and 2 is over map
                game.players[1].dead = true;
            } else { // only player 1 is over map
            }
        } else { // only player 2 is over map
            game.players[1].dead = true;
        }
    }

}
// --------------- WORLD ------------------
// world building - first platform
function addFirstLevelPlatform(scene) {
    let platform = new Platform(scene, canvas_W / 2, canvas_H / 3, 'block', false);
    game.platforms.add(platform)
    platform.setCollideWorldBounds(false);
    platform.body.setAllowGravity(false);
    platform.setImmovable(true);
    platform.number = game.platform_count++;
}
// second platform
function addSecondLevelPlatform(scene) {
    let platform = new Platform(scene, canvas_W / 2, 40, 'platform', false);
    game.platforms.add(platform)
    platform.setCollideWorldBounds(false);
    platform.body.setAllowGravity(false);
    platform.setImmovable(true);
    platform.number = game.platform_count++;
}
// next platforms
function addNextLevelPlatform(scene, moving) {
    // randomize x position of platform
    x_w = Math.floor(Math.random() * (canvas_W - 250 / 2 - 250 / 2)) + 250 / 2;
    let platform = new Platform(scene, x_w, 0, 'platform', moving);
    game.platforms.add(platform)
    platform.setCollideWorldBounds(false);
    platform.body.setAllowGravity(false);
    platform.setImmovable(true);
    platform.number = game.platform_count++;
}

//Spawns enemy 2
function spawnEnemy2() {
    let target_id
    if (game.mode != "single" && Math.random() < 0.5)
        target_id = 1
    else
        target_id = 0

    if (game.players[target_id].dead) {
        target_id = (target_id + 1) % 2
    }
    let target = game.players[target_id]

    if (Math.random() < 0.5) {
        game.enemy_2.y = 0
        game.enemy_2.x = 0
        game.enemy_2.anims.play('fly_2', true);

        game.enemy_2.dir = (target.x) / (target.y)
        game.enemy_2.angle_r = Math.atan(game.enemy_2.dir)
        game.enemy_2.angle = 90 - (game.enemy_2.angle_r * 180) / Math.PI
        game.enemy_2.flipY = false
    } else {
        game.enemy_2.y = 0
        game.enemy_2.x = canvas_W
        game.enemy_2.anims.play('fly_2', true);

        game.enemy_2.dir = (target.x - canvas_W) / (target.y)
        game.enemy_2.angle_r = Math.atan(game.enemy_2.dir)
        game.enemy_2.angle = 90 - (game.enemy_2.angle_r * 180) / Math.PI
        game.enemy_2.flipY = true
    }
    enemy_2_sound.play();
}

// update all platforms
function updatePlatformsPosition() {
    game.platforms.children.each((child) => {
        child.y += game.y_step;
        if (child.moving) {
            if (child.left) {
                if (child.x > 125) {
                    child.x -= 2;
                } else {
                    child.x += 2;
                    child.left = false;
                }
            } else {
                if (child.x < canvas_W - 125) {
                    child.x += 2;
                } else {
                    child.x -= 2;
                    child.left = true;
                }
            }
        }
    });
}
// remove platforms over map
function removePlatformsOverMap() {
    game.platforms.children.iterate((child) => {
        try {
            if (child.y > canvas_H + 10) {
                game.platforms.remove(child, true);
            }
        } // expected UncaughtType Error
        catch (error) {
            ; //ignore
        }
    });
}
// =========== CLASSES ==========
class Platform extends Phaser.Physics.Arcade.Sprite {

    constructor(scene, x, y, sprite, _moving) {
        super(scene, x, y, sprite);
        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.moving = _moving;
        this.right = true;
    }
}