alterState(state => {
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

    return post(state.configuration.inboxUrl, { body: data })(state);
  };

  async function makePost() {
    console.log('Posting to Openfn inbox');
    return Promise.all([
      ...patientChunks.map(item => postToInbox(item)),
      ...visitChunks.map(item => postToInbox(item)),
    ]);
  }
  return makePost();

  //   return { ...state, patientChunks, visitChunks };
});
