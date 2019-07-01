/** For draw */
function extractPostPermaLink(url) {
  var permalink;

  if (!url.includes("/")) {
    permalink = url;
  }
  else if (url.startsWith("http") || url.startsWith("www")) {
    permalink = url.slice(url.lastIndexOf("/")+1, url.length);
  }

  return permalink;
}

function showDrawNum(num) {
  var numElement = document.createElement("div");
  numElement.innerHTML = "<hr>中奖序号：<span name='drawindex'>" + num + "</span>";
  document.getElementById("drawresult").appendChild(numElement);
}

function showDrawPerson(nickname, content) {
  var commentElement = document.createElement("div");
  commentElement.innerHTML = nickname + ": " + content;
  document.getElementById("drawresult").appendChild(commentElement);
}

function showError(str) {
  var tabcontents = document.getElementsByClassName("tabcontent");
  var i, l = tabcontents.length;
  for (i = 0; i < l; ++i) {
    if (tabcontents[i].style.display != "none") {
      tabcontents[i].querySelector(".error").innerHTML = str.length == 0 ? "" : "<p>" + str + "</p>";
      break;
    }
  }
}

function clearDraw() {
  document.getElementById("drawresult").innerHTML = "";
  showError("");
}

/* For poll */
const MIN_COMMENT_DISPLAY_LINE = 3;
const ALL_COMMENT_EXPAND_STR = "&#8681;展开全部";
const ALL_COMMENT_COLLAPSE_STR = "&#8679;收起全部";
const COMMENT_EXPAND_STR = "&#8675;展开";

function showPollResult(result) {
  result.sort(function(l, r) {
    return r.votes - l.votes;
  });

  var output = "<table> \
    <caption>投票统计结果</caption> \
    <tr>\
      <th>选项</th>\
      <th>票数</th>\
      <th>投票评论&nbsp;<span class='togglerhead' onclick='toggleAllComment(true)'>" + ALL_COMMENT_EXPAND_STR + "</span>&nbsp;<span class='togglerhead' onclick='toggleAllComment(false)'>" + ALL_COMMENT_COLLAPSE_STR + "</span</th>\
    </tr>";

  var commentListStr;

  result.forEach(function(value) {
    if (value.comments.length > MIN_COMMENT_DISPLAY_LINE) {
      commentListStr = value.comments.slice(0, MIN_COMMENT_DISPLAY_LINE).join("<br/>") +
                     "<br/><span class='toggler' onclick='toggleComment(this)'>" + COMMENT_EXPAND_STR + "</span><div class='togglecontent' style='display:none'>" +
                     value.comments.slice(MIN_COMMENT_DISPLAY_LINE).join("<br/>");
    }
    else {
      commentListStr = value.comments.join("<br/>");
    }
    
    output += "<tr>\
        <td>" + (value.index + 1) + "</td>\
        <td>" + value.votes + "</td> \
        <td>" + commentListStr + "</td>\
      </tr>"
  });

  output += "</table>";

  document.getElementById("pollresult").innerHTML = output;
}

function toggleAllComment(show) {
  var togglerElems = document.getElementsByClassName("toggler");
  var i, l = togglerElems.length;
  for (i = 0; i < l; ++i) {
    toggleComment(togglerElems[i], true, show);
  }
}

function toggleComment(elem, forceToggle = false, show = false) {
  if (!forceToggle) {
    show = !(elem.nextSibling.style.display === "block");
  }

  if (show) {
    elem.nextSibling.style.display = "block";
    elem.innerHTML = "";
  }
  else {
    elem.nextSibling.style.display = "none";
    elem.innerHTML = COMMENT_EXPAND_STR;
  }
  
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

function markKeyInString(str, keyArray) {
  return str.substring(0, keyArray[0]) + "<mark>" + str.substr(keyArray[0], keyArray[1]) + "</mark>" + str.substring(keyArray[0] + keyArray[1], str.length);
}

String.prototype.indicesOf = function(keyword) {
  var resultArray = [];
  var startIdx = 0;
  var l = this.length;
  do {
    startIdx = this.indexOf(keyword, startIdx);
    if (startIdx >= 0) {
      resultArray.push(startIdx);
      startIdx++;
    }
  } while (startIdx >= 0 && startIdx < l);
  return resultArray;
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

String.prototype.allOccurrence = function(str) {
  if (str.length <= 0) {
    return [];
  }

  var indices = [], searchIdx = 0, idx;
  while ((idx = this.indexOf(str, searchIdx)) > -1) {
    indices.push(idx);
    searchIdx = idx + 1;
  }
  
  return indices;
};

Array.prototype.last = function() {
  if (this.length <= 0) {
    return undefined;
  }
  
  return this[this.length - 1];
}