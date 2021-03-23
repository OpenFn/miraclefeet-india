alterState(state => {
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

  const postClinics = async cs => {
    return post(state.configuration.inboxUrl, {
      body: { clinics: cs },
    })(state);
  };

  const postPatients = async ps => {
    return post(state.configuration.inboxUrl, {
      body: { patients: ps },
    })(state);
  };

  const postVisits = async vs => {
    return post(state.configuration.inboxUrl, {
      body: { visits: vs },
    })(state);
  };

  const postDeletedVisits = async dvs => {
    return post(state.configuration.inboxUrl, {
      body: { deletedVisits: dvs },
    })(state);
  };

  async function makePosts() {
    return Promise.all([
      clinicSets.forEach(item => postClinics(item)),
      patientSets.forEach(item => postPatients(item)),
      visitSets.forEach(item => postVisits(item)),
      deletedVisitSets.forEach(item => postDeletedVisits(item)),
    ]);
  }
  return makePosts();
});
