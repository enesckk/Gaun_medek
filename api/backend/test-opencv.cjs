const cv = require("opencv.js");

console.log("OpenCV yüklendi!");
console.log("OpenCV sürümü:", cv.getBuildInformation ? "OK" : "No version info");

// Basit bir matris oluşturalım
let mat = new cv.Mat(100, 100, cv.CV_8UC3);
console.log("Mat oluşturuldu:", mat.rows, "x", mat.cols);
