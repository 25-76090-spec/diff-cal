
let player1 = 1;
let player2 = 1;

let currentPlayer = 1;

let gameOver = false;
let botTimer = null;
const maxLives = 5;
let player1Lives = maxLives;
let player2Lives = maxLives;


// SNAKES

let snakes = {
    17: 7,
    49: 11,
    54: 34,
    62: 19,
    87: 53,
    98: 79
};

let ladders = {
    3: 22,
    8: 30,
    21: 42,
    28: 84,
    36: 57,
    58: 77,
    71: 92
};

// START GAME

function startGame() {

    document.getElementById("menu").style.display = "none";

    document.getElementById("game").style.display = "block";

    createBoard();

    updatePlayers();
    updateLives();

}


// CREATE BOARD

function createBoard() {

    let board = document.getElementById("board");

    board.innerHTML = "";

    for (let row = 9; row >= 0; row--) {

        for (let col = 0; col < 10; col++) {

            let number;

            if (row % 2 === 0) {

                number = row * 10 + col + 1;

            } else {

                number = row * 10 + (9 - col) + 1;

            }

            let cell = document.createElement("div");

            cell.className = "cell";

            cell.id = "cell-" + number;

            let feature = "";

            if (snakes[number]) {

                cell.classList.add("snake");

                feature = "";

            }

            else if (ladders[number]) {

                cell.classList.add("ladder");

                feature = "";

            }

            cell.innerHTML = `
                <span class="number">${number}</span>
                <span class="feature">${feature}</span>
                <div class="tokens"></div>
            `;

            board.appendChild(cell);

        }

    }

    drawBoardConnections(board);

}



// Full-length illustrated snakes and ladders, anchored to the actual squares.
function drawBoardConnections(board) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 1000 1000");
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("class", "board-art");
    svg.setAttribute("aria-hidden", "true");
    const make = (tag, attrs, parent = svg) => {
        const el = document.createElementNS(ns, tag);
        for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
        parent.appendChild(el);
        return el;
    };
    const defs = make("defs", {});
    const gradient = make("linearGradient", {id: "snake-body-gradient", x1:"0%",y1:"0%",x2:"100%",y2:"100%"}, defs);
    make("stop", {offset:"0%", "stop-color":"#56d68a"}, gradient);
    make("stop", {offset:"100%", "stop-color":"#14764c"}, gradient);

    // Row 0 is at the bottom; odd-numbered rows run right to left.
    const center = n => {
        const row = Math.floor((n - 1) / 10);
        const col = (n - 1) % 10;
        return {x: (row % 2 ? 9 - col : col) * 100 + 50, y: (9 - row) * 100 + 50};
    };
    const line = (x1,y1,x2,y2,stroke,width,extra={}) => make("line", {x1,y1,x2,y2,stroke,"stroke-width":width,"stroke-linecap":"round",...extra});

    for (const [bottom, top] of Object.entries(ladders)) {
        const a = center(Number(bottom)), b = center(top);
        const dx = b.x-a.x, dy = b.y-a.y, len = Math.hypot(dx,dy);
        const nx = -dy/len*15, ny = dx/len*15;
        // Ladder rails terminate precisely at their entry and exit squares.
        for (const side of [-1,1]) {
            line(a.x+nx*side+3,a.y+ny*side+4,b.x+nx*side+3,b.y+ny*side+4,"#6d4426",13);
            line(a.x+nx*side,a.y+ny*side,b.x+nx*side,b.y+ny*side,"#eeb96b",10);
            line(a.x+nx*side-2,a.y+ny*side-2,b.x+nx*side-2,b.y+ny*side-2,"#fff0ba",3);
        }
        const steps = Math.max(3,Math.floor(len/35));
        for(let i=1;i<steps;i++) {
            const t=i/steps, x=a.x+dx*t, y=a.y+dy*t;
            line(x-nx,y-ny,x+nx,y+ny,"#80512c",10);
            line(x-nx,y-ny-2,x+nx,y+ny-2,"#ffe1a1",6);
        }
    }

    let index=0;
    for (const [headSquare, tailSquare] of Object.entries(snakes)) {
        const a=center(Number(headSquare)), b=center(tailSquare);
        const dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);
        const px=-dy/len,py=dx/len;
        const phase=index++%2 ? -1 : 1;
        const points=[];
        for(let i=0;i<=36;i++) {
            const t=i/36;
            const wiggle=Math.sin(t*Math.PI*4)*Math.min(28,len*.095)*Math.sin(Math.PI*t)*phase;
            points.push([a.x+dx*t+px*wiggle,a.y+dy*t+py*wiggle]);
        }
        const d=points.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        make("path",{d,fill:"none",stroke:"#164b39","stroke-width":15,"stroke-linecap":"round","stroke-linejoin":"round"});
        make("path",{d,fill:"none",stroke:"url(#snake-body-gradient)","stroke-width":11,"stroke-linecap":"round","stroke-linejoin":"round"});
        make("path",{d,fill:"none",stroke:"#a9ef9a","stroke-width":2.5,"stroke-linecap":"round","stroke-dasharray":"3 22",opacity:'.85'});
        // Head is on the high square; the tapered end reaches the tail square.
        make("circle",{cx:a.x,cy:a.y,r:12,fill:"#23885b",stroke:"#164b39","stroke-width":2.5});
        const ex=dx/len,ey=dy/len;
        for(const side of [-1,1]) {
            make("circle",{cx:a.x+ex*4+px*side*6,cy:a.y+ey*4+py*side*10,r:3,fill:"white"});
            make("circle",{cx:a.x+ex*5+px*side*6,cy:a.y+ey*5+py*side*10,r:1.6,fill:"#163a2b"});
        }
        line(a.x-ex*16,a.y-ey*16,a.x-ex*29,a.y-ey*29,"#e94c65",3);
        make("circle",{cx:b.x,cy:b.y,r:4,fill:"#23885b"});
    }
    board.appendChild(svg);
}

