'use strict';

// Selects a random letter from the alphabet
function selectLetters(letterDict, newLetter)
{
    var keys = Object.keys(letterDict)
    newLetter.push(keys[Math.round(Math.random() * (keys.length))]);
    return newLetter;
}

// Creates a hand from a random number of letters
function getHand(n, letterDict)
{
    var newLetter = [];
    
    for(var i = 0; i < n; i++)
    {
        var currentHand = selectLetters(letterDict, newLetter);
    }
    
    return currentHand;
}

function getLetters()
{
    // Read in JSON file and store the letter values in a dictionary
    let rawdata = fs.readFileSync('letter-values.json');
    let letterValues = JSON.parse(rawdata);    

    var dict = new Object();

    for(var i in letterValues)
    {
        dict[i] = letterValues[i];
    }

    return dict;
}

function getWords(nLetters)
{
    // Read in the list of words and store in an array
    let newFile = fs.readFileSync('words.json');
    let allowedWords = JSON.parse(newFile); 

    // Get all of the current word possibilities based on the number of letters in the current hand
    var currentList = [];

    for(var i in allowedWords)
    {
        if(allowedWords[i].length <= nLetters)
        {
            currentList.push(allowedWords[i])
        }
    }

    return currentList;
}

function getLetterCombinations(currentLetters, letterCount)
{
    var searchLetters = currentLetters.toString().replace(/,/g, "");
    var temp = 0;  
    var combinations = [];  

    for(var i = 0; i < searchLetters.length; i++) 
    {  
        // Adds each subset of the word to the combinations array
        for(var j = i; j < searchLetters.length; j++) 
        {  
            if(searchLetters.substring(i, j + 1).length > 1)
            {        
                combinations[temp] = searchLetters.substring(i, j + 1);  
                temp++;
            }  
        }  
    }  

    combinations.sort(function(a, b){return a.length - b.length}); 

    var matchingIndexes = []

    for(var i in combinations)
    {
        // Add whitespaces to the string and then replace these with (?=.*) to specify that all of the letters must be included
        var start = "(?=.*";
        var end = ")";
        searchLetters = combinations[i].split('').join(' ').replace(/\s/g, ")(?=.*");
        searchLetters = start.concat(searchLetters).concat(end) 
        
        // Expression to specify that all of the letters must be present in the search result
        var regex = new RegExp(searchLetters, 'gi');

        for(var j in currentList) 
        {
            var match = currentList[j].search(regex);

            if(match != -1 && currentList[j].length == combinations[i].length)
            {
                // Check the word at currentList[j] to ensure that no words containing incorrect letters are being added
                var keys = Object.keys(letterCount);
                var searchParams = keys.toString().replace(/,/g, "");
                var RE = new RegExp('[^' + searchParams + ']' , 'gi');

                var matches = currentList[j].search(RE);

                if(matches == -1)
                {
                    // Check that the word still contains the correct amount of each letter
                    var newLetterCount = new Object();
                    var tempCurrentLetters = currentList[j].replace(/''/g, "[]").toLowerCase();
                    
                    for(var i in tempCurrentLetters)
                    {
                        if(!(tempCurrentLetters[i] in newLetterCount))
                        {        
                            newLetterCount[tempCurrentLetters[i]] = 1;
                        }
                        else
                        {
                            newLetterCount[tempCurrentLetters[i]] += 1;
                        }
                    }

                    var doubleLetter = false;

                    for(var key in letterCount)
                    {
                        console.log(key, letterCount[key], newLetterCount[key]) 
                        if(!(newLetterCount[key] == undefined))
                        {
                            if(newLetterCount[key] > letterCount[key])
                            {
                                doubleLetter = true;
                            }
                        }

                    }
                    // If the correct number of occurances were found, add the index to the array.
                    if(doubleLetter == false)
                    {
                        matchingIndexes.push(j);
                    }
                }
            }
        }
    }
    return matchingIndexes;
}

function isEmpty(obj) 
{
    for(var key in obj) 
    {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function createScoresDict(matchingIndexes)
{
    var scores = new Object();

    for(var i in matchingIndexes)
    {
        scores[currentList[matchingIndexes[i]]] = 0;   
    }

    return scores;
}

function getHighestScoringWord(scores, dict)
{
    var keys = Object.keys(scores);
    var array = []

    // Read in each of the letters into an array
    for(var i in keys)
    {
        var temp = [];

        for(var lett in keys[i])
        {
            temp.push(keys[i][lett]);
        }

        array.push(temp);
    }


    for(var i in array)
    {
        var wordValue = 0
        
        for(var j = 0; j < array[i].length; j++)
        {
            var letterValue = dict[array[i][j].toLowerCase()];
            wordValue += letterValue;
        }
        
        var key = array[i].toString().replace(/,/g, '');

        if(key.length == nLetters)
        {
            scores[key] = wordValue * nLetters + 50;
        }
        else
        {
            scores[key] = wordValue * nLetters;
        }
    }

    if(isEmpty(scores) == false)
    {
        var highestScoringWord = Object.keys(scores).reduce(function(a, b){return scores[a] > scores[b]? a : b});
        return highestScoringWord;
        
    }
    else
    {
        return null;
    }

}


/*---------------------------MAIN--------------------------------*/

const fs = require('fs');

var nLetters = Math.round(Math.random() * 6 + 2); 
var dict = getLetters();
var currentList = getWords(nLetters);
var currentLetters = getHand(nLetters, dict);

// Check that the current hand does not contain any undefined letters
while(currentLetters.includes(undefined))
{
    currentLetters = getHand(nLetters, dict);
    currentLetters.includes(undefined);
}

/*--------TESTING-----------*/
//currentLetters = ["q", "u", "h", "a", "p", "e", "u"];
/*--------------------------*/

var letterCount = new Object();

for(var i in currentLetters)
{
    if(!(currentLetters[i] in letterCount))
    {        
        letterCount[currentLetters[i]] = 1;
    }
    else
    {
        letterCount[currentLetters[i]] += 1;
    }
}

console.log("letter count", letterCount);

var matchingIndexes = getLetterCombinations(currentLetters, letterCount);
var scores = createScoresDict(matchingIndexes);
var highestScoringWord = getHighestScoringWord(scores, dict);

if(highestScoringWord == null)
{
    console.log("There are no valid words for the hand", currentLetters.toString().replace(/,/g, ''))
}
else
{
    console.log("For the hand:", currentLetters.toString().replace(/,/g, ''), ", you should play the word", highestScoringWord, "for", scores[highestScoringWord], "points.");
}