import React from 'react';
import letterValues from '../letter-values.json'; 
import allowedWords from '../words.json'; 

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
    // Read in the letters and their values, and the words
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

    getHand(n, letterDict)
    {
        var newLetter = [];
        
        for(var i = 0; i < n; i++)
        {
            var currentHand = this.selectLetters(letterDict, newLetter);
        }
        
        return currentHand;
    }

    // Shows how many times each letter appears in the current hand
    getLetterOccurances(currentLetters)
    {
        var letterCount = new Object();

        for(var i in currentLetters)
        {
            if(!(letterCount[currentLetters[i]] in letterCount))
            {        
                letterCount[currentLetters[i]] = 0;
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
                        matchingIndexes.push(j)

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


        for(var i in array)
        {
            var wordValue = 0
            
            for(var j = 0; j < array[i].length; j++)
            {
                //console.log("Array:", array[i][j]);
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
            //console.log(key, ":", wordValue);

        }

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


    render()
    {
        var nLetters = Math.round(Math.random() * 6 + 2); 
        var dict = this.getLetters();
        var currentList = this.getWords(nLetters);
        var currentLetters = this.getHand(nLetters, dict);

        // Check that the current hand does not contain any undefined letters
        while(currentLetters.includes(undefined))
        {
            currentLetters = this.getHand(nLetters, dict);
            currentLetters.includes(undefined);
        }

        var letterCount = this.getLetterOccurances(currentLetters);
        var matchingIndexes = this.getLetterCombinations(currentLetters, letterCount, currentList);
        var scores = this.createScoresDict(matchingIndexes, currentList);
        var highestScoringWord = this.getHighestScoringWord(scores, dict, nLetters);
        
        var validWords = []

        for(var i in matchingIndexes)
        {
            validWords.push(currentList[matchingIndexes[i]])
        }

        if(highestScoringWord == null)
        {
            return <h1>There are no valid words for the hand {currentLetters.toString().replace(/,/g, '')}</h1> 
        }
        else
        {
            //return <h1>For the hand: {currentLetters.toString().replace(/,/g, '')}, you should play the word {highestScoringWord} for {scores[highestScoringWord]} points.</h1>
            return (
            <div>
                <h1>For the hand: </h1>
                    {currentLetters.map(letter => <div style = {createStyle}><li style={boxes}>{letter}</li></div>)}
                <p>There are {matchingIndexes.length} possible words: </p>
                
                {validWords.map(word => <li>{word}</li>)}
                
                
                <p> The highest scoring word is <div style = {changeColour}>{highestScoringWord}</div>for {scores[highestScoringWord]} points.</p>
                
            </div>
            
            
            );
        }
        
        
        
    }
};

