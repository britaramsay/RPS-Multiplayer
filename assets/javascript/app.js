// Initialize Firebase
var config = {
    apiKey: "AIzaSyB_f1ozFigbix5C3GxCElwGTyyckWMSKUU",
    // authDomain: "rpsmultiplayer-45512.firebaseapp.com",
    databaseURL: "https://rpsmultiplayer-45512.firebaseio.com",
    projectId: "rpsmultiplayer-45512",
    storageBucket: "",
    messagingSenderId: "167498076580"
  };

firebase.initializeApp(config);

var database = firebase.database();

var player,
    player1Choice,
    player2Choice,
    player1Wins,
    player2Wins,
    numUsers,
    numPlayers,
    turn = 1;

// Add ourselves to presence list when online.
var connectionsRef = database.ref('/connections');

var connectedRef = database.ref('.info/connected');

var playerRef = database.ref('/players');

var messagesRef = database.ref('/messages');

$(document).ready(function (){
    $('#players').hide();
    $('#chatbox').hide();

    database.ref().once('value', function (snapshot) {
        // If turn is not in database 
        if(!snapshot.hasChild('turn')) {
            // Set to 1
            database.ref().set({
                turn: 1
            });
            // Set turn variable to 1
            turn = 1;
        }
        if(!snapshot.hasChild('ties')) {
            // Set to 1
            database.ref().set({
                ties: 0
            });
        }
    });
});

// TODO: pass player number disconnected
// remove data on disconnect of just that player
// clear other players wins losses

connectedRef.on('value', function(snapshot) {

    if(snapshot.val()) {
        var con = connectionsRef.push(true);
        con.onDisconnect().remove();
        // Remove all player information
        playerRef.onDisconnect().remove();

        messagesRef.onDisconnect().remove();
        // Set turn to 1
        database.ref().onDisconnect().update({
            turn: 1
        });
    }
});

