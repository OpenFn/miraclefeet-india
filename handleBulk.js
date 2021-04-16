alterState(async state => {
  console.log('Received bulk payload from MF India, preparing for Salesforce.');
  function chunk(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  }

  var clinicSets = chunk(state.data.Clinic, 10);
  var patientSets = chunk(state.data.Patient, 10);
  var visitSets = chunk(state.data.Visit, 10);
  var deletedVisitSets = chunk(state.data.VisitDeleted, 10);
  let count = 0;

  let countClinics = 0;
  let countPatients = 0;
  let countVisits = 0;
  let countDeletedVisits = 0;

  function addLookups(arrayOfSets) {
    arrayOfSets.forEach(set => {
      Object.keys(set).forEach(key => {
        state.data.LookupTable.forEach(code => {
          if (key === code.AppFieldName && set[key] == code.LookupCode) {
            set[key] = code.Description;
          }
        });
      });
    });
  }

  // Mapping LookupCode
  clinicSets.forEach(set => addLookups(set));
  visitSets.forEach(set => addLookups(set));
  deletedVisitSets.forEach(set => addLookups(set));
  patientSets.forEach(set => addLookups(set));
  // Mapping LookupCode -- End

  const postClinics = cs => {
    count = count + 1;
    countClinics += cs.length;
    return post(state.configuration.inboxUrl, {
      body: { clinics: cs },
    })(state);
  };

  const postPatients = ps => {
    count = count + 1;
    countPatients += ps.length;
    return post(state.configuration.inboxUrl, {
      body: { patients: ps },
    })(state);
  };

  const postVisits = vs => {
    count = count + 1;
    countVisits += vs.length;
    return post(state.configuration.inboxUrl, {
      body: { visits: vs },
    })(state);
  };

  const postDeletedVisits = dvs => {
    count = count + 1;
    countDeletedVisits += dvs.length;
    return post(state.configuration.inboxUrl, {
      body: { deletedVisits: dvs },
    })(state);
  };

  for (const clinicSet of clinicSets) {
    await postClinics(clinicSet);
  }
  for (const patientSet of patientSets) {
    await postPatients(patientSet);
  }
  for (const visitSet of visitSets) {
    await postVisits(visitSet);
  }
  for (const deletedVisitSet of deletedVisitSets) {
    await postDeletedVisits(deletedVisitSet);
  }

  console.log(`Made ${count} posts to OpenFn.`);
  console.log(`Posted ${countClinics} clinic sets to OpenFn.`);
  console.log(`Posted ${countVisits} visit sets to OpenFn.`);
  console.log(`Posted ${countPatients} patients sets to OpenFn.`);
  console.log(`Posted ${countDeletedVisits} deleted visits sets to OpenFn.`);

  return { data: {}, references: [], countOfPosts: count };

  // return Promise.all([
  //   ...clinicSets.map(arrayOfClinics => postClinics(arrayOfClinics)),
  //   ...patientSets.map(arrayOfPatients => postPatients(arrayOfPatients)),
  //   ...visitSets.map(arrayOfVisits => postVisits(arrayOfVisits)),
  //   ...deletedVisitSets.map(deletedVisits => postDeletedVisits(deletedVisits)),
  // ]).then(() => {
  //   console.log(`Made ${count} posts to OpenFn.`);
  // });
});
