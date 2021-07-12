alterState(state => {
  const { Patient, Visit } = state.data;

  function reduceArray(array, groupBy) {
    return array.reduce((r, a) => {
      r[a[groupBy]] = r[a[groupBy]] || [];
      r[a[groupBy]].push(a);

      return r;
    }, Object.create(null));
  }

  function checkLength(array, key) {
    return array[key] ? array[key].length : 0;
  }

  console.log('Total size Patient', Patient.length);
  console.log('Total size Visit', Visit.length);

  function uniqueArray(array, key) {
    return Array.from(new Set(array.map(a => a[key]))).map(id => {
      return array.find(c => id === c[key]);
    });
  }

  // setting unique arrays =================
  const uniquePatients = uniqueArray(Patient, 'CommCare_Case_ID__c');
  const uniqueVisits = uniqueArray(Visit, 'Visit_ID__c');
  // =======================================

  const resultUniquePatient = reduceArray(uniquePatients, 'CreatedById');
  const resultUniqueVisit = reduceArray(uniqueVisits, 'CreatedById');

  // PATIENT ======================================================
  console.log('Audit record for Patient');
  for (let key in resultUniquePatient) {
    console.log(
      `Total count of unique patients with ${key} ${checkLength(
        resultUniquePatient,
        key
      )}`
    );
  }
  console.log('==============================================================');
  // ==============================================================

  // VISIT ========================================================
  console.log('Audit record for Visit');
  for (let key in resultUniqueVisit) {
    console.log(
      `Total count of unique patients with ${key} ${checkLength(
        resultUniqueVisit,
        key
      )}`
    );
  }
  console.log('==============================================================');
  // ==============================================================

  state.data = {};
  return state;
});