// When first loaded or when the connections list changes
connectionsRef.on("value", function(snap) {
    
    numUsers = snap.numChildren();
    // The number of online users is the number of children in the connections list.
    if(numUsers > 1) {
        $('#watchers').text(numUsers + ' users online');
    }
    else {
        $('#watchers').text(numUsers + ' user online');
    }
});
// When a user submits their name to play
$('#submit-name').on('click', function() {
    // Prevent page refreshing
    event.preventDefault();
    // Get player name for input
    var playerName = $('#player-name').val().trim();
    // Show players panel
    $('#players').show();
    // Only add if their are 2 players or less
    if(numPlayers < 3) {
        // Grett player
        $('#player').html('Hello, ' + playerName + '<br>You are player ' + numPlayers);
        // Set player name under the correct number
        database.ref('/players/' + numPlayers).set({
            name: playerName,
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        // This is actually player 1
        if(numPlayers == 2) {
            // Update their RPS choices
            $('#choices-1').html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>');

            $('#name-2').text('Waiting for player 2');
            // Set player variable to 1
            player = 1;
        }
        // This is only player 2
        else if(numPlayers == 3) {
            // Set their choices but hide them until their turn
            $('#choices-2').html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>').hide();

            $('#turn').text('Waiting for player 1 to play');
            // Set player to 2
            player = 2;
            // add event listener for player 2 choice
            listenForTurn(2);
        }
    }
    // Hide enter name panel
    $('#form-panel').hide();
});

$('#submit-msg').on('click', function (event) { 
    // When a user clicks send, don't refresh the page
    event.preventDefault();
    // Savce message
    var message = $('#chat-message').val().trim();
    // Send to firebase
    database.ref('/messages').push({
        sender: player,
        message: message
    });
    // Reset textarea value
    $('#chat-message').val('');
});
// When a message is added
database.ref('/messages').on('child_added', function (childSnapshot) {  
    // Create a div element
    var msg = $('<div>');
    // Set html to the message
    msg.html("Player " + childSnapshot.val().sender + ": " + childSnapshot.val().message + "\n");
    // Append to messages
    $('#messages').append(msg);
});

// When a new entry is added to players in firebase
database.ref("/players").on("value", function(snapshot) {
    // If no one has entered their name yet
    if (!snapshot.child(1).exists()){
        // Set numPlayers to 1
        numPlayers = 1;
    }
    // If only one player exists
    else if(snapshot.child(1).exists() && !snapshot.child(2).exists()){
        // Set divs based on player 1 data
        $('#name-1').text(snapshot.child('1/name').val());
        $('#wins-1').text('Wins: ' + snapshot.child('1/wins').val());
        $('#losses-1').text('Losses: ' + snapshot.child('1/losses').val());
        // Increment numPlayers
        numPlayers++;
    }
    // If there are two players
    else if(snapshot.child(2).exists()){
        // Set divs with player 2 data
        $('#name-2').text(snapshot.child('2/name').val());
        $('#wins-2').text('Wins: ' + snapshot.child('2/wins').val());
        $('#losses-2').text('Losses: ' + snapshot.child('2/losses').val());
        // Increment numPlayers, so it doesn't add more users to database
        numPlayers++;
        // Show chatbox when two players are connected
        $('#chatbox').show();
    }

})
// Tells a player when it is their turn
function listenForTurn(child) {
    // When the value of turn changes
    database.ref().child('turn').on('value', function (snap) {
        // If variable turn matches turn in the database
        turn = snap.val();
        // If turn is the same as the number the function was called with
        if(turn == child) {
            // Show choices button to the users
            $('#turn').html('');
            $("#choices-" + child).html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>').show();
        }
    });
}
// When player 1 chooses
$('#choices-1').on('click', ".choice", function () {  
    // Save their choice as a variable  
    var choice = $(this).attr('id');
    // Update their choice in firebase as the one they just picked
    database.ref('/players/' + turn).once('value', function(snapshot) {
         database.ref('/players/' + turn).update({choice: choice});
    });
    // Hide RPS buttons
    $('#choices-' + turn).hide();   
    // Change turn to 2
    // TODO: make this function work for both users
    if(turn == 1) turn++;
    else turn--;
    // Tell user it is the other players turn
    $('#turn').html('Waiting for player ' + turn + ' to play');
    // Update turn in firebase
    database.ref().update({turn: turn});
    // Call display results for after player 2 plays
    displayResults();
    // Listen for it to be their turn again
    listenForTurn(1);
});
// When player 2 chooses
$('#choices-2').on('click', ".choice", function () {  
    // Save their choice as a variable  
    var choice = $(this).attr('id');
    // Update their choice in firebase as the one they just picked    
    database.ref('/players/' + turn).once('value', function(snapshot) {
        database.ref('/players/' + turn).update({choice: choice});
    });
    // Call rock paper scissors here discide the winner and loser
    rockPaperScissors();
    // Hide RPS buttons
    $('#choices-' + turn).hide();   
    // Change turn to 1
    // TODO: make this function work for both users
    if(turn == 1) turn++;
    else turn--;
    // Tell user it is the other players turn
    $('#turn').html('Waiting for player ' + turn + ' to play');
    // Update turn in firebase
    database.ref().update({turn: turn});
    // Listen for it to be their turn again
    listenForTurn(2);
});

function rockPaperScissors() {
    // Needed variables
    var choice1,
        choice2,
        winner,
        loser,
        wins1,
        wins2,
        losses1,
        losses2,
        ties;
    // Refernce player 1 in the database once
    database.ref('/players/1').once('value', function (snap) {  
        // Save their current choice and current wins/losses
        choice1 = snap.val().choice;
        wins1 = snap.val().wins;
        losses1 = snap.val().losses;
    });
    // Refernce player 2 in the database once    
    database.ref('/players/2').once('value', function (snap) {  
        // Save their current choice and current wins/losses       
        choice2 = snap.val().choice;
        wins2 = snap.val().wins;
        losses2 = snap.val().losses;
    });
    // RPS outcomes to decide the winner and loser
    if (choice1 == choice2) {
        database.ref().once('value', function (snap) {  
            // Save their current choice and current wins/losses       
            ties = snap.val().ties;
            ties++;
            database.ref().update({
                ties: ties
            });
        });
        
    }
    else if((choice1 == 'paper') && (choice2 == 'scissors'))    {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'rock') && (choice2 == 'paper'))        {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'scissors') && (choice2 == 'rock'))     {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'paper') && (choice2 == 'rock'))        {winner = 1; wins1++; losses2++;}
    else if((choice1 == 'rock') && (choice2 == 'scissors'))     {winner = 1; wins1++; losses2++;}
    else if((choice1 == 'scissors') && (choice2 == 'paper'))    {winner = 1; wins1++; losses2++;}
    // If player 1 won
    if (winner == 1) {
        // Update each player correctly
        database.ref('/players/1').update({
            wins: wins1
        });
        database.ref('/players/2').update({
            losses: losses2
        });
    }
    // If player 2 won    
    else if (winner == 2) {
        // Update each player correctly        
        database.ref('/players/2').update({
            wins: wins2
        });
        database.ref('/players/1').update({
            losses: losses1
        });
    }
    // Display results called for player 2
    displayResults();
}

function displayResults() {  
    // Reference the databse and display each players wins and loses in the correct divs
    database.ref('/players/1').child('wins').on('value', function (snap) {
        $('#wins-1').text('Wins: ' + snap.val());
    });
    database.ref('/players/1').child('losses').on('value', function (snap) {
        $('#losses-1').text('Losses: ' + snap.val());
    });
    database.ref('/players/2').child('wins').on('value', function (snap) {
        $('#wins-2').text('Wins: ' + snap.val());
    });
    database.ref('/players/2').child('losses').on('value', function (snap) {
        $('#losses-2').text('Losses: ' + snap.val());
    });
    database.ref().child('ties').on('value', function (snap) {
        $('#ties').text('Ties: ' + snap.val());
    });
}