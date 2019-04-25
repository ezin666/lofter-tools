var xmlFile = null;
var xmlDoc = null;

var commenterList = null;
var commentList = null;
var drawedCommenterIndices = [];

function process(callback) {
  const lofterFile = document.getElementById("file").files[0];

  if (hasReadFile(lofterFile))
  {
    if (processXml()) {
      callback();
    }
    return;
  }

  xmlFile = lofterFile;
  const fileReader = new FileReader();
  fileReader.onload = function(ev) {
    xmlDoc = (new DOMParser()).parseFromString(ev.target.result, xmlFile.type);

    if (isXmlValid() && processXml()) {
      callback();
    }
  };

  fileReader.readAsText(xmlFile);
}

function getPostItemIndex() {
  const postAddr = extractPostPermaLink(document.getElementById("url").value);
  const permalinkList = xmlDoc.getElementsByTagName("permalink");
  const l = permalinkList.length;
  for (var i = 0; i < l; ++i) {       
    var permalink = permalinkList[i].childNodes[0].nodeValue;
    if (permalink == postAddr)
    {
      return i;
    }
  }
  return -1;
}

function processXml() {
  const postItemIndex = getPostItemIndex();

  if (postItemIndex < 0)
  {
    showError("找不到指定文章。");
    return false;
  }
  
  commentList = xmlDoc.getElementsByTagName("PostItem")[postItemIndex].getElementsByTagName("commentList");
  if (commentList == null || commentList.length <= 0)
  {
    showError("指定文章没有评论。");
    return false;
  }

  commentList = commentList[0].getElementsByTagName("comment");
  commenterList = [];

  var l = commentList.length;
  for (var i = 0; i < l; ++i) {
    var commenterId = commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue;
    if (!commenterList.includes(commenterId))
    {
      commenterList.push(commenterId);
    }
  }
  
  return true;
}

function draw()
{
  showError("");

  if (commenterList != null) {
    if (commenterList.length > 0 && drawedCommenterIndices.length < commenterList.length) {
      drawFromComment();
    }
    else {
      showError("无更多可抽取评论用户。");
    }
  }
  else {
    process(drawFromComment);
  }
}

function drawFromComment()
{
  var drawIndex;
  do {
    drawIndex = Math.floor(Math.random() * commenterList.length);
  } while (drawedCommenterIndices.includes(drawIndex));

  showDrawNum(drawIndex);

  var commenter = commenterList[drawIndex];
  var l = commentList.length;
  for (var i = 0; i < l; ++i) {
    if (commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue == commenter)
    {
      showDrawPerson(commentList[i].getElementsByTagName("publisherNick")[0].childNodes[0].nodeValue,
        commentList[i].getElementsByTagName("content")[0].childNodes[0].nodeValue
        );
    }
  }

  drawedCommenterIndices.push(drawIndex);
}

function isXmlValid() {
  return xmlDoc.getElementsByTagName("lofterBlogExport") != null;
}

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

function hasReadFile(file) {
  return (xmlFile != null && xmlDoc != null && xmlFile == file);
}

function resetFileCache() {
  xmlFile = null;
  xmlDoc = null;
  commenterList = null;
  commentList = null;
  drawedCommenterIndices = [];
  document.getElementById("drawresult").innerHTML = "";
  showError("");
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
  var l = tabcontents.length;
  for (i = 0; i < l; ++i) {
    if (tabcontents[i].style.display != "none") {
      tabcontents[i].querySelector(".error").innerHTML = str.length == 0 ? "" : "<p>" + str + "</p>";
      break;
    }
  }
}