// UPDATE PLAYERS

function updatePlayers() {

    for (let i = 1; i <= 100; i++) {

        let cell = document.getElementById("cell-" + i);

        if (cell) {

            cell.querySelector(".tokens").innerHTML = "";

        }

    }


    if (player1 > 0) {

        let cell1 = document.getElementById("cell-" + player1);

        cell1.querySelector(".tokens").innerHTML +=
            '<span class="token">🔴</span>';

    }


    if (player2 > 0) {

        let cell2 = document.getElementById("cell-" + player2);

        cell2.querySelector(".tokens").innerHTML +=
            '<span class="token">🔵</span>';

    }


    document.getElementById("player1-position").innerHTML =
        "Position: " + player1;

    document.getElementById("player2-position").innerHTML =
        "Position: " + player2;

}


// DERIVATIVE QUESTIONS: [category, problem, correct answer, incorrect answers]
const questions = [
    ["Power Rule", "d/dx (x²)", "2x", ["x", "2", "x²"]],
    ["Power Rule", "d/dx (x³)", "3x²", ["3x", "x²", "2x"]],
    ["Power Rule", "d/dx (5x)", "5", ["x", "5x", "0"]],
    ["Power Rule", "d/dx (x⁴)", "4x³", ["4x", "x³", "3x⁴"]],
    ["Power Rule", "d/dx (7)", "0", ["7", "1", "7x"]],

    ["Chain Rule", "d/dx ((x + 1)²)", "2(x + 1)", ["x + 1", "2x", "(x + 1)²"]],
    ["Chain Rule", "d/dx ((x + 2)³)", "3(x + 2)²", ["3(x + 2)", "(x + 2)²", "3x²"]],
    ["Chain Rule", "d/dx ((2x)²)", "8x", ["4x", "2x", "8x²"]],
    ["Chain Rule", "d/dx ((x - 1)²)", "2(x - 1)", ["x - 1", "2x", "(x - 1)²"]],
    ["Chain Rule", "d/dx ((3x + 1)²)", "6(3x + 1)", ["2(3x + 1)", "3(3x + 1)", "6x"]],

    ["Quotient Rule", "d/dx (1/x)", "-1/x²", ["1/x²", "-1/x", "1"]],
    ["Quotient Rule", "d/dx (2/x)", "-2/x²", ["2/x²", "-2/x", "0"]],
    ["Quotient Rule", "d/dx (3/x)", "-3/x²", ["3/x²", "-3/x", "3"]],
    ["Quotient Rule", "d/dx (x/2)", "1/2", ["2", "x", "0"]],
    ["Quotient Rule", "d/dx ((x + 1)/2)", "1/2", ["1", "2", "x/2"]],

    ["Trigonometric", "d/dx (sin x)", "cos x", ["sin x", "-sin x", "-cos x"]],
    ["Trigonometric", "d/dx (cos x)", "-sin x", ["sin x", "cos x", "-cos x"]],
    ["Trigonometric", "d/dx (tan x)", "sec² x", ["tan x", "cos x", "sin x"]],
    ["Trigonometric", "d/dx (2 sin x)", "2 cos x", ["2 sin x", "cos x", "-2 sin x"]],
    ["Trigonometric", "d/dx (3 cos x)", "-3 sin x", ["3 sin x", "-3 cos x", "sin x"]],

    ["Higher-Order", "d²/dx² (x²)", "2", ["2x", "x", "0"]],
    ["Higher-Order", "d²/dx² (x³)", "6x", ["3x²", "6", "3x"]],
    ["Higher-Order", "d²/dx² (5x²)", "10", ["10x", "5", "0"]],
    ["Higher-Order", "d²/dx² (4x)", "0", ["4", "4x", "1"]],
    ["Higher-Order", "d³/dx³ (x³)", "6", ["6x", "3x²", "0"]]
];

