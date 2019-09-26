
// ----------- Components -----------

// The following are the code part of the <letter-chip>
// and <submitted-word> components. They don't look like
// much, because they don't _do_ very much right now.
// However, if we wanted, these could have methods,
// computed properties, and data just like the top-level
// Vue that we've been using.

// The one thing these components have besides their
// template is the `props` object. Props are a way of
// passing in data to a custom component. Just like
// we can write <input type="text">, and the 'type="text"'
// bit changes the way the <input> looks and behaves,
// props allow us to customize our components.

Vue.component('letter-chip', {
    /*
    A letter-chip is one of the letters available to use in constructing words.
    It displays the letter in large text and the value in smaller, all wrapped
    in a tile-looking box.
    */
    template: '#letter-chip-template', // <-- This means: "use the element with selector '#letter-chip-template' as the template
    props: {
        letter: String,
        value: Number,
    },
});

Vue.component('submitted-word', {
    /*
    A submitted-word is a word typed in while playing the game.
    */
    template: '#submitted-word-template',
    props: {
        word: String, // The word that was typed
        score: Number, // The score (computed by adding the value of each letter)
        loading: Boolean, // True/False whether we are still waiting for a response
                          // from the Pearson API to say if this is a real word.
        isRealWord: Boolean, // Not set unless finished loading.
    },
});


// ----------- Game Logic -----------

// Some helper functions for computing scores of letters and words.

var GAME_DURATION = 60;

// borrowing Scrabble's point system
var scrabblePointsForEachLetter = {
    a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1, m: 3,
    n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
}


/**
 * Given a letter, returns the score of that letter (case-insensitive)
 */
function letterScore(letter) {
    return scrabblePointsForEachLetter[letter.toLowerCase()];
}

/**
 * Given a word, returns its total score,
 * which is computed by summing the scores of each of its letters.
 *
 * Returns a score of 0 if the word contains any disallowed letters.
 */
function wordScore(word) {
    // split the word into a list of letters
    var letters = word.split("");

    // TODO 15
    // Replace the empty list below.
    // Map the list of letters into a list of scores, one for each letter.
    var letterScores = [];

    // return the total sum of the letter scores
    return letterScores.reduce(add, 0);
}




// ----------------- UTILS -----------------

/**
 * Randomly selects n items from a list.
 * Returns the selected items together in a (smaller) list.
 *
 */
function chooseN(n, items) {
    var selectedItems = [];
    var total = Math.min(n, items.length);
    for (var i = 0; i < total; i++) {
        index = Math.floor(Math.random() * items.length);
        selectedItems.push(items[index]);
        items.splice(index, 1);
    }
    return selectedItems;
}

/**
 * Adds two numbers together
 */
function add(a, b) {
    return a + b;
}


// ----------------- Main Vue -----------------


