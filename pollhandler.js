const TWO_DIGIT_NUM = 10;

function pollCount() {
  var l = commentList.length;
  var polloptioncount = document.getElementById("polloptions").children.length;
  var pollresults = initializePollResults(polloptioncount);

  for (var i = 0; i < l; ++i) {
    processComment(commentList[i].getElementsByTagName("content")[0].childNodes[0].nodeValue);
  }
}

function processComment(comment) {
  const optionNum = pollresults.length;
  var results = [];
  var i, j;
  var indexNum;
  for (i = 0; i < optionNum; ++i) {
    indexNum = comment.indexOf(i+1);
    results.push({
      idx: indexNum,
      keyList: indexNum < 0 ? getKeywordMatchList(comment, i) : []
    });
  }

  // see if we need to consider multi-digit numbers
  if (optionNum >= TWO_DIGIT_NUM) {
    for (i = TWO_DIGIT_NUM - 1; i < optionNum; ++i) {
      for (j = 0; j < TWO_DIGIT_NUM; ++j) {
        if (results[i].idx >= 0 && results[j].idx >= 0 && (i+1).toString().startsWith(j+1)) {

        }
      }
    }
  }
}

function getKeywordMatchList(comment, optionIndex) {
  var keywordinput, keywordList, indexList, i, l;
  
  keywordinput = document.getElementsByName("keyword")[optionIndex].value.trim();
  if (keywordinput.length <= 0) {
    return [];
  }
  
  keywordList = keywordInput.split('；');
  l = keywordList.length;
  indexList = [];
  for (i = 0; i < l; ++i) {
    indexList.push(comment.indexOf(keywordList[i]));
  }
  return indexList;
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