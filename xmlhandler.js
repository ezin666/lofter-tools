var xmlFile = null;
var xmlDoc = null;
var commenterList = null;
var commentList = null;

function process(callback) {
  showError("");

  try {
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
  } catch (err) {
    showError(err);
  }
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

  try {
    if (commenterList != null) {
      if (commenterList.length > 0 && document.getElementsByName("drawindex").length < commenterList.length) {
        drawFromComment();
      }
      else {
        showError("无更多可抽取评论用户。");
      }
    }
    else {
      process(drawFromComment);
    }
  } catch (err) {
    showError(err);
  }
}

function drawFromComment()
{
  var drawIndex, i, l, drawedCommenterIndices = [];
  var drawedIndicesElements = document.getElementsByName("drawindex");
  l = drawedIndicesElements.length;
  for (i = 0; i < l; ++i) {
    drawedCommenterIndices.push(parseInt(drawedIndicesElements[i].innerHTML));
  }

  do {
    drawIndex = Math.floor(Math.random() * commenterList.length);
  } while (drawedCommenterIndices.includes(drawIndex));

  if (l <= 0) {
    showDrawBasicStats();
  }

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
}

function showDrawBasicStats() {
  document.getElementById("drawresult").innerHTML = "参与人数：" + commenterList.length;
}

function isXmlValid() {
  return xmlDoc.getElementsByTagName("lofterBlogExport") != null;
}

function hasReadFile(file) {
  return (xmlFile != null && xmlDoc != null && xmlFile == file);
}

function resetFileCache() {
  xmlFile = null;
  xmlDoc = null;
  commenterList = null;
  commentList = null;
  clearDraw();
}
