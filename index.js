var numberOfPlayers; 
var input;
var players = [];
var scoresDictionary = new Map();
//var scoresDictionaryReversed = new Map();
var clicked;
var playerView = "";
var throwIsDone = true;
var startingPlayerIndex;

var startButton = document.querySelector("#startButton");
var playersField = document.querySelector(".players");
startButton.addEventListener("click", initiate);

function initiate()
{
    numberOfPlayers = 0;
    playersField.innerHTML = "";
    while(players.length > 0)
    {
        players.pop();
    }
    scoresDictionary.clear();

    input = prompt("Enter number of players(2-8):");
    if(validateNumberOfPlayers(input))
    {
        for(var i = 0; i < numberOfPlayers; i++)
        {
            players.push(prompt("Enter name player " + (i + 1) + ":"));
        }
        startButton.textContent = "New Game";
        main();
    }
    else
    {
        initiate();
    }
}

function main()
{
    for(var i = 0; i < players.length; i++)
    {
        playerView += "<div class=\"player\"><div id=\"player" + (i+1) + "name\">" + players[i] + "</div><div>:</div><div id=\"player" + (i+1) + "Score\">0</div></div>";
        scoresDictionary.set("player" + (i+1), 0);
    }

    playersField.innerHTML = playerView;

    startRound("player1");

}

function validateNumberOfPlayers(input)
{
    input = parseInt(input);
    if(typeof input === 'number')
    {
        if(input > 0 && input < 9)
        {
            numberOfPlayers = input;
            return true; 
        }
        else
        {
            alert("Number must be between 2 and 8.");
            return false;
        }
    }
    else
    {
        alert("Enter a valid number between 2 and 8.");
        return false;
    }
    
}

async function startRound(player)
{
    // Determine at which player the function start to iterate ( is the person that lost the last round).
    // For example: if player 3 loses, iterate over players 3 till the end of the playerlist.
    startingPlayerIndex = getPlayerNumber(player);
    for(var i = startingPlayerIndex; i <= players.length; i++) 
    {
        await playerThrow(i);
    }
    // Finish iterating over the players from player 1 till the player that lost. 
    for(var i = 1; i < startingPlayerIndex; i++)
    {
        await playerThrow(i);
    }

    var lowestScores = determineLowestScore();

    if(lowestScores.length === 1)
    {
        playerDrink(lowestScores[0]);  
    }

    for(var i = 0; i < lowestScores.length; i++)
    {
        var number = getPlayerNumber(lowestScores[i]);
        document.querySelector("#player" + number + "Score").classList.add("lowest-score");
    }
}

function playerDrink(player)
{
    playerView = "";
    var number = getPlayerNumber(player);
    var playerScoreField = document.querySelector("#player" + number + "Score");
    playerScoreField.classList.add("lowest-score");
    playerScoreField.innerHTML = "<button id=\"player" + number + "DrinkButton\">Drink</button>" + playerScoreField.innerHTML;
        document.querySelector("#player" + number + "DrinkButton").addEventListener("click", function () {
            for(var i = 0; i < players.length; i++)
            {
                playerView += "<div class=\"player\"><div id=\"player" + (i+1) + "name\">" + players[i] + "</div><div>:</div><div id=\"player" + (i+1) + "Score\">0</div></div>";
                playersField.innerHTML = playerView;
                scoresDictionary.set("player" + (i+1), 0);
            }
            startRound(player);
        });
}

async function playerThrow(number)
{
    return new Promise(resolve => {
        document.querySelector("#player" + number + "Score").innerHTML = "<button id=\"player" + number + "Button\">Throw</button>";
        document.querySelector("#player" + number + "Button").addEventListener("click", async function () {
        document.querySelector("#player" + number + "Score").innerHTML = "throwing..";
        var diceThrown = await Promise.all([throwDiceSequence(1), throwDiceSequence(2)]);
        var playerscore = calculateScore(diceThrown);
        scoresDictionary["player" + number] = playerscore;
        document.querySelector("#player" + number + "Score").innerHTML = scoresDictionary["player" + number];
        //await waitForButtonClick("#player" + number + "Button");
        resolve();
        });
        
        
    });
        
        
}

async function startAdditionalRound(lowestScores)
{

}

function determineLowestScore()
{
    var minimum;
    var lowestScores = [];
    for(var i = 0; i < scoresDictionary.size; i ++)
    {
        if(i === 0)
        {
            minimum = scoresDictionary["player" + (i+1)];
        }
        else
        {
            if(scoresDictionary["player" + (i+1)] < minimum)
            {
                minimum = scoresDictionary["player" + (i+1)];
            }
        }
    }

    for(var i = 0; i < scoresDictionary.size; i ++)
    {
        if(scoresDictionary["player" + (i+1)] === minimum)
        {
            lowestScores.push("player" + (i+1));
        }
    }

    return lowestScores;

}

function getKeyByValue(map, searchValue)
{

}

async function waitForButtonClick(playerButton) {
  //const div = document.querySelector(".title");
  const button = document.querySelector(playerButton);
  //div.innerText = "Waiting for you to press the button";
  await getPromiseFromEvent(button, "click");
  //div.innerText = "The button was pressed!";
}

function getPlayerNumber(player)
{
    var number = parseInt(player.slice(6,7));
    return number;
}

function calculateScore(diceScores)
{
    var die1 = diceScores[0];
    var die2 = diceScores[1];
    var score;

    if(die1 > die2)
    {
        score = (die1 * 10) + die2;
    }
    if(die2 > die1)
    {
        score = (die2 * 10) + die1;
    }
    if(die1 === die2)
    {
        score = die1 * 100;
    }
    
    return score;
}

function rollDie()
{
    var singleScore = Math.floor(Math.random() * 6) + 1;
    return singleScore;
}

function adjustDieFace(die, number)
{
    var image = document.querySelector("#die" + die);
    image.setAttribute("src", "./assets/images/die" + number + ".jpg");
}

function getPromiseFromEvent(item, event) {
  return new Promise((resolve) => {
    const listener = () => {
      item.removeEventListener(event, listener);
      resolve();
    }
    item.addEventListener(event, listener);
  })
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function throwDiceSequence(die)
{
    var numberOfRolls = Math.floor((Math.random() * 7) + 3);
    var numberThrown;
    for(var i = 0; i < numberOfRolls; i++)
    {
        numberThrown = rollDie();
        adjustDieFace(die, numberThrown);
        await sleep(i * 100);
    }

    return numberThrown;
}