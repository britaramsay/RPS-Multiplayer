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
    numPlayers;

// Add ourselves to presence list when online.
var connectionsRef = database.ref('/connections');

var connectedRef = database.ref('.info/connected');

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
        console.log(numPlayers);

        database.ref('/players/' + numPlayers).set({
            name: playerName,
            wins: 0,
            losses: 0
        });
    }
});

// When a new entry is added to players in firebase
database.ref("/players").on("value", function(snapshot) {
    console.log(snapshot.val());
    // If one person has already entered their name
    if (!snapshot.child(1).exists()){
        // Set numPlayers to 2
        numPlayers = 1;
    }
    else {
        $('#player-'+numPlayers).html(snapshot.child(numPlayers+'/name').val());

        numPlayers++;
    }
})