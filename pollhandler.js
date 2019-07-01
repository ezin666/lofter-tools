const TWO_DIGIT_NUM = 10;
var holderElement = document.createElement('div');

function pollCount() {
  var l = commentList.length;
  var polloptioncount = document.getElementById("polloptions").children.length;
  var pollresults = initializePollResults(polloptioncount);
  var keywordLists = getKeywordLists();

  if (hasDuplicateKeywords(keywordLists)) {
    showError("投票选项含有重复关键词，请重新检查。");
    return;
  }

  var keywordInclusionList = getKeywordInclusionList(keywordLists);
  var numberInclusionList = getNumberInclusionList(keywordLists);

  for (var i = 0; i < l; ++i) {
    const commenterId = commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue;
    if (isMultiSelect() || !hasCommenterVoted(pollresults, commenterId))
    {
      processComment(pollresults, keywordLists, numberInclusionList, keywordInclusionList, commentList[i]);
    }
  }

  showPollResult(pollresults);
}

function processComment(pollresults, keywordLists, numberInclusionList, keywordInclusionList, comment) {
  const commentContent = fromHTMLEntity(comment.getElementsByTagName("content")[0].childNodes[0].nodeValue);
  const commenterId = comment.getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue;
  
  var multiSelect = isMultiSelect();

  var matchResults = pollresults.map(function(val, idx) {
    return {
      numMatchList: commentContent.allOccurrence((idx+1)),
      keyMatchList: getKeywordMatchList(commentContent, keywordLists[idx])
    };
  });

  var validKeyMatchIdx;

  matchResults.forEach(function(matchRes, resIdx, matchResultsArr) {
    if (!pollresults[resIdx].commenters.includes(commenterId)) {
      validateNumberIndices(resIdx, matchResultsArr, keywordLists, numberInclusionList);
      if (multiSelect && matchRes.numMatchList.length > 0) {
        pollresults[resIdx].votes++;
        pollresults[resIdx].comments.push(markKeyInString(commentContent, [matchResultsArr.numMatchList[0], digitCount(resIdx+1)]));
        pollresults[resIdx].commenters.push(commenterId);
      }
      else {
        validateKeywordIndices(resIdx, matchResultsArr, keywordLists, keywordInclusionList);
        
        if (multiSelect && (validKeyMatchIdx = matchResultsArr.keyMatchList.findIndex(function(matchList) {return matchList.length > 0;})) >= 0) {
          pollresults[resIdx].votes++;
          pollresults[resIdx].comments.push(markKeyInString(commentContent, [matchResultsArr.keyMatchList[validKeyMatchIdx][0], keywordLists[resIdx][validKeyMatchIdx].length]));
          pollresults[resIdx].commenters.push(commenterId);
        }
      }
    }
  });

  if (!multiSelect) {
    var maxResultIdx = getMaxResultIdx(matchResults);
    if (maxResultIdx[0] >= 0) {
      if (maxResultIdx.length > 1) {
        pollresults[maxResultIdx[0]].comments.push(markKeyInString(commentContent, [matchResults[maxResultIdx[0]].keyMatchList[maxResultIdx[1]].last(), keywordLists[maxResultIdx[0]][maxResultIdx[1]].length]));
      }
      else {
        pollresults[maxResultIdx[0]].comments.push(markKeyInString(commentContent, [matchResults[maxResultIdx[0]].numMatchList.last(), digitCount(maxResultIdx[0]+1)]));
      }
      pollresults[maxResultIdx[0]].votes++;
      pollresults[maxResultIdx[0]].commenters.push(commenterId);
    }
  }
}

function validateNumberIndices(resIdx, matchResults, keywordLists, numberInclusionList) {
  if (matchResults[resIdx].numMatchList.length <= 0) {
    return;
  }

  const number = resIdx + 1, pollOptionCount = matchResults.length;
  var cmpNumIdx, numOffsets, numMatchList = matchResults[resIdx].numMatchList;

  // if we have a matching number, check all numbers that's at least 1 digit larger than it
  if (digitCount(pollOptionCount) > digitCount(number)) {
    for (cmpNumIdx = TWO_DIGIT_NUM * digitCount(number) - 1; cmpNumIdx < pollOptionCount && numMatchList.length > 0; ++cmpNumIdx) {
      // check if a larger number that contains current number also occurs in the comment
      if (matchResults[cmpNumIdx].numMatchList.length > 0 && (cmpNumIdx+1).toString().includes(number)) {
        numOffsets = (cmpNumIdx+1).toString().allOccurrence(number);
        
        // remove all number occurrence that's in inclusion list
        numMatchList = numMatchList.filter(function(numMatchIdx) {
           return matchResults[cmpNumIdx].numMatchList.every(function(cmpNumMatchIdx) {
            return !numOffsets.includes(numMatchIdx - cmpNumMatchIdx);
          });
        });
      }
    }
  }

  // check for keyword inclusion
  var keywordMatchIdxList;

  // check if number is included in any keyword->
  if (numMatchList.length > 0) {
    numberInclusionList[resIdx].forEach(function(keyMatchIdxPair) {
      keywordMatchIdxList = matchResults[keyMatchIdxPair[0]].keyMatchList[keyMatchIdxPair[1]];
      numOffsets = keywordLists[keyMatchIdxPair[0]][keyMatchIdxPair[1]].allOccurrence(number);

      numMatchList = numMatchList.filter(function(numMatchIdx) {
        return (keywordMatchIdxList.length <= 0 || keywordMatchIdxList.every(function(keyMatchIdx) {
          return !numOffsets.includes(numMatchIdx - keyMatchIdx);
        }));
      });
    });
  }

  matchResults[resIdx].numMatchList = numMatchList;
}

