function initUI() {
   for (let elm of document.getElementsByClassName("numInput")) new NumberInput(elm)
   initZoom()
}
