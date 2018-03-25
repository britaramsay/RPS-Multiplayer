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

var player1Choice,
    player2Choice,
    player1Wins,
    player2Wins,
    numUsers,
    numPlayers,
    turn = 1;

// Add ourselves to presence list when online.
var connectionsRef = database.ref('/connections');

var connectedRef = database.ref('.info/connected');

$(document).ready(function (){
    database.ref().once('value', function (snapshot) {
        if(!snapshot.hasChild('turn')) {
            database.ref().set({
                turn: 1
            });
            turn = 1;
        }
    });
});


connectedRef.on('value', function(snapshot) {

    if(snapshot.val()) {
    var con = connectionsRef.push(true);
    con.onDisconnect().remove();
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
    event.preventDefault();

    var playerName = $('#player-name').val().trim();

    if(numPlayers < 3) {
        $('#player').html('Hello, ' + playerName + '<br>You are player ' + numPlayers);

        database.ref('/players/' + numPlayers).set({
            name: playerName,
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
            
        });
        if(numPlayers == 2) {
            $('#choices-1').html('<p class="choice" id="rock">Rock</p><br><p class="choice" id="paper">Paper</p><br><p class="choice" id="scissors">Scissors</p>');

            $('#name-2').text('Waiting for player 2');
            // cal function from here???
            // if choice????
        }
        else if(numPlayers == 3) {
            $('#choices-2').html('<p class="choice" id="rock">Rock</p><br><p class="choice" id="paper">Paper</p><br><p class="choice" id="scissors">Scissors</p>').hide();

            $('#choices-1').text('Waiting for player 1 to play');
            // if player 1 choice, display button
            
            // add event listener for player 1 choice
            listenForTurn(2);

        }
    }

    $('#form-panel').hide();
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
            $("#choices-" + child).html('<p class="choice" id="rock">Rock</p><br><p class="choice" id="paper">Paper</p><br><p class="choice" id="scissors">Scissors</p>').show();
    });

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
        loser;
    database.ref('/players/1').once('value', function (snap) {  
        choice1 = snap.val().choice;
    });
    database.ref('/players/2').once('value', function (snap) {  
        choice2 = snap.val().choice;
    });
    if (choice1 == choice2) alert('tie');
    else if((choice1 == 'paper') && (choice2 == 'scissors')) {winner = 2; loser = 1;alert('player 2');}
    else if((choice1 == 'rock') && (choice2 == 'paper')) {winner = 2; loser = 1;alert('player 2');}
    else if((choice1 == 'scissors') && (choice2 == 'rock')) {winner = 2; loser = 1;alert('player 2');}
    else if((choice1 == 'paper') && (choice2 == 'rock')) {winner = 1; loser = 2;alert('player 1');}
    else if((choice1 == 'rock') && (choice2 == 'scissors')) {winner = 1; loser = 2;alert('player 1');}
    else if((choice1 == 'scissors') && (choice2 == 'paper')) {winner = 1; loser = 2;alert('player 1');}

    if (winner == 1) {
        database.ref('/players/1').update({
            wins: 1
        });
        database.ref('/players/2').update({
            loses: 1
        });
    }
    else if (winner == 2) {
        database.ref('/players/2').update({
            wins: 1
        });
        database.ref('/players/1').update({
            loses: 1
        });
    }
}



// click to play



/*
set turn




*/