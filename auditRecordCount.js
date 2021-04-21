alterState(state => {
  const { Patient, Visit, Clinic, VisitDeleted, LookupTable } = state.data;

  console.log(`Total count of clinic sets  ${Clinic.length}.`);
  console.log(`Total count of patient sets  ${Patient.length}.`);
  console.log(`Total count of visit sets  ${Visit.length}.`);
  console.log(`Total count of deleted visit sets  ${VisitDeleted.length}.`);

  return state;
});