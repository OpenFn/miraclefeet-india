const fs = require('fs');

var file = './tmp/sampleState.json'; // give the state fil here

fs.readFile(file, 'utf8', function (err, data) {
  if (err) {
    return console.log(err);
  }
  const json_data = JSON.parse(data);

  const Patient = json_data.Patient;
  const Visit = json_data.Visit;
  
  console.log(Patient.length, ' Patient records created.');
  console.log(Visit.length, ' Visit records created.');
});
