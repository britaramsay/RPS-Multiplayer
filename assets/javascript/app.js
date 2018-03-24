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
console.log('new: ' + numPlayers);
    if(numPlayers < 3) {
        $('#player').html('Hello, ' + playerName + '<br>You are player ' + numPlayers);

        database.ref('/players/' + numPlayers).set({
            name: playerName,
            wins: 0,
            losses: 0,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
            
        });
        if(numPlayers == 2) {
            $('#choices-1').html('<p class="choice" id="rock">Rock</p><br><p class="choice" id="paper-1">Paper</p><br><p class="choice" id="scissors">Scissors</p>');

            $('#name-2').text('Waiting for player 2');
        }
        else if(numPlayers == 3) {
            $('#choices-2').html('<p class="choice" id="rock">Rock</p><br><p class="choice" id="paper-1">Paper</p><br><p class="choice" id="scissors">Scissors</p>').hide();

            $('#choices-1').text('Waiting for player 1 to play');
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

$('#choices-' + turn).on('click', ".choice", function () {  
    console.log($(this).attr('id'));

    database.ref('/players/' + turn).push({
        choice: $(this).attr('id')
    });


    $('#choices-' + turn).hide();
    

    if(turn == 1) turn++;
    else turn--;
    $('#choices-' + turn).html('Waiting for player ' + turn + ' to play');



    database.ref().update({turn: turn});
});

database.ref().child('turn').on('value', function () {
    console.log('hi');
});

/*
set turn




*/