// The dice determines the derivative question level.
const levelCategories = {
    1: "Power Rule",
    2: "Chain Rule",
    3: "Quotient Rule",
    4: "Trigonometric",
    5: "Higher-Order",
    6: "Mixed Challenge"
};

const challengeQuestions = [
    ["Mixed Challenge", "d/dx (x²)", "2x", ["x²", "x", "2"]],
    ["Mixed Challenge", "d/dx ((x + 1)²)", "2(x + 1)", ["2x", "x + 1", "(x + 1)²"]],
    ["Mixed Challenge", "d/dx (1/x)", "-1/x²", ["1/x²", "-1/x", "0"]],
    ["Mixed Challenge", "d/dx (sin x)", "cos x", ["-cos x", "sin x", "-sin x"]],
    ["Mixed Challenge", "d²/dx² (x²)", "2", ["2x", "x", "0"]]
];

const questionPools = {};
function nextQuestionForLevel(level) {
    if (!questionPools[level] || questionPools[level].length === 0) {
        const category = levelCategories[level];
        const source = level === 6 ? challengeQuestions : questions.filter(q => q[0] === category);
        questionPools[level] = shuffled(source);
    }
    return questionPools[level].pop();
}

let pendingDice = null;
let activeQuestion = null;
let questionPool = [];

