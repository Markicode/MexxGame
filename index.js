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
    // Clear the content if the game was previously played.
    numberOfPlayers = 0;
    playersField.innerHTML = "";
    playerView = "";

    while(players.length > 0)
    {
        players.pop();
    }
    scoresDictionary.clear();

    // Ask user for player information and validate the value of the number of players inserted.
    // If the value doesnt comply, try again, else start the main() function.
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
    // Upon start of the main function, create a view for the players and insert it into the html file and create a scorechart. Then start the round with the first player.
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
    // The user input is tested to see if it meets the requirements (must be a number between 2 and 8).
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

// Handles all the functionality for a full round of mexx and takes a player parameter to determine which player should start.
async function startRound(player)
{
    // Before the round is started, all data from a possible previously played game must be reset. 
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

    // Most functions within the round will be carried out in 2 loops to ensure that the order in which players
    // take turns is uphold using the startingPlayerIndex for reference.
    // First all the players will throw a set of dice using the playerThrow function. The Promise that said function returns will be awaited. 
    for(var i = startingPlayerIndex; i <= players.length; i++) 
    {
        await playerThrow(i);
    }

    for(var i = 1; i < startingPlayerIndex; i++)
    {
        await playerThrow(i);
    }

    // All the results from the dice thrown by the players will be evaluated with the determineLowestScore function.
    // This function will return an array holding the player(s) with the lowest score(s).
    var lowestScores = determineLowestScore();

    // Because the round will only finish when a single person has the lowest score, a while loop ensures that 
    // the players that are left over keep playing. 
    while(roundFinished === false)
    {

    // When the while loop is entered, a for loop will check if possible class changes handed out in a previous loop should be reversed,
    for(var i = 1; i <= players.length; i++)
    {
        if(document.querySelector("#player" + i + "Score").classList.contains("lowest-score"))
        {   
            document.querySelector("#player" + i + "Score").classList.remove("lowest-score");
        }
    }

    // Players with the lowest score will have a class change in their score view, making the score red.
    for(var i = 0; i < lowestScores.length; i++)
    {
        var number = getPlayerNumber(lowestScores[i]);
        document.querySelector("#player" + number + "Score").classList.add("lowest-score");
    }

    // If a single player has the lowest score, the round has ended and the player will be alerted to drink.
    if(lowestScores.length === 1)
    {
        playerDrink(lowestScores[0]); 
        roundFinished = true; 
    }

    // If there are multiple players with the lowest score, an array is created and filled with said players. 
    // Because they start over, their scores will be reset to 0, and the other players scores will be set to 1000, 
    // so their score wont be taken into account in the evaluation of the subround.
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

        // The array with the remaining players will be iterated over to have them throw again. 
        // Their new scores will be evaluated, and the while loop will be restarted to check if there is a single lowest score, or another subround should be played.
        for(var i = 0; i < playersToRethrow.length; i++) 
        {
            var number = getPlayerNumber(playersToRethrow[i]);
            await playerThrow(number);
        }

        lowestScores = determineLowestScore();
    }
    }

}   

// This function is called if a single person has the lowest score of the round. The player is added as a parameter so the corresponding html code can be manipulated.
function playerDrink(player)
{
    // To make the game wait for player response, this function returns a Promise which, among other things, resolves a click event of the drink button.
    return new Promise(resolve => {
    playerView = "";
    var number = getPlayerNumber(player);

    // I a multiplier is active (bigger than 0), the drink button wil have a different text.
    if(multiplier === 0)
    {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "DrinkButton\">Drink!</button>";
    }
    else
    {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "DrinkButton\">Drink " + multiplier + " Times!</button>";
    }

    // When the drink button is clicked, the playerfield and the scorechart are reinitialized. and a new round is started with the losing player to start. 
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

// The playerThrow function takes a number which represents the player that throws the dice. This function also returns a Promise to make the game wait on the outcome.
async function playerThrow(number)
{
    // The promise creates a throw button, adds an eventlistener and resolves all code in the eventhandler.
    return new Promise(resolve => {
        document.querySelector("#player" + number + "Button").innerHTML = "<button id=\"player" + number + "Button\">Throw</button>";
        document.querySelector("#player" + number + "Button").addEventListener("click", async function throwHandler() {
        document.querySelector("#player" + number + "Button").innerHTML = "throwing..";

        // 2 throwDiceSequences are initiated to illustrate the dices rolling, and the thrown faces are waited on. 
        var diceThrown = await Promise.all([throwDiceSequence(1), throwDiceSequence(2)]);
        document.querySelector("#player" + number + "Button").innerHTML = "";
        // The faces thrown with the dice are used to calculate the score.
        var playerscore = calculateScore(diceThrown);
        // The score is added to the scorechart at the spot of the matching player. 
        // If the score is 21, the multiplier is incremented.
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
        document.querySelector("#player" + number + "Button").removeEventListener("click", throwHandler); 
        resolve();
        });
        
        
    });
        
        
}


function determineLowestScore()
{
    // To determine which players have the lowest scores, first the lowest score is found.
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

    // All players matching the minimum are added to an array which is returned to the caller.
    for(var i = 1; i <= scoresDictionary.size; i ++)
    {
        if(scoresDictionary["player" + i] === minimum)
        {
            lowestScores.push("player" + i);
        }
    }

    return lowestScores;
}

/*async function waitForButtonClick(playerButton) {
  //const div = document.querySelector(".title");
  const button = document.querySelector(playerButton);
  //div.innerText = "Waiting for you to press the button";
  await getPromiseFromEvent(button, "click");
  //div.innerText = "The button was pressed!";
}*/

// Players are identified by a number. This functions singles out the number. 
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

// Returns a value between and including 1 and 6.
function rollDie()
{
    var singleScore = Math.floor(Math.random() * 6) + 1;
    return singleScore;
}

// Change a die image to a corresponding value.
function adjustDieFace(die, number)
{
    var image = document.querySelector("#die" + die);
    image.setAttribute("src", "./assets/images/die" + number + ".jpg");
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// To simulate the dice rolling, the face of the dice will change multiple times with the stops in between grwoing till the end of the roll.
async function throwDiceSequence(die)
{
    var numberOfRolls = Math.floor((Math.random() * 7) + 3);
    var numberThrown;
    for(var i = 0; i < 20; i++)
    {
        numberThrown = rollDie();
        adjustDieFace(die, numberThrown);
        await sleep(50);
    }

    for(var i = 0; i < numberOfRolls; i++)
    {
        numberThrown = rollDie();
        adjustDieFace(die, numberThrown);
        await sleep(i * 100);
    }

    return numberThrown;
}