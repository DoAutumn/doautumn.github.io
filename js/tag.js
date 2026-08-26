function randomLightColor() {
  var color = '', i, range = '0123401234abcabc';
  for (i = 0; i < 6; i++) {
    color += range[Math.floor(Math.random() * range.length)];
  }
  return '#' + color;
}

function hexToRgba(color, alpha) {
  var newColor = color.toLocaleLowerCase(), newColor1 = '#', newColorArr = [], i;

  if (newColor.length === 4) {
    for (i = 1; i < 4; i += 1) {
      newColor1 += newColor.slice(i, i + 1).concat(newColor.slice(i, i + 1));
    }
    newColor = newColor1;
  }
  for (i = 1; i < 7; i += 2) {
    newColorArr.push(parseInt('0x' + newColor.slice(i, i + 2)));
  }
  return `rgba(${newColorArr.join(',')},${alpha})`;
}

// !function () {
//   console.log('tag.js');
//   var list = document.querySelectorAll('#sidebar .tagcloud a');
//   Array.from(list).forEach(function (item) {
//     var color = randomLightColor();
//     item.style.color = color;
//     item.style.borderColor = hexToRgba(color, 0.3);
//   });
// }();