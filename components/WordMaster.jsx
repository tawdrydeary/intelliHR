import React from 'react';
import letterValues from '../letter-values.json'; 
import allowedWords from '../words.json'; 

// Styling to create "tiles" on the webpage
const boxes = {
    width:'100px',
    height:'100px',
    border: '1px solid black',
    display: 'inline-block',
  };

const createStyle = {
    padding: '10px',
    display: 'inline-block',
    'font-size' : '75px',
};

const changeColour = {
    color: 'red',
};
  
export default class WordMaster extends React.Component
{
    // Read in the available letters and their values and store these in a dictionary
    getLetters()
    {
        var dict = new Object();

        for(var i in letterValues)
        {
            dict[i] = letterValues[i];
        }

        return dict;
    }
    
    // Get all of the current word possibilities based on the number of letters in the current hand
    getWords(nLetters)
    {
        var currentList = [];

        for(var i in allowedWords)
        {
            // Select all the words from words.json which are either the same length or less than the 
            // random number of tiles selected
            if(allowedWords[i].length <= nLetters)
            {
                currentList.push(allowedWords[i])
            }
        }

        return currentList;
    }

    // Select random letters from the list of letters
    selectLetters(letterDict, newLetter)
    {
        var keys = Object.keys(letterDict)
        newLetter.push(keys[Math.round(Math.random() * (keys.length))]);

        return newLetter;
    }

    // Create a hand of n random letters 
    getHand(n, letterDict)
    {
        var newLetter = [];
        
        for(var i = 0; i < n; i++)
        {
            var currentHand = this.selectLetters(letterDict, newLetter);
        }
        
        return currentHand;
    }

    // Shows how many times each letter appears in the current hand to ensure the correct words are being 
    // selected
    getLetterOccurances(currentLetters)
    {
        var letterCount = new Object();

        // Initalise the dictionary keys with a value of 1 and increment this by 1 if the same key is seen again
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

        return letterCount;
    }

    // Create all possible unique combinations of the letters and search for words which contain them
    getLetterCombinations(currentLetters, letterCount, currentList)
    {
        // Convert the array of search letters to a string and remove the commas to ensure correct formatting
        var searchLetters = currentLetters.toString().replace(/,/g, "");
        var temp = 0;  
        var combinations = [];  

        // Recursively go through all of the possible combinations for the current letters
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

        // Sort all of the combinations found in order of word length for readability
        combinations.sort(function(a, b){return a.length - b.length}); 

        var matchingIndexes = []

        for(var i in combinations)
        {
            // Add whitespaces to the string and then replace these with (?=.*) to specify that all of the 
            // letters must be included in the regular expression
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
                        
                        // Create a temporary dictionary for the current letters which shows how many times
                        // each of these letters appear in the current combination
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
                        
                        // Check that the number of occurances of each letter in the temporary dictionary are
                        // the same as in the initial selected letters.
                        for(var key in letterCount)
                        {
                            
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

    // Check if any valid matches were found
    isEmpty(obj) 
    {
        for(var key in obj) 
        {
            if(obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }
    
    // Initialise an empty dictionary with all of the unique combinations as keys
    createScoresDict(matchingIndexes, currentList)
    {
        var scores = new Object();

        for(var i in matchingIndexes)
        {
            scores[currentList[matchingIndexes[i]]] = 0;   
        }

        return scores;
    }

    // Filter through the keys in the scores dictionary and total the score for each letter combination
    // Return the highest scoring word and it's point score. 
    getHighestScoringWord(scores, dict, nLetters)
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

        // Store the value of the current chosen letters and calculate the total score based on the 
        // provided specifications.
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
                scores[key] = wordValue * array[i].length;
            }

        }

        // Check that a valid word was found, else return null.
        if(this.isEmpty(scores) == false)
        {
            var highestScoringWord = Object.keys(scores).reduce(function(a, b){return scores[a] > scores[b]? a : b});            
            return highestScoringWord;
            
        }
        else
        {
            return null;
        }

    }

    // Get the total score for all of the valid combinations in the current hand
    getHandScore(scores)
    {
        var totalScore = 0;

        for(var i in scores)
        {
            totalScore += scores[i];
        }

        return totalScore;
    }

    render()
    {
        var nLetters = Math.round(Math.random() * 6 + 2); 
        var dict = this.getLetters();
        var currentList = this.getWords(nLetters);
        var currentLetters = this.getHand(nLetters, dict);

        // Check that the current hand does not contain any undefined letters.
        // Redraw the hand if it does.
        while(currentLetters.includes(undefined))
        {
            currentLetters = this.getHand(nLetters, dict);
            currentLetters.includes(undefined);
        }

        var letterCount = this.getLetterOccurances(currentLetters);
        var matchingIndexes = this.getLetterCombinations(currentLetters, letterCount, currentList);
        var scores = this.createScoresDict(matchingIndexes, currentList);
        var highestScoringWord = this.getHighestScoringWord(scores, dict, nLetters);
        
        var validWords = [];
        var totalScore = this.getHandScore(scores);
        
        var keys = Object.keys(scores);

        for(var key in keys)
        {
            validWords.push(keys[key])
        }

        if(highestScoringWord == null)
        {
            return (
                <div>
                    <h2>There are no matches for the current tiles. </h2>
                    {currentLetters.map(letter => <div style = {createStyle}><li style={boxes}>{letter}</li></div>)}

                </div>
                
            ); 
        }
        else
        {
            return (
                <div>
                    <h2>For the current tiles </h2>
                        {currentLetters.map(letter => <div style = {createStyle}><li style={boxes}>{letter}</li></div>)}
                    <h2>There are {validWords.length} possible words: </h2>
                    
                    {validWords.map(word => <li>{word}</li>)}
                    
                    
                    <h2> The highest scoring word is <div style = {changeColour}>{highestScoringWord}</div>for {scores[highestScoringWord]} points.</h2>
                    <h2> The total score for all valid words in the current hand is <div style = {changeColour}>{totalScore}</div>points.</h2>
                </div>
            );
        }        
    }
};