function shuffled(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

let botTakingTurn = false;
let rolling = false;
let rollTimer = null;
let rollSequence = 0;
const diceOrientations = {
    1: [0, 0],
    2: [-90, 0],
    3: [0, -90],
    4: [0, 90],
    5: [90, 0],
    6: [0, 180]
};

function resetDiceVisual() {
    const cube = document.getElementById("dice-cube");
    cube.classList.remove("is-rolling", "dice-landed");
    cube.style.transition = "none";
    cube.style.transform = "rotateX(-18deg) rotateY(-28deg)";
    document.getElementById("dice-result").textContent = "Ready to roll";
}

function rollDice() {
    if (currentPlayer === 2 && !botTakingTurn) return;
    if (gameOver || pendingDice !== null || rolling) return;
    rolling = true;
    const sequence = ++rollSequence;
    const rollButton = document.getElementById("roll-button");
    const cube = document.getElementById("dice-cube");
    const result = document.getElementById("dice-result");
    rollButton.disabled = true;
    document.getElementById("message").textContent = "Rolling the dice...";
    result.textContent = "Rolling…";

    const rolledNumber = Math.floor(Math.random() * 6) + 1;
    const [x, y] = diceOrientations[rolledNumber];
    cube.classList.remove("dice-landed");
    cube.classList.add("is-rolling");
    cube.style.transition = "none";
    cube.style.transform = "rotateX(-18deg) rotateY(-28deg)";
    void cube.offsetWidth;
    cube.style.transition = "transform 1850ms cubic-bezier(.12,.64,.18,1)";
    cube.style.transform = `rotateX(${1080 + x}deg) rotateY(${1440 + y}deg)`;

    rollTimer = setTimeout(() => {
        if (sequence !== rollSequence) return;
        rollTimer = null;
        cube.classList.remove("is-rolling");
        cube.classList.add("dice-landed");
        result.textContent = `You rolled ${rolledNumber}!`;
        pendingDice = rolledNumber;
        rolling = false;
        document.getElementById("message").textContent = `Rolled ${pendingDice}! Answer the Level ${pendingDice} question.`;
        activeQuestion = nextQuestionForLevel(pendingDice);
        const [category, problem, correct, wrong] = activeQuestion;
        document.getElementById("question-category").textContent = `LEVEL ${pendingDice} — ${category}`;
        document.getElementById("question-problem").textContent = problem;
        document.getElementById("question-feedback").textContent = "";
        const answers = document.getElementById("answer-options");
        answers.replaceChildren();
        shuffled([correct, ...wrong]).forEach(answer => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = answer;
            button.addEventListener("click", () => answerQuestion(answer));
            answers.appendChild(button);
        });
        document.getElementById("question-dialog").showModal();
        if (currentPlayer === 2) {
            botTimer = setTimeout(() => {
                botTimer = null;
                if (gameOver || currentPlayer !== 2 || !activeQuestion) return;
                const options = Array.from(document.querySelectorAll("#answer-options button"));
                const choice = options[Math.floor(Math.random() * options.length)].textContent;
                answerQuestion(choice);
                botTimer = setTimeout(() => {
                    botTimer = null;
                    if (currentPlayer === 2) finishQuestion();
                }, 1400);
            }, 1100);
        }
    }, 1950);
}

function updateLives() {
    for (const [player, lives] of [[1, player1Lives], [2, player2Lives]]) {
        const element = document.getElementById(`player${player}-lives`);
        element.innerHTML = `${"❤️".repeat(lives)}${"🖤".repeat(maxLives - lives)} <span>${lives}/${maxLives} lives</span>`;
        element.setAttribute("aria-label", `Player ${player} has ${lives} of ${maxLives} lives remaining`);
        document.querySelector(`.${player === 1 ? "red" : "blue"}-card`).classList.toggle("out-of-lives", lives === 0);
    }
}

function answerQuestion(answer) {
    if (pendingDice === null || !activeQuestion || document.getElementById("question-next").hidden === false) return;
    const correct = answer === activeQuestion[2];
    const player = currentPlayer;
    const dice = pendingDice;
    const feedback = document.getElementById("question-feedback");
    const buttons = document.querySelectorAll("#answer-options button");
    buttons.forEach(button => {
        button.disabled = true;
        if (button.textContent === activeQuestion[2]) button.classList.add("correct-answer");
        else if (button.textContent === answer) button.classList.add("wrong-answer");
    });
    let message;
    if (correct) {
        let position = player === 1 ? player1 : player2;
        if (position + dice > 100) {
            message = "Correct! But you need an exact roll to reach 100.";
        } else {
            position += dice;
            message = `Correct! ${player === 2 ? "Bot" : "Player 1"} moved ${dice} spaces.`;
            if (snakes[position]) {
                position = snakes[position];
                message += " 🐍 A snake sent you down!";
            } else if (ladders[position]) {
                position = ladders[position];
                message += " 🪜 You climbed a ladder!";
            }
            if (player === 1) player1 = position;
            else player2 = position;
            updatePlayers();
            if (position === 100) {
                gameOver = true;
                message = `🎉 ${player === 2 ? "Bot" : "Player 1"} WINS! 🎉`;
                document.getElementById("turn").textContent = "GAME OVER!";
            }
        }
    } else {
        if (player === 1) player1Lives = Math.max(0, player1Lives - 1);
        else player2Lives = Math.max(0, player2Lives - 1);
        const livesLeft = player === 1 ? player1Lives : player2Lives;
        updateLives();
        if (livesLeft === 0) {
            gameOver = true;
            const winner = player === 1 ? 2 : 1;
            message = `Incorrect! Correct answer: ${activeQuestion[2]}. ${player === 2 ? "Bot" : "Player 1"} has no lives left. 🏆 ${winner === 2 ? "Bot" : "Player 1"} WINS!`;
            document.getElementById("turn").textContent = "GAME OVER!";
            document.getElementById("roll-button").disabled = true;
        } else {
            message = `Incorrect! Correct answer: ${activeQuestion[2]}. ${player === 2 ? "Bot" : "Player 1"} loses 1 life (${livesLeft} left) and stays in place.`;
        }
    }
    feedback.textContent = message;
    document.getElementById("message").textContent = message;
    document.getElementById("question-next").hidden = false;
}

