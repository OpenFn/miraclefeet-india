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

  // Mapping LookupCode
  clinicSets.forEach(clin_sets => {
    clin_sets.forEach(set => {
      Object.keys(set).forEach(key => {
        state.data.LookupTable.forEach(code => {
          if (key === code.AppFieldName && set[key] == code.LookupCode) {
            set[key] = code.Description;
          }
        });
      });
    });
  });

  patientSets.forEach(patient_sets => {
    patient_sets.forEach(set => {
      Object.keys(set).forEach(key => {
        state.data.LookupTable.forEach(code => {
          if (key === code.AppFieldName && set[key] == code.LookupCode) {
            set[key] = code.Description;
          }
        });
      });
    });
  });

  visitSets.forEach(visit_sets => {
    visit_sets.forEach(set => {
      Object.keys(set).forEach(key => {
        state.data.LookupTable.forEach(code => {
          if (key === code.AppFieldName && set[key] == code.LookupCode) {
            set[key] = code.Description;
          }
        });
      });
    });
  });

  deletedVisitSets.forEach(delvisit_sets => {
    delvisit_sets.forEach(set => {
      Object.keys(set).forEach(key => {
        state.data.LookupTable.forEach(code => {
          if (key === code.AppFieldName && set[key] == code.LookupCode) {
            set[key] = code.Description;
          }
        });
      });
    });
  });
  // Mapping LookupCode -- End

  const postClinics = cs => {
    count = count + 1;
    return post(state.configuration.inboxUrl, {
      body: { clinics: cs },
    })(state);
  };

  const postPatients = ps => {
    count = count + 1;
    return post(state.configuration.inboxUrl, {
      body: { patients: ps },
    })(state);
  };

  const postVisits = vs => {
    count = count + 1;
    return post(state.configuration.inboxUrl, {
      body: { visits: vs },
    })(state);
  };

  const postDeletedVisits = dvs => {
    count = count + 1;
    return post(state.configuration.inboxUrl, {
      body: { deletedVisits: dvs },
    })(state);
  };

  for (const clinics of clinicSets) {
    await postClinics(clinics);
  }
  for (const patients of patientSets) {
    await postPatients(patients);
  }
  for (const visits of visitSets) {
    await postVisits(visits);
  }
  for (const deletedVisits of deletedVisitSets) {
    await postDeletedVisits(deletedVisits);
  }

  console.log(`Made ${count} posts to OpenFn.`);

  return { data: {}, references: [], countOfPosts: count };

  // return Promise.all([
  //   ...clinicSets.map(arrayOfClinics => postClinics(arrayOfClinics)),
  //   ...patientSets.map(arrayOfPatients => postPatients(arrayOfPatients)),
  //   ...visitSets.map(arrayOfVisits => postVisits(arrayOfVisits)),
  //   ...deletedVisitSets.map(deletedVisits => postDeletedVisits(deletedVisits)),
  // ]).then(() => {
  //   console.log("This shows up after we're done.", count);
  // });
});
