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
    player2Wins;

// Add ourselves to presence list when online.
var connectionsRef = database.ref('/connections');

var connectedRef = database.ref('.info/connected');

connectedRef.on('value', function(snapshot) {
  if(snapshot.val()) {
    var con = connectionsRef.push(true);
    console.log(con);
    con.onDisconnect().remove();
  }
});

// When first loaded or when the connections list changes...
connectionsRef.on("value", function(snap) {
    var numUsers = snap.numChildren();
    // Display the viewer count in the html.
    // The number of online users is the number of children in the connections list.
    if(numUsers > 1)    $('#watchers').text(numUsers + ' users online');
    else    $('#watchers').text(numUsers + ' user online');
});