function showGameOver() {
    const winner = player1 === 100 || player2Lives === 0 ? 1 : 2;
    const loser = winner === 1 ? 2 : 1;
    const winnerName = winner === 1 ? "YOU WIN!" : "BOT WINS!";
    const loserLives = loser === 1 ? player1Lives : player2Lives;
    document.getElementById("game-over-winner").textContent = winnerName;
    document.getElementById("game-over-reason").textContent = loserLives === 0
        ? `${loser === 1 ? "You have" : "The bot has"} run out of lives.`
        : `${winner === 1 ? "You reached" : "The bot reached"} square 100!`;
    const dialog = document.getElementById("game-over-dialog");
    if (!dialog.open) dialog.showModal();
}

function finishQuestion() {
    document.getElementById("question-dialog").close();
    document.getElementById("question-next").hidden = true;
    pendingDice = null;
    activeQuestion = null;
    if (gameOver) {
        showGameOver();
        return;
    }
    if (!gameOver) {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        document.getElementById("turn").textContent = `Player ${currentPlayer === 2 ? "2 (Bot)" : "1"}'s Turn`;
        document.getElementById("roll-button").disabled = currentPlayer === 2;
        if (currentPlayer === 2) {
            document.getElementById("message").textContent = "Bot is thinking...";
            botTimer = setTimeout(() => {
                botTimer = null;
                if (gameOver || currentPlayer !== 2) return;
                botTakingTurn = true;
                rollDice();
                botTakingTurn = false;
            }, 850);
        }
    }
}

// RESTART GAME

function restartGame() {
    if (botTimer !== null) clearTimeout(botTimer);
    botTimer = null;
    botTakingTurn = false;
    if (rollTimer !== null) clearTimeout(rollTimer);
    rollSequence++;
    rollTimer = null;
    rolling = false;
    resetDiceVisual();

    player1 = 1;

    player2 = 1;

    currentPlayer = 1;

    gameOver = false;
    player1Lives = maxLives;
    player2Lives = maxLives;
    pendingDice = null;
    activeQuestion = null;
    questionPool = [];
    Object.keys(questionPools).forEach(level => delete questionPools[level]);
    document.getElementById("question-dialog").close();
    document.getElementById("game-over-dialog").close();
    document.getElementById("question-next").hidden = true;

    resetDiceVisual();

    document.getElementById("message").innerHTML =
        "Roll the dice to start!";

    document.getElementById("turn").innerHTML =
        "Player 1's Turn";

    document.getElementById("roll-button").disabled = false;


    createBoard();

    updatePlayers();
    updateLives();

}


// BACK TO MAIN MENU

function backToMenu() {

    restartGame();

    document.getElementById("game").style.display = "none";

    document.getElementById("menu").style.display = "flex";

}


// MENU BACKGROUND: SLITHERING SNAKES + SWAYING VINES
// (drawn on the <canvas id="menu-bg"> behind the menu text)

