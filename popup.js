const btn = document.getElementById("summarise");

const slider = document.getElementById("mySlider");
var selectedValue = "";
slider.addEventListener("input", function () {
  const value = parseInt(slider.value);
  switch (value) {
    case 0:
      selectedValue = "small";
      break;
    case 1:
      selectedValue = "medium";
      break;
    case 2:
      selectedValue = "large";
      break;
    default:
      selectedValue = "medium";
  }
});

btn.addEventListener("click", function () {
  var language = document.getElementById("languageSelect").value;

  btn.disabled = true;
  btn.innerHTML = "Summarising...";
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    var url = tabs[0].url;
    var xhr = new XMLHttpRequest();
    xhr.open(
      "GET",
      "http://127.0.0.1:5000/summary?url=" +
        url +
        "&lang=" +
        language +
        "&length=" +
        selectedValue,
      true
    );
    xhr.onload = function () {
      var text = xhr.responseText;
      const p = document.getElementById("output");
      p.innerHTML = text;
      btn.disabled = false;
      btn.innerHTML = "Summarise";
    };
    xhr.send();
  });
});