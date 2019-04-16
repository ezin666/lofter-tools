var xmlFile = null;
var xmlDoc = null;

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

function getPostItemIndex(permalinkList) {
  const postAddr = extractPostPermaLink(document.getElementById("url").value);
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
  var postItemIndex = getPostItemIndex(xmlDoc.getElementsByTagName("permalink"));

  if (postItemIndex > -1)
  {
    var commentList = xmlDoc.getElementsByTagName("PostItem")[postItemIndex].getElementsByTagName("commentList");
    if (commentList.length <= 0)
    {
      console.log("no comment");
    }
    else
    {
      commentList = commentList[0].getElementsByTagName("comment");

      var commenterList = [];
      var l = commentList.length;
      for (var i = 0; i < l; ++i) {
        var commenterId = commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue;
        if (!commenterList.includes(commenterId))
        {
          commenterList.push(commenterId);
        }
      }
      var drawNum = Math.floor(Math.random() * commenterList.length);

      const drawResultElement = document.getElementById("drawresult");
      showDrawNum(drawResultElement, drawNum);

      var commenter = commenterList[drawNum];
      for (var i = 0; i < l; ++i) {
        if (commentList[i].getElementsByTagName("publisherUserId")[0].childNodes[0].nodeValue == commenter)
        {
          showDrawPerson(drawResultElement, 
            commentList[i].getElementsByTagName("publisherNick")[0].childNodes[0].nodeValue,
            commentList[i].getElementsByTagName("content")[0].childNodes[0].nodeValue
            );
          console.log( + ": " + commentList[i].getElementsByTagName("content")[0].childNodes[0].nodeValue);
        }
      }
    }
  }
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