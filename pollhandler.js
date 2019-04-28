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

function processComment(pollresults, keywordsLists, comment) {
  const commentContent = fromHTMLEntity(comment.getElementsByTagName("content")[0].childNodes[0].nodeValue);
  const optionNum = pollresults.length;
  var results = [];
  var i, j;
  var indexNum, keywordsIndices;
  var multiSelect = isMultiSelect();

  pollresults.forEach(function(value, index, array) {
    results.push({
      idx: commentContent.indexOf(index+1),
      keyList: getKeywordMatchList(commentContent, keywordsLists[index])
    });
  });
  
  if (multiSelect) {
    results.forEach(function(value, index, array) {
      // if we have a matching number, check for multi-digit numbers
      if (value.idx >= 0) {
        if (digitCount(optionNum) > digitCount(index+1)) {
          for (i = TWO_DIGIT_NUM * digitCount(index+1) - 1; i < optionNum; ++i) {
            if (results[i].idx >= 0 && (i+1).toString().includes(index+1) &&
              value.idx - results[i].idx == (i+1).toString().indexOf(index+1)) {
              break;
            }
          }
          if (i >= optionNum) {
            pollresults[index].votes++;
            pollresults[index].commenters.push(commentContent);
          }
        }
        else {
          pollresults[index].votes++;
          pollresults[index].commenters.push(commentContent);
        }
      }
      else { // we dont have matching numbers then check for matching keywords

      }
    });
  }

}

function getKeywordMatchList(comment, keywordList) {
  return keywordList.map(function(value) {
    return comment.indexOf(value);
  });
}

function getKeywordLists() {
  var keywordElements, output, i, l;

  keywordElements = document.getElementsByName("keyword");
  l = keywordElements.length;
  output = [];

  for (i = 0; i < l; ++i) {
    v = keywordElements[i].value.trim();
    output.push(v.length <= 0 ? [] : v.split('；'));
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

function fromHTMLEntity(str) {
  holderElement.innerHTML = str;
  return holderElement.innerHTML;
}

function digitCount(x) {
  return Math.floor(Math.log10(x) + 1);
}

Math.log10 = Math.log10 || function(x) {
  return Math.log(x) * Math.LOG10E;
};
