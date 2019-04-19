var xmlFile = null;
var xmlDoc = null;

var commenterList = null;
var commentList = null;

function processDraw() {
  const lofterFile = document.getElementById("file").files[0];

  if (hasReadFile(lofterFile))
  {
    processXml();
    return;
  }

  xmlFile = lofterFile;
  const fileReader = new FileReader();
  fileReader.onload = function(ev) {
    var fileContent = ev.target.result;
    xmlDoc = (new DOMParser()).parseFromString(fileContent, xmlFile.type);

    if (isXmlValid()) {
      processXml();
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
    return;
  }
  
  commentList = xmlDoc.getElementsByTagName("PostItem")[postItemIndex].getElementsByTagName("commentList");
  if (commentList == null || commentList.length <= 0)
  {
    showDrawError("指定文章没有评论。");
    return;
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
  
  drawFromComment();
}

function draw()
{
 // document.getElementById("drawbutton").disabled = true;
  showDrawError("");

  if (commenterList != null) {
    if (commenterList.length > 0) {
      drawFromComment();
    }
    else {
      showDrawError("无更多可抽取评论用户。");
    }
  }
  else {
    processDraw();
  }

 // document.getElementById("drawbutton").disabled = false;
}

function drawFromComment()
{
  var drawIndex = Math.floor(Math.random() * commenterList.length);

  const drawResultElement = document.getElementById("drawresult");
  showDrawNum(drawResultElement, drawIndex);

  var commenter = commenterList[drawIndex];
  var l = commentList.length;
  for (var i = 0; i < l; ++i) {
    if (commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue == commenter)
    {
      showDrawPerson(drawResultElement, 
        commentList[i].getElementsByTagName("publisherNick")[0].childNodes[0].nodeValue,
        commentList[i].getElementsByTagName("content")[0].childNodes[0].nodeValue
        );
    }
  }

  commenterList.splice(drawIndex, 1);
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
  showDrawError("");
}

function showDrawNum(elm, num) {
  var numElement = document.createElement("div");
  numElement.innerHTML = "中奖序号：" + num;
  elm.appendChild(numElement);
}

function showDrawPerson(elm, nickname, content) {
  var commentElement = document.createElement("div");
  commentElement.innerHTML = nickname + ": " + content;
  elm.appendChild(commentElement);
}

function showDrawError(str) {
  document.getElementById("drawerror").innerHTML = str.length == 0 ? "" : "<p>" + str + "</p>";
}
