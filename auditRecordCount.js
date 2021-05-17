alterState(state => {
  const { Patient, Visit, Clinic, VisitDeleted, LookupTable } = state.data;

  function reduceArray(array) {
    const arr = array.reduce((r, a) => {
      r[a.CreatedById] = r[a.CreatedById] || [];
      r[a.CreatedById].push(a);

      return r;
    }, Object.create(null));
    return arr;
  }

  function checkLength(array, key) {
    return array[key] ? array[key].length : 0;
  }
  let resultPatient = reduceArray(Patient);
  let resultVisit = reduceArray(Visit);
  let resultClinic = reduceArray(Clinic);
  let resultVisitDeleted = reduceArray(VisitDeleted);

  state.data = {};
  // state.resultPatient = resultPatient;
  const MH01Patient = checkLength(resultPatient, 'MH01');
  const MH03Patient = checkLength(resultPatient, 'MH03');

  const MH01Visit = checkLength(resultVisit, 'MH01');
  const MH03Visit = checkLength(resultVisit, 'MH03');

  const MH01Clinic = checkLength(resultClinic, 'MH01');
  const MH03Clinic = checkLength(resultClinic, 'MH03');

  const MH01VisitDeleted = checkLength(resultVisitDeleted, 'MH01');
  const MH03VisitDeleted = checkLength(resultVisitDeleted, 'MH03');

  console.log(`Total count of patients with MH01 ${MH01Patient}`);
  console.log(`Total count of patients with MH03 ${MH03Patient}`);

  console.log(`Total count of visits with MH01 ${MH01Visit}`);
  console.log(`Total count of visits with MH03 ${MH03Visit}`);

  console.log(`Total count of clinics with MH01 ${MH01Clinic}`);
  console.log(`Total count of clinics with MH03 ${MH03Clinic}`);

  console.log(`Total count of deleted visits with MH01 ${MH01VisitDeleted}`);
  console.log(`Total count of deleted visits with MH03 ${MH03VisitDeleted}`);

  // console.log(`Total count of clinic sets  ${Clinic.length}.`);
  // console.log(`Total count of patient sets  ${Patient.length}.`);
  // console.log(`Total count of visit sets  ${Visit.length}.`);
  // console.log(`Total count of deleted visit sets  ${VisitDeleted.length}.`);

  return state;
});