var app = new Vue({
    el: '.mount-point',
    data: function() {
        // all the stuff we need to keep track of
        return {
            // how much time is left in the current game
            secondsRemaining: GAME_DURATION,

            allLetters: Object.keys(scrabblePointsForEachLetter),

            // a list of the 7 letters that the player is allowed to use
            allowedLetters: [],

            // the word that the user is currently typing
            currentAttempt: "",

            // a list of the words the user has previously submitted in the current game
            wordSubmissions: [],

            // a timeoutID that can be used to clear a previously set timer
            // (don't worry about this one, you won't have to mess with it)
            timer: null,
        };
    },
    computed: {
        currentScore: function () {
            /**
             * Returns the user's current total score, which is the sum of the
             * scores of all the wordSubmissions whose word is a real dictionary word
             */
            // TODO 16
            // add up all the wordScore values from the words in this.wordSubmissions
            // be sure not to include any that aren't real words.
            return 0;
        },
        gameInProgress: function() {
            return this.secondsRemaining > 0 && this.timer !== null;
        },
        disallowedLettersInWord: function() {
            /**
             * Given a word, returns a list of all the disallowed letters in that word
             * Note that the list might be empty, if it contains only allowed letters.
             */

            var letters = this.currentAttempt.split("");
            return letters.filter(l => this.isDisallowedLetter(l));
        },

        containsOnlyAllowedLetters: function() {
            /**
             * returns true if the currentAttempt is "clean",
             * i.e. the word does not contain any disallowed letters
             */
            return this.disallowedLettersInWord.length === 0;
        },

    },
    methods: {
        isDisallowedLetter: function(letter) {
            /**
             * Given a letter, checks whether that letter is "disallowed"
             * meaning it is not a member of the .allowedLetters list from the current data
             */
            if (this.allowedLetters.includes(letter)){
                return false;
            }
            return true;
        },

        // The next couple lines are odd.
        // It seems like they're not doing anything useful.
        // It says:
        // > remember that `letterScore` function we defined above?
        // > Well, we're going to add it to `methods` using the same name.
        // This turns out to be useful because it makes the function available
        // for use within our template in index.html.
        letterScore: letterScore,
        wordScore: wordScore,

        generateAllowedLetters: function() {
            /**
             * Returns a list of 7 randomly chosen letters
             * Each letter will be distinct (no repeats of the same letter)
             */
            return chooseN(7, Object.keys(scrabblePointsForEachLetter));
        },


        startGame: function() {
            // Resets the data to a starting state, and then starts the timer
            this.endGame(); // terminate any existing games before starting a new one.
            this.gameHasStarted = true;
            this.secondsRemaining = GAME_DURATION,
            this.allowedLetters = this.generateAllowedLetters();
            this.wordSubmissions = [];
            this.currentAttempt = '';
            this.timer = this.startTimer();
            console.log(this.allLetters[0])
        },
        endGame: function() {
            this.stopTimer();
        },
        addNewWordSubmission: function(word) {
            /**
             * Given a word, adds a new wordSubmission to this.wordSubmissions.
             *
             * Refrains from adding a new entry if the model already contains
             * a wordSubmission whose word is the same
             */

            // Do we already have a wordSubmission with this word?
            // TODO 17
            // replace the hardcoded 'false' with the real answer
            var alreadyUsed = false;
            if (this.containsOnlyAllowedLetters && !alreadyUsed) {
                // add the word, with it's score.
                // set loading to true, and isRealWord to null, to represent
                // that we're not sure yet if this is a real word.
                this.wordSubmissions.push({
                    word: word,
                    loading: true,
                });

                // Now, check against the api to see if the word is real.
                // when the api call comes back, we can update loading and isRealWord.
                this.checkIfWordIsReal(word);
            }
            this.currentAttempt = "";
        },
        checkIfWordIsReal: function(word) {
            /**
             * Given a word, checks to see if that word actually exists in the dictionary.
             *
             * Subsequently updates the .isRealWord property of
             * the corresponding wordSubmission in the data.
             */

            // TODO 12 what should the url be?
            fetch(`www.example.com`)
                .then(response => (response.ok ? response.json() : Promise.reject(response)))
                .then(resp => {
                    console.log("We received a response from Pearson!");

                    // let's print the response to the console so we can take a looksie
                    console.log(resp);

                    // TODO 13
                    // Replace the 'true' below.
                    // If the response contains any results, then the word is legitimate.
                    // Otherwise, it is not.
                    var isARealWord = true;

                    // TODO 14
                    // Update the data to say that the word is real.
                    // You'll have to find the correct entry in this.wordSubmissions,
                    // and change it's loading and isRealWord values
                })
                .catch(error => console.error(error));
        },


        // ----------------- THE TIMER -----------------
        // don't fret about these too hard. You can ignore these functions
        // unless you really want to learn about them.

        startTimer: function() {
            this.stopTimer(); // in case it was already running.
            this.secondsRemaining = GAME_DURATION;
            // in 1 second, call tick
            this.timer = setTimeout(() => this.tick(), 1000);
        },
        tick: function() {
            // one second has passed
            this.secondsRemaining -= 1;
            if (this.secondsRemaining > 0) {
                // in one second, call tick again
                this.timer = setTimeout(() => this.tick(), 1000);
            }
        },
        stopTimer: function() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        },
    },
});
