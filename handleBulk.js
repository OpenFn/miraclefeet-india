alterState(state => {
  console.log('Received bulk payload from MF India, preparing for Salesforce.');
  function chunk(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  }

  const clinicSets = chunk(state.data.Clinic, 10);
  const patientSets = chunk(state.data.Patient, 10);
  const visitSets = chunk(state.data.Visit, 10);
  const deletedVisitSets = chunk(state.data.VisitDeleted, 10);

  clinicSets.map(x => {
    post(state.configuration.inboxUrl, {
      body: { clinics: x },
    })(state);
  });

  patientSets.map(x => {
    post(state.configuration.inboxUrl, {
      body: { patients: x },
    })(state);
  });

  visitSets.map(x => {
    post(state.configuration.inboxUrl, {
      body: { visits: x },
    })(state);
  });

  deletedVisitSets.map(x => {
    post(state.configuration.inboxUrl, {
      body: { deletedVisits: x },
    })(state);
  });

  return state;
});
