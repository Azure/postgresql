var fs = require('fs');
var path = require('path');

var specialChars = "[\^$|?*+()";
var arr = specialChars.split("");
console.log(arr);


var s = "*.ts";

arr.forEach((ch) => {
    if (s.indexOf(ch) > -1) {
        s = s.replace(ch, `\\\\${ch}`);
    }
});
console.log(`s: ${s}`);

var filepath = path.join("C:\\coderepos\\github-actions\\postgresql-action\\src", s);
var t = RegExp(s, "g");
console.log(filepath);
console.log(t);



var files = fs.readdirSync("C:\\coderepos\\github-actions\\postgresql-action\\src");
console.log(files);
files.forEach( (file)  => {
    // console.log(`testing : ${file}`);
    if (t.test(file)) {
        console.log(`file is : ${file}`);
    }
});
