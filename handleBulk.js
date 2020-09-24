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
  patientSets.forEach(clin_sets => {
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
  visitSets.forEach(clin_sets => {
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
  deletedVisitSets.forEach(clin_sets => {
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
      ...clinicSets.map(item => postClinics(item)),
      ...patientSets.map(item => postPatients(item)),
      ...visitSets.map(item => postVisits(item)),
      ...deletedVisitSets.map(item => postDeletedVisits(item)),
    ]);
  }
  return makePosts();
});