(function () {

    const canvas = document.getElementById("menu-bg");

    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");

    // people who turn off animations in their system get a still picture
    const reduceMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let vines = [];
    let clock = 0;
    let lastTime = performance.now();


    // SNAKES
    // y      = height on screen (0 = top, 1 = bottom)
    // dir    = 1 moves right, -1 moves left
    // speed  = pixels per second
    // amp    = how wide the S-curves are
    // wave   = distance between curves
    // length = body length in pixels
    // width  = body thickness

    const snakes = [
        { y: 0.64, dir:  1, speed: 55, amp: 18, wave: 170, length: 360, width: 15, body: "#2f9e5b", dark: "#17623a", x: 0.15 },
        { y: 0.75, dir: -1, speed: 42, amp: 16, wave: 130, length: 300, width: 13, body: "#f08a2c", dark: "#a65412", x: 0.85 },
        { y: 0.85, dir:  1, speed: 70, amp: 12, wave: 110, length: 260, width: 11, body: "#8a63d2", dark: "#53359b", x: 0.55 }
    ];

    const LEAF_COLORS = ["#2e8b57", "#3fae5e", "#6fc46a", "#1f7a4a"];


    function resize() {

        const dpr = window.devicePixelRatio || 1;

        W = canvas.clientWidth;
        H = canvas.clientHeight;

        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        snakes.forEach(function (s) {

            if (s.hx === undefined) {
                s.hx = s.x * W;
            }

        });

        buildVines();

    }


    // VINES: longer at the sides, shorter in the middle so they don't cover the title

    function buildVines() {

        vines = [];

        const count = Math.max(6, Math.round(W / 95));

        for (let i = 0; i < count; i++) {

            const x = (i + 0.5 + (Math.random() - 0.5) * 0.5) / count * W;

            const edge = Math.abs(x - W / 2) / (W / 2);

            const len = H * (0.10 + 0.32 * edge * edge + Math.random() * 0.06);

            vines.push({
                x: x,
                len: len,
                segs: 16,
                phase: Math.random() * Math.PI * 2,
                speed: 0.7 + Math.random() * 0.6,
                sway: 10 + len * 0.07,
                leafSize: 9 + Math.random() * 5
            });

        }

    }


    function drawLeaf(x, y, angle, size, color) {

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(size * 0.5, -size * 0.55, size * 1.3, 0);
        ctx.quadraticCurveTo(size * 0.5, size * 0.55, 0, 0);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 1.1, 0);
        ctx.strokeStyle = "rgba(0, 60, 30, 0.35)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

    }


    function drawVines(t) {

        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        vines.forEach(function (v, vi) {

            const segLen = v.len / v.segs;
            const pts = [];

            for (let j = 0; j <= v.segs; j++) {

                const f = j / v.segs;

                // the lower the point, the more it swings
                const swing =
                    Math.sin(t * v.speed + v.phase + f * 2.4) * v.sway * f +
                    Math.sin(t * v.speed * 1.9 + v.phase * 1.3 + f * 4) * v.sway * 0.25 * f;

                pts.push({ x: v.x + swing, y: -6 + j * segLen });

            }

            // stem
            ctx.beginPath();

            pts.forEach(function (p, j) {

                if (j === 0) {
                    ctx.moveTo(p.x, p.y);
                } else {
                    ctx.lineTo(p.x, p.y);
                }

            });

            ctx.strokeStyle = "#1f6b3a";
            ctx.lineWidth = 5;
            ctx.stroke();

            ctx.strokeStyle = "#3a9a55";
            ctx.lineWidth = 2.5;
            ctx.stroke();

            // leaves, left and right in turn
            for (let j = 2; j <= v.segs; j += 2) {

                const p = pts[j];
                const q = pts[j - 1];

                const angle = Math.atan2(p.y - q.y, p.x - q.x);
                const side = (j / 2) % 2 === 0 ? 1 : -1;
                const flutter = Math.sin(t * v.speed * 1.6 + j + v.phase) * 0.25;
                const size = v.leafSize * (1 - 0.35 * j / v.segs);

                drawLeaf(
                    p.x, p.y,
                    angle + side * (0.9 + flutter),
                    size,
                    LEAF_COLORS[(vi + j) % LEAF_COLORS.length]
                );

            }

            // leaf at the tip
            const last = pts[v.segs];
            const prev = pts[v.segs - 1];

            drawLeaf(
                last.x, last.y,
                Math.atan2(last.y - prev.y, last.x - prev.x),
                v.leafSize * 0.8,
                LEAF_COLORS[vi % LEAF_COLORS.length]
            );

        });

    }


    function drawSnake(s, t) {

        const step = 5;
        const n = Math.floor(s.length / step);
        const pts = [];

        // body points, starting at the head and going back along a wavy path
        for (let i = 0; i <= n; i++) {

            const x = s.hx - s.dir * i * step;
            const y = s.y * H +
                Math.sin(x / s.wave * Math.PI * 2 - t * 1.2 * s.dir) * s.amp;

            const f = i / n;

            let r = (s.width / 2) * (1 - 0.8 * Math.pow(f, 1.4));

            if (i < 5) {
                r *= 0.75 + i * 0.05;   // thinner neck
            }

            r = Math.max(r, 3);         // keep the tail solid, not beaded

            pts.push({ x: x, y: y, r: r });

        }

        // outline first, then colour, so there are no rings across the body
        for (let i = n; i >= 0; i--) {

            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, pts[i].r + 2, 0, Math.PI * 2);
            ctx.fillStyle = s.dark;
            ctx.fill();

        }

        for (let i = n; i >= 0; i--) {

            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, pts[i].r, 0, Math.PI * 2);
            ctx.fillStyle = s.body;
            ctx.fill();

        }

        // spots on the back
        for (let i = 7; i < n; i += 5) {

            ctx.beginPath();
            ctx.arc(pts[i].x, pts[i].y, pts[i].r * 0.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(0, 0, 0, 0.28)";
            ctx.fill();

        }

        // head
        const hp = pts[0];
        const np = pts[3];
        const angle = Math.atan2(hp.y - np.y, hp.x - np.x);
        const hr = s.width * 0.75;

        ctx.save();
        ctx.translate(hp.x, hp.y);
        ctx.rotate(angle);

        // tongue flicks in and out
        const flick = Math.max(0, Math.sin(t * 7 + s.y * 10));

        if (flick > 0.05) {

            const start = hr * 1.2;
            const tip = start + 3 + flick * 10;

            ctx.strokeStyle = "#d62f4a";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(start, 0);
            ctx.lineTo(tip, 0);
            ctx.moveTo(tip, 0);
            ctx.lineTo(tip + 4, -3);
            ctx.moveTo(tip, 0);
            ctx.lineTo(tip + 4, 3);
            ctx.stroke();

        }

        ctx.beginPath();
        ctx.ellipse(hr * 0.2, 0, hr * 1.15 + 2, hr * 0.85 + 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = s.dark;
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(hr * 0.2, 0, hr * 1.15, hr * 0.85, 0, 0, Math.PI * 2);
        ctx.fillStyle = s.body;
        ctx.fill();

        // eyes
        [-1, 1].forEach(function (side) {

            ctx.beginPath();
            ctx.arc(hr * 0.45, side * hr * 0.5, hr * 0.32, 0, Math.PI * 2);
            ctx.fillStyle = "#fff";
            ctx.fill();

            ctx.beginPath();
            ctx.arc(hr * 0.55, side * hr * 0.5, hr * 0.16, 0, Math.PI * 2);
            ctx.fillStyle = "#111";
            ctx.fill();

        });

        ctx.restore();

    }


    function update(dt) {

        snakes.forEach(function (s) {

            s.hx += s.dir * s.speed * dt;

            // when the whole snake has left the screen, send it back to the other side
            if (s.dir === 1 && s.hx - s.length > W + 30) {
                s.hx = -30;
            }

            if (s.dir === -1 && s.hx + s.length < -30) {
                s.hx = W + 30;
            }

        });

    }


    function render(t) {

        ctx.clearRect(0, 0, W, H);

        snakes.forEach(function (s) {
            drawSnake(s, t);
        });

        drawVines(t);

    }


    function frame(now) {

        const dt = Math.min((now - lastTime) / 1000, 0.1);
        lastTime = now;

        // clientWidth is 0 while the menu is hidden (during the game), so nothing is drawn then
        if (canvas.clientWidth > 0) {

            if (canvas.clientWidth !== W || canvas.clientHeight !== H) {
                resize();
            }

            clock += dt;

            update(dt);
            render(clock);

        }

        requestAnimationFrame(frame);

    }


    resize();

    if (reduceMotion) {

        render(0);

        window.addEventListener("resize", function () {

            if (canvas.clientWidth > 0) {
                resize();
                render(0);
            }

        });

    } else {

        requestAnimationFrame(frame);

    }

})();

function showInstructions() {
    document.getElementById("instructions-dialog").showModal();
}

function closeInstructions() {
    document.getElementById("instructions-dialog").close();
}
