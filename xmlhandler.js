var xmlFile = null;
var xmlDoc = null;

var commenterList = null;
var commentList = null;
var drawedCommenterIndices = [];

function processDraw() {
  const lofterFile = document.getElementById("file").files[0];

  if (hasReadFile(lofterFile))
  {
    if (processXml()) {
      drawFromComment();
    }
    return;
  }

  xmlFile = lofterFile;
  const fileReader = new FileReader();
  fileReader.onload = function(ev) {
    var fileContent = ev.target.result;
    xmlDoc = (new DOMParser()).parseFromString(fileContent, xmlFile.type);

    if (isXmlValid() && processXml()) {
      drawFromComment();
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
    showDrawError("找不到指定文章。");
    return false;
  }
  
  commentList = xmlDoc.getElementsByTagName("PostItem")[postItemIndex].getElementsByTagName("commentList");
  if (commentList == null || commentList.length <= 0)
  {
    showDrawError("指定文章没有评论。");
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
  showDrawError("");

  if (commenterList != null) {
    if (commenterList.length > 0 && drawedCommenterIndices.length < commenterList.length) {
      drawFromComment();
    }
    else {
      showDrawError("无更多可抽取评论用户。");
    }
  }
  else {
    processDraw();
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
  showDrawError("");
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

function showDrawError(str) {
  document.getElementById("drawerror").innerHTML = str.length == 0 ? "" : "<p>" + str + "</p>";
}
