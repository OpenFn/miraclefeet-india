alterState(async state => {
  const { Patient, Visit, Clinic, VisitDeleted, LookupTable } = state.data;

  const chunk = (arr, chunkSize) => {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  };

  // console.log('Patient:', Patient.length)
  // console.log('Visit:', Visit.length)
  // return state;

  const patientSets = chunk(Patient, 10);
  const visitSets = chunk(Visit, 10);

  console.log('Patient sets:', patientSets.length);
  console.log('Visit sets:', visitSets.length);

  const visitChunks = [];
  const patientChunks = [];

  patientSets.forEach((sets, i) => {
    // console.log(`${i+1} patient set = ${sets.length}`);
    const data = {
      Visit: [],
      Clinic,
      LookupTable,
      VisitDeleted,
      Patient: sets,
    };
    patientChunks.push(data);
  });

  visitSets.forEach((sets, i) => {
    // console.log(`${i + 1} visit set = ${sets.length}`);
    const data = {
      Visit: sets,
      Clinic,
      LookupTable,
      VisitDeleted,
      Patient: [],
    };
    visitChunks.push(data);
  });

  let countInbox = 0;
  const postToInbox = async data => {
    countInbox++;
    console.log(`${countInbox} request to inbox`);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await post(state.configuration.inboxUrl, { body: data })(state);
  };

  for (const patient of patientChunks) {
    await postToInbox(patient);
  }

  for (const visit of visitChunks) {
    await postToInbox(visit);
  }

  return { ...state, patientChunks, visitChunks };
});
