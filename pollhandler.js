const TWO_DIGIT_NUM = 10;
var holderElement = document.createElement('div');

function pollCount() {
  var l = commentList.length;
  var polloptioncount = document.getElementById("polloptions").children.length;
  var pollresults = initializePollResults(polloptioncount);
  var keywordLists = getKeywordLists();

  if (hasDuplicatedKeywords(keywordLists)) {
    showError("投票选项含有重复关键词，请重新检查。");
    return;
  }

  for (var i = 0; i < l; ++i) {
    processComment(pollresults, keywordLists, commentList[i]);
  }

  showPollResult(pollresults);
}

function processComment(pollresults, keywordLists, comment) {
  const commentContent = fromHTMLEntity(comment.getElementsByTagName("content")[0].childNodes[0].nodeValue);
  
  var results = [];
  
  var multiSelect = isMultiSelect();

  pollresults.forEach(function(value, index, array) {
    results.push({
      idx: multiSelect ? commentContent.indexOf(index+1) : commentContent.lastIndexOf(index+1),
      keyList: getKeywordMatchList(commentContent, keywordLists[index], !multiSelect)
    });
  });
  
  if (multiSelect) {
    var resultIndexArray;

    results.forEach(function(value, index, array) {    
        do {
          resultIndexArray = isMultiSelectResultValid(index, array, keywordLists);
          if (resultIndexArray[0] >= 0) {
            pollresults[index].votes++;
            pollresults[index].commenters.push(markKeyInString(commentContent, resultIndexArray));
            break;
          }
          else {
            results[index].idx = commentContent.indexOf(index+1, value.idx + 1);
          }
        } while (value.idx >= 0 && value.idx < commentContent.length);
    });
  }
  else {
    var maxIdx = GetMaxIdx(results);
    var maxKeywordIdx = GetMaxKeywordIdx(results, keywordLists);

    if (maxIdx >= 0 && (maxKeywordIdx[0] < 0 || results[maxIdx].idx > results[maxKeywordIdx[0]].keyList[maxKeywordIdx[1]]) && !isDigitInKeyword(maxIdx, results, keywordLists)) {
      
      pollresults[maxIdx].votes++;
      pollresults[maxIdx].commenters.push(markKeyInString(commentContent, [results[maxIdx].idx, digitCount(maxIdx + 1)]));
    }
    else if (maxKeywordIdx[0] >= 0) {
      pollresults[maxKeywordIdx[0]].votes++;
      pollresults[maxKeywordIdx[0]].commenters.push(markKeyInString(commentContent, [results[maxKeywordIdx[0]].keyList[maxKeywordIdx[1]], keywordLists[maxKeywordIdx[0]][maxKeywordIdx[1]].length]));
    }
  }
}

function isMultiSelectResultValid(index, results, keywordLists) {
  var i, l, keyListL, topIdx, subIdx, currentKeyIdx, compareKeyIdx;
  const optionNum = results.length;

   // if we have a matching number, check for multi-digit numbers
  if (results[index].idx >= 0) {
    if (digitCount(optionNum) > digitCount(index+1)) {
      for (i = TWO_DIGIT_NUM * digitCount(index+1) - 1; i < optionNum; ++i) {
        if (results[i].idx >= 0 && (i+1).toString().includes(index+1) &&
        results[index].idx - results[i].idx == (i+1).toString().indexOf(index+1)) {
          break;
        }
      }
      if (i >= optionNum && !isDigitInKeyword(index, results, keywordLists)) {
        return [results[index].idx, digitCount(index+1)];
      }
    }
    else if (!isDigitInKeyword(index, results, keywordLists)) {
      return [results[index].idx, digitCount(index+1)];
    }
  }
  
  keyListL = results[index].keyList.length;
  for (i = 0; i < keyListL; ++i) {
    currentKeyIdx = results[index].keyList[i];
    if (currentKeyIdx >= 0) {
      TopLoop:
      for (topIdx = 0; topIdx < optionNum; ++topIdx) {
        l = results[topIdx].keyList.length;

        for (subIdx = 0; subIdx < l; ++subIdx) {
          compareKeyIdx = results[topIdx].keyList[subIdx];
          if (compareKeyIdx >= 0 && (index != topIdx || i != subIdx) && keywordLists[topIdx][subIdx].includes(keywordLists[index][i] && currentKeyIdx - compareKeyIdx == keywordLists[topIdx][subIdx].indexOf(keywordLists[index][i]))) {
            break TopLoop;
          }
        }
      }

      if (topIdx >= optionNum) {
        return [currentKeyIdx, keywordLists[index][i].length];
      }
    }
  }

  return [-1, -1];
}