function validateKeywordIndices(resIdx, matchResults, keywordLists, keywordInclusionList) {
  var keyOffsets, keywordMatchIdxList;
  var test = false;

  matchResults[resIdx].keyMatchList.forEach(function(matchIdxList, keywordIdx, arr) {
   
    keywordInclusionList[resIdx][keywordIdx].forEach(function(keyMatchIdxPair) {
      keywordMatchIdxList = matchResults[keyMatchIdxPair[0]].keyMatchList[keyMatchIdxPair[1]];
      keyOffsets = keywordLists[keyMatchIdxPair[0]][keyMatchIdxPair[1]].allOccurrence(keywordLists[resIdx][keywordIdx]);
      
      arr[keywordIdx] = matchIdxList.filter(function(matchIdx) {
        return (keywordMatchIdxList.length <= 0 || keywordMatchIdxList.every(function(keyMatchIdx) {
          return !keyOffsets.includes(matchIdx - keyMatchIdx);
        }));
      });
    });
  });
}

function isDigitInKeyword(index, results, keywordLists) {
  return keywordLists.some(function(value, idx) {
    return value.some(function(v, i) {
      return (results[idx].keyList[i] >= 0 && v.includes(index+1) && results[index].idx - results[idx].keyList[i] == v.indexOf(index+1));
    });
  });
}

function getKeywordMatchList(comment, keywordList) {
  return keywordList.map(function(value) {
    return comment.toLowerCase().allOccurrence(value);
  });
}

function getKeywordLists() {
  var keywordElements, output, i, l;

  keywordElements = document.getElementsByName("keyword");
  l = keywordElements.length;
  output = [];

  for (i = 0; i < l; ++i) {
    v = keywordElements[i].value.trim();
    output.push(v.length <= 0 ? [] : v.toLowerCase().split('；').filter(function(value) { return value.length > 0; }));
  }

  return output;
}

function initializePollResults(count) {
  var pollresults = [];
  for (var i = 0; i < count; ++i) {
    pollresults.push({
      index: i,
      votes: 0,
      comments: [],
      commenters: []
    });
  }
  return pollresults;
}

function hasDuplicateKeywords(keywordLists) {
  var mergedKeywordLists = [];

  keywordLists.forEach(function(value) {
    mergedKeywordLists.concat(value);
  });

  return mergedKeywordLists.some(function(value, index, array) {
    return array.some(function(val, idx, arr) {
      return (value.length > 0 && val.length > 0 && index != idx && value == val); 
    });
  });
}

function getMaxResultIdx(matchResults) {
  var maxIdx = -1, maxResIdx = -1, temp;
  var topIdx = -1, subIdx = -1, maxKeyIdx = -1;

  matchResults.forEach(function(matchResult, resIdx) {

    if (matchResult.numMatchList.length > 0) {
      temp = matchResult.numMatchList.last();
      if (temp > maxIdx) {
        maxIdx = temp;
        maxResIdx = resIdx;
      }
    }

    matchResult.keyMatchList.forEach(function(k, i) {
      if (k.length > 0) {
        temp = k.last();
        if (temp > maxKeyIdx) {
          maxKeyIdx = temp;
          topIdx = resIdx;
          subIdx = i;
        }
      }
    });
  });

  if (maxIdx < 0 && maxKeyIdx < 0) {
    return [-1];
  }
  else if (maxIdx > maxKeyIdx) {
    return [maxResIdx];
  }
  else {
    return [topIdx, subIdx];
  }
}

function hasCommenterVoted(pollresults, commenterId) {
  return pollresults.some(function(pollresult) {
    return pollresult.commenters.includes(commenterId);
  });
}

function getKeywordInclusionList(keywordLists) {
  var inclusionList = [];
  keywordLists.forEach(function(keyList, keyListIdx) {
    inclusionList.push([]);

    keyList.forEach(function(key, keyIdx) {
      inclusionList[keyListIdx].push([]);

      keywordLists.forEach(function(cmpKeyList, cmpKeyListIdx) {
        if (cmpKeyListIdx != keyListIdx) {
          cmpKeyList.forEach(function(cmpKey, cmpKeyIdx) {
            if (cmpKey.includes(key)) {
              inclusionList[keyListIdx][keyIdx].push([cmpKeyListIdx, cmpKeyIdx]);
            }
          });
        }
      });
    });
  });
  return inclusionList;
}

function getNumberInclusionList(keywordLists) {
  var inclusionList = [];
  var i, keylistLength = keywordLists.length;

  for (i = 0; i < keylistLength; ++i) {
    inclusionList.push([]);

    keywordLists.forEach(function(keyList, keyListIdx) {
      if (i != keyListIdx) {
        keyList.forEach(function(key, keyIdx) {
          if (key.includes(i+1)) {
            inclusionList[i].push([keyListIdx, keyIdx]);
          }
        });
      }
    });
  }
  return inclusionList;
}