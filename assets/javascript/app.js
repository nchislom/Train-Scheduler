// Initialize Firebase
var config = {
    apiKey: "AIzaSyDN2jb9EjvwpXcO6oLGdEpBZLurDoevBFQ",
    authDomain: "test-d6eee.firebaseapp.com",
    databaseURL: "https://test-d6eee.firebaseio.com",
    projectId: "test-d6eee",
    storageBucket: "test-d6eee.appspot.com",
    messagingSenderId: "580661366404"
};

firebase.initializeApp(config);

// Global database variable declaration for ease of use
const database = firebase.database();

// DOM Element Globals
var trainTable = $("#train-table-data");
var nameInput = "";
var destinationInput = "";
var firstTimeInput = "";
var frequencyInput = "";
var errorModal = $("#error-modal");

var currentTime = moment();

function getNextArrival(first, freq){
    let firstTimeConverted = moment.utc(first, "HH:mm").subtract(1, "years");
    let diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    let remainder = diffTime % freq;
    let minutesTillTrain = freq - remainder;
    let nextTrain = moment().add(minutesTillTrain, "minutes");
    return nextTrain;
}

function getMinutesAway(first, freq){
    let firstTimeConverted = moment.utc(first, "HH:mm").subtract(1, "years");
    let diffTime = moment().diff(moment(firstTimeConverted), "minutes");
    let remainder = diffTime % freq;
    return freq - remainder;
}

// Submit Button Click Handler
$("#submit-button").on("click", function(){
    event.preventDefault();

    
    // Store trimmed values of DOM elements into vars
    nameInput = $("#train-name-input").val().trim();
    destinationInput = $("#train-destination-input").val().trim();
    firstTimeInput = $("#first-train-input").val().trim();
    frequencyInput = $("#train-frequency-input").val().trim();
    
    // Clear error/helper texts
    $("#first-train-helper").empty();
    $("#train-frequency-helper").empty();
    
    // Input Field Validation

    // RegEx patterns test to show error test for train time input
    if(!/^([01]\d|2[0-3]):([0-5]\d)$/.test(firstTimeInput)){
        $("#first-train-helper").text("Please enter the time using valid military format (ex: 04:00 or 16:00)");
    } 
    
    // Test to show error text for train frequency
    if(parseInt(frequencyInput) <= 0) {
        $("#train-frequency-helper").text("Please enter a valid frequency time -- example: 45");
    }
    
    // Proceed with input flow if both tests pass
    if((/^([01]\d|2[0-3]):([0-5]\d)$/.test(firstTimeInput)) && (parseInt(frequencyInput) > 0)) {
        // Cast input string to int
        frequencyInput = parseInt(frequencyInput);

        // Clear inputs and table upon input validation
        trainTable.empty();
        $("input").val("");

        // New train object
        var newTrain = {
            name: nameInput,
            destination: destinationInput,
            firstTime: firstTimeInput,
            frequency: frequencyInput
        }

        // Push train object to db
        database.ref().push(newTrain);

        // Database snapshot listener
        database.ref().on("child_added", function(childSnapshot){

            let childFirstTime = childSnapshot.val().firstTime;
            let childFreq = childSnapshot.val().frequency;

            let newRow = $("<tr>").append(
                // Train Name
                $("<td>").text(childSnapshot.val().name),
                // Destination
                $("<td>").text(childSnapshot.val().destination),
                // Frequency
                $("<td>").text(childSnapshot.val().frequency),
                // Next Arrival
                $("<td>").text(getNextArrival(childFirstTime, childFreq)),
                // Minutes Away
                $("<td>").text(getMinutesAway(childFirstTime, childFreq))
                );

            trainTable.append(newRow);
        });
    }
});

$(document).ready(function(){
    database.ref().on("child_added", function(childSnapshot){

        let childFirstTime = childSnapshot.val().firstTime;
        let childFreq = childSnapshot.val().frequency;

        let newRow = $("<tr>").append(
            // Train Name
            $("<td>").text(childSnapshot.val().name),
            // Destination
            $("<td>").text(childSnapshot.val().destination),
            // Frequency
            $("<td>").text(childSnapshot.val().frequency),
            // Next Arrival
            $("<td>").text(getNextArrival(childFirstTime, childFreq)),
            // Minutes Away
            $("<td>").text(getMinutesAway(childFirstTime, childFreq))
            );

        trainTable.append(newRow);
    });
});