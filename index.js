// Global variables declaration.
var numberOfPlayers; 
var input;
var players = [];
var scoresDictionary = new Map();
var clicked;
var playerView = "";
var roundFinished = false;
var startingPlayerIndex;
var multiplier;

var startButton = document.querySelector("#startButton");
var playersField = document.querySelector(".players");
startButton.addEventListener("click", initiate);

function initiate()
{
    // Clear the content if  game was previously played.
    numberOfPlayers = 0;
    playersField.innerHTML = "";
    playerView = "";

    while(players.length > 0)
    {
        players.pop();
    }
    scoresDictionary.clear();

    // Ask user for player information and validate the value of the number of players inserted.
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
        playerView += "<div class=\"player\"><div id=\"player" + (i+1) + "name\">" + players[i] + "</div><div id=\"player" + (i+1) + "Button\"></div><div id=\"player" + (i+1) + "Score\">0</div></div>";
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
    for(var i = 1; i <= players.length; i++)
    {
        if(document.querySelector("#player" + i + "Score").classList.contains("lowest-score"))
        {   
            document.querySelector("#player" + i + "Score").classList.remove("lowest-score");
        }
    }

    document.querySelector("h1").innerHTML = "Time to play Mexx!";
    multiplier = 0;
    roundFinished = false;
    startingPlayerIndex = getPlayerNumber(player);
    for(var i = startingPlayerIndex; i <= players.length; i++) 
    {
        await playerThrow(i);
    }

    for(var i = 1; i < startingPlayerIndex; i++)
    {
        await playerThrow(i);
    }

    
    var lowestScores = determineLowestScore();

    while(roundFinished === false)
    {

    for(var i = 1; i <= players.length; i++)
    {
        if(document.querySelector("#player" + i + "Score").classList.contains("lowest-score"))
        {   
            document.querySelector("#player" + i + "Score").classList.remove("lowest-score");
        }
    }

    for(var i = 0; i < lowestScores.length; i++)
    {
        var number = getPlayerNumber(lowestScores[i]);
        document.querySelector("#player" + number + "Score").classList.add("lowest-score");
    }

    

    if(lowestScores.length === 1)
    {
        playerDrink(lowestScores[0]); 
        roundFinished = true; 
    }
    if(lowestScores.length > 1)
    {
        var playersToRethrow = [];
        for(var i = startingPlayerIndex; i <= players.length; i++) 
        {
            if(lowestScores.includes("player" + i))
            {
                playersToRethrow.push("player" + i);
                scoresDictionary["player" + i] = 0;
            }
            else
            {
                scoresDictionary["player" + i] = 1000;
            }
        }

        for(var i = 1; i < startingPlayerIndex; i++) 
        {
            if(lowestScores.includes("player" + i))
            {
                playersToRethrow.push("player" + i);
                scoresDictionary["player" + i] = 0;
            }
            else
            {
                scoresDictionary["player" + i] = 1000;
            }
        }

        for(var i = 0; i < playersToRethrow.length; i++) 
        {
            var number = getPlayerNumber(playersToRethrow[i]);
            await playerThrow(number);
        }

        lowestScores = determineLowestScore();
    }
    }

}   


function playerDrink(player)
{
    return new Promise(resolve => {
    playerView = "";
    var number = getPlayerNumber(player);
    var playerScoreField = document.querySelector("#player" + number + "Score");
    if(multiplier === 0)
    {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "DrinkButton\">Drink!</button>";
    }
    else
    {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "DrinkButton\">Drink " + multiplier + " Times!</button>";
    }
        document.querySelector("#player" + number + "DrinkButton").addEventListener("click", function drinkHandler () {
            document.querySelector("#player" + number + "DrinkButton").removeEventListener("click", drinkHandler);
            for(var i = 0; i < players.length; i++)
            {
                playerView += "<div class=\"player\"><div id=\"player" + (i+1) + "name\">" + players[i] + "</div><div id=\"player" + (i+1) + "Button\"></div><div id=\"player" + (i+1) + "Score\">0</div></div>";
                playersField.innerHTML = playerView;
                scoresDictionary.set("player" + (i+1), 0);
            }
            resolve();
            startRound(player);
        });

    });
}

async function playerThrow(number)
{
    return new Promise(resolve => {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "Button\">Throw</button>";
        document.querySelector("#player" + number + "Button").addEventListener("click", async function throwHandler() {
        document.querySelector("#player" + number + "Button").innerHTML = "throwing..";
        var diceThrown = await Promise.all([throwDiceSequence(1), throwDiceSequence(2)]);
        document.querySelector("#player" + number + "Button").innerHTML = "";
        var playerscore = calculateScore(diceThrown);
        scoresDictionary["player" + number] = playerscore;
        if(playerscore === 21)
        {
            if(multiplier === 0)
            {
                multiplier = 2;
            }
            else
            {
                multiplier *= 2;
            }

            document.querySelector("h1").innerHTML = "Current Multiplier: " + multiplier;
        }
        document.querySelector("#player" + number + "Score").innerHTML = scoresDictionary["player" + number];
        //await waitForButtonClick("#player" + number + "Button");
        document.querySelector("#player" + number + "Button").removeEventListener("click", throwHandler); 
        resolve();
        });
        
        
    });
        
        
}

async function startAdditionalRound(lowestScores)
{

}

function determineLowestScore()
{
    var minimum = 0;
    var lowestScores = [];
    for(var i = 1; i <= scoresDictionary.size; i ++)
    {
        if(minimum === 0 && scoresDictionary["player" + i] > 21)
        {
            minimum = scoresDictionary["player" + i];
        }
        else
        {
            if(scoresDictionary["player" + i] < minimum && scoresDictionary["player" + i] > 21)
            {
                minimum = scoresDictionary["player" + i];
            }
        }
    }

    for(var i = 1; i <= scoresDictionary.size; i ++)
    {
        if(scoresDictionary["player" + i] === minimum)
        {
            lowestScores.push("player" + i);
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
    var singleScore = Math.floor(Math.random() * 3) + 1;
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