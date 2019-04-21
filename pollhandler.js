function pollCount() {
  console.log("test");
}

function addPollOption() {
  var polloption = document.createElement('fieldset');
  polloption.className = "polloption";
  
  var optionInput = document.createElement('input');
  optionInput.type = "text";
  optionInput.placeholder = "关键词 (选填)";
  polloption.innerHTML = "<div class='optionremove' onclick='removeOption(this)'>x</div>" + 
    "<label>" + (document.getElementById("polloptions").childNodes.length + 1) + "</label>";
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