function isDigitInKeyword(index, results, keywordLists) {
  return keywordLists.some(function(value, idx, array) {
    return value.some(function(v, i, a) {
      return (results[idx].keyList[i] >= 0 && v.includes(index+1) && results[index].idx - results[idx].keyList[i] == v.indexOf(index+1));
    });
  });
}

function getKeywordMatchList(comment, keywordList, searchLast = false) {
  return keywordList.map(function(value) {
    if (value.length > 0) {
      return searchLast ? comment.toLowerCase().lastIndexOf(value) : comment.toLowerCase().indexOf(value);
    }
    else {
      return -1;
    }
  });
}

function getKeywordLists() {
  var keywordElements, output, i, l;

  keywordElements = document.getElementsByName("keyword");
  l = keywordElements.length;
  output = [];

  for (i = 0; i < l; ++i) {
    v = keywordElements[i].value.trim();
    output.push(v.length <= 0 ? [] : v.toLowerCase().split('；'));
  }

  return output;
}

function initializePollResults(count) {
  var pollresults = [];
  for (var i = 0; i < count; ++i) {
    pollresults.push({
      index: i,
      votes: 0,
      commenters: []
    });
  }
  return pollresults;
}

function showPollResult(result) {
  result.sort(function(l, r) {
    return r.votes - l.votes;
  });

  var output = "<table> \
    <caption>投票统计结果</caption> \
    <tr>\
      <th>选项</th>\
      <th>票数</th>\
      <th>投票者</th>\
    </tr>";

  result.forEach(function(value) {
    output += "<tr>\
        <td>" + (value.index + 1) + "</td>\
        <td>" + value.votes + "</td> \
        <td>" + value.commenters.join("<br/>") + "</td>\
      </tr>"
  });

  document.getElementById("pollresult").innerHTML = output;
}

function addPollOption() {
  var polloption = document.createElement('fieldset');
  polloption.className = "polloption";
  
  var optionInput = document.createElement('input');
  optionInput.type = "text";
  optionInput.placeholder = "关键词 (选填)";
  optionInput.name = "keyword";

  polloption.innerHTML = "<div class='optionremove' onclick='removeOption(this)'>x</div>" + 
    "<label>" + (document.getElementById("polloptions").children.length + 1) + "</label>";
  polloption.appendChild(optionInput);
  document.getElementById("polloptions").appendChild(polloption);

  enableDisablePollButton(false);
}

function removeOption(el) {
  var polloptions = document.getElementById("polloptions");
  polloptions.removeChild(el.parentElement);

  renumberPollOptions();
}

function renumberPollOptions() {
  var polloptions = document.getElementById("polloptions").children;
  var l = polloptions.length;
  var optionlabel;
  for (var i = 0; i < l; ++i) {
    optionlabel = polloptions[i].getElementsByTagName("label")[0];
    optionlabel.innerHTML = (i + 1);
  }

  enableDisablePollButton(l <= 0);
}

function enableDisablePollButton(b) {
  document.getElementById("pollbutton").disabled = b;
}

function isMultiSelect() {
  return document.getElementById("multiselect").checked;
}

function hasDuplicatedKeywords(keywordLists) {
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

function GetMaxIdx(array) {
  var maxIdx = -1;
  array.forEach(function(value, index, arr) {
    if (value.idx >= 0 && (maxIdx < 0 || value.idx > arr[maxIdx].idx || ((index+1).toString().includes(maxIdx+1) && arr[maxIdx].idx - arr[index].idx == (index+1).toString().lastIndexOf(maxIdx+1)))) {
      maxIdx = index;
    }
  });

  return maxIdx;
}

function GetMaxKeywordIdx(array, keywordLists) {
  var topIdx = -1, subIdx = -1;
  array.forEach(function(value, index, arr) {
    value.keyList.forEach(function(v, i, ar) {
      if (v >= 0 && (topIdx < 0 || (v > arr[topIdx].keyList[subIdx] && (v - arr[topIdx].keyList[subIdx] != keywordLists[topIdx][subIdx].lastIndexOf(keywordLists[index][i])) || (v <= arr[topIdx].keyList[subIdx] && arr[topIdx].keyList[subIdx] - v == keywordLists[index][i].lastIndexOf(keywordLists[topIdx][subIdx]))))) {
        topIdx = index;
        subIdx = i;
      }
    });
  });

  return [topIdx, subIdx];
}
