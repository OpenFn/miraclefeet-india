alterState(state => {
  console.log('Received bulk payload from MF India, preparing for Salesforce.');
  function chunk(arr, chunkSize) {
    var R = [];
    for (var i = 0, len = arr.length; i < len; i += chunkSize)
      R.push(arr.slice(i, i + chunkSize));
    return R;
  }

  const clinicSets = chunk(state.data.Clinic, 5);
  const patientSets = chunk(state.data.Patient, 5);
  const visitSets = chunk(state.data.Visit, 5);
  const deletedVisitSets = chunk(state.data.VisitDeleted, 5);

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

  // Splitting arrays in half =========================
  const halfPatients = Math.ceil(patientSets.length / 2);
  const halfVisits = Math.ceil(visitSets.length / 2);

  const patientSets1 = patientSets.splice(0, halfPatients);
  const patientSets2 = patientSets.splice(-halfPatients);

  const visitSets1 = visitSets.splice(0, halfVisits);
  const visitSets2 = visitSets.splice(-halfVisits);

  // ==================================================

  async function makePosts() {
    return Promise.all([
      ...clinicSets.map(item => postClinics(item)),
      ...patientSets1.map(item => postPatients(item)),
      ...visitSets1.map(item => postVisits(item)),
      ...deletedVisitSets.map(item => postDeletedVisits(item)),
    ]).then(() => {
      console.log('starting here');
      return Promise.all([
        ...patientSets2.map(item => postPatients(item)),
        ...visitSets2.map(item => postVisits(item)),
      ]);
    });
  }

  return makePosts();
});
