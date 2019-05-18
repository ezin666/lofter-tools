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
