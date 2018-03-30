// Initialize Firebase
var config = {
    apiKey: "AIzaSyC-Gh6ps_PbykKArzReBmlRhRM4QwY_ODU",
    authDomain: "rock-paper-scissors-988ad.firebaseapp.com",
    databaseURL: "https://rock-paper-scissors-988ad.firebaseio.com",
    projectId: "rock-paper-scissors-988ad",
    storageBucket: "",
    messagingSenderId: "625561753772"
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
    });
});

// TODO: pass player number disconnected
// remove disconnected
// clear other players wins losses

connectedRef.on('value', function(snapshot) {
    console.log(player);
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

// When first loaded or when the connections list changes...
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

$('#submit-name').on('click', function() {
    // Prevent page refreshing
    event.preventDefault();
    // Get player name for input
    var playerName = $('#player-name').val().trim();
    // Show players panel
    $('#players').show();

    if(numPlayers < 3) {
        $('#player').html('Hello, ' + playerName + '<br>You are player ' + numPlayers);

        database.ref('/players/' + numPlayers).set({
            name: playerName,
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
            
        });
        if(numPlayers == 2) {
            $('#choices-1').html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>');

            $('#name-2').text('Waiting for player 2');

            player = 1;
        }
        else if(numPlayers == 3) {
            $('#choices-2').html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>').hide();

            $('#choices-1').text('Waiting for player 1 to play');

            player = 2;
            
            // add event listener for player 2 choice
            listenForTurn(2);

        }
    }

    $('#form-panel').hide();
});

$('#submit-msg').on('click', function (event) { 
    event.preventDefault();

    var message = $('#chat-message').val().trim();

    database.ref('/messages').push({
        sender: player,
        message: message
    });

    $('#chat-message').val('');
});

database.ref('/messages').on('child_added', function (childSnapshot) {  
    // alert(childSnapshot.val().sender);
    var msg = $('<div>');
    msg.html("Player " + childSnapshot.val().sender + ": " + childSnapshot.val().message + "\n");
    $('#messages').append(msg);

});

// When a new entry is added to players in firebase
database.ref("/players").on("value", function(snapshot) {
    // If no one has entered their name yet
    if (!snapshot.child(1).exists()){
        // Set numPlayers to 1
        numPlayers = 1;
    }
    else if(snapshot.child(1).exists() && !snapshot.child(2).exists()){
        $('#name-1').text(snapshot.child('1/name').val());
        $('#wins-1').text('Wins: ' + snapshot.child('1/wins').val());
        $('#losses-1').text('Losses: ' + snapshot.child('1/losses').val());
        numPlayers++;
        
    }
    else if(snapshot.child(2).exists()){
        $('#name-2').text(snapshot.child('2/name').val());
        $('#wins-2').text('Wins: ' + snapshot.child('2/wins').val());
        $('#losses-2').text('Losses: ' + snapshot.child('2/losses').val());
        numPlayers++;

    }

})

function listenForTurn(child) {
    database.ref().child('turn').on('value', function (snap) {
        turn = snap.val();
        console.log(turn);
        if(turn == child)
            $("#choices-" + child).html('<button class="btn btn-default choice" id="rock">Rock</button><br><button class="btn btn-default choice" id="paper">Paper</button><br><button class="btn btn-default choice" id="scissors">Scissors</button>').show();
    });
    console.log('player: ' + player);
}

$('#choices-1').on('click', ".choice", function () {  

    var choice = $(this).attr('id');

    database.ref('/players/' + turn).once('value', function(snapshot) {
         database.ref('/players/' + turn).update({choice: choice});
    });

    $('#choices-' + turn).hide();   

    if(turn == 1) turn++;
    else turn--;
    console.log(turn);

    $('#choices-' + turn).html('Waiting for player ' + turn + ' to play');

    database.ref().update({turn: turn});
    
    displayResults();
    listenForTurn(1);
});

$('#choices-2').on('click', ".choice", function () {  

    var choice = $(this).attr('id');
    database.ref('/players/' + turn).once('value', function(snapshot) {
        database.ref('/players/' + turn).update({choice: choice});
    });
    
    // Call rock paper scissors here
    // update winner
    // on winner change, display
    rockPaperScissors();

    $('#choices-' + turn).hide();   

    if(turn == 1) turn++;
    else turn--;
    console.log(turn);

    $('#choices-' + turn).html('Waiting for player ' + turn + ' to play');

    database.ref().update({turn: turn});

    listenForTurn(2);
});

function rockPaperScissors() {
    var choice1,
        choice2,
        winner,
        loser,
        wins1,
        wins2,
        losses1,
        losses2;

    database.ref('/players/1').once('value', function (snap) {  
        choice1 = snap.val().choice;
        wins1 = snap.val().wins;
        losses1 = snap.val().losses;
    });
    database.ref('/players/2').once('value', function (snap) {  
        choice2 = snap.val().choice;
        wins2 = snap.val().wins;
        losses2 = snap.val().losses;
    });

    if (choice1 == choice2) alert('tie');
    else if((choice1 == 'paper') && (choice2 == 'scissors'))    {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'rock') && (choice2 == 'paper'))        {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'scissors') && (choice2 == 'rock'))     {winner = 2; wins2++; losses1++;}
    else if((choice1 == 'paper') && (choice2 == 'rock'))        {winner = 1; wins1++; losses2++;}
    else if((choice1 == 'rock') && (choice2 == 'scissors'))     {winner = 1; wins1++; losses2++;}
    else if((choice1 == 'scissors') && (choice2 == 'paper'))    {winner = 1; wins1++; losses2++;}

    if (winner == 1) {
        database.ref('/players/1').update({
            wins: wins1
        });
        database.ref('/players/2').update({
            losses: losses2
        });
    }
    else if (winner == 2) {
        database.ref('/players/2').update({
            wins: wins2
        });
        database.ref('/players/1').update({
            losses: losses1
        });
    }

    displayResults();
}

function displayResults() {  

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

    // Change results display in show options
}





// click to play



/*
set turn




*/