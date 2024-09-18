function showSelectedColors() {
    var checkboxes = document.querySelectorAll("#colors input[type='checkbox']");
    var selectedColors = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            selectedColors.push(checkboxes[i].value);
        }
    }
    displaySelectedColors(selectedColors);
}

function displaySelectedColors(selectedColors) {
    var selectedColorsDiv = document.getElementById("selectedColors");
    selectedColorsDiv.innerHTML = "";
    for (var i = 0; i < selectedColors.length; i++) {
        var colorBox = document.createElement("div");
        colorBox.style.width = "30px";
        colorBox.style.height = "30px";
        colorBox.style.backgroundColor = selectedColors[i];
        colorBox.style.marginRight = "5px";
        colorBox.style.display = "inline-block";
        selectedColorsDiv.appendChild(colorBox);
    }
}
