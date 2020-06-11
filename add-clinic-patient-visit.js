alterState(state => {
  // create a cleaning function that removes props with '-' values
  function clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === '-' || obj[propName] === null) {
        delete obj[propName];
      }
    }
    return obj;
  }

  // format for bulk upserts
  state.data = {
    clinics: state.data.Clinic.map(c => {
      delete c.CreatedById;
      delete c.LastModifiedById;
      c.Name = 'MFI Clinic';
      return clean(c);
    }),
    patients: state.data.Patient.map(p => {
      p.CommCare_Case_ID__c = p.CAST_Patient_ID__c;
      delete p.CAST_Patient_ID__c;

      p.gciclubfootommcare_case_id__c = p.Visit_ID__c;
      delete p.Visit_ID__c;

      p['Clinic__r.Unique_Clinic_Identifier__c'] = p.CAST_Locaion_ID__c;

      return clean(p);
    }),
    visits: state.data.Visit.map(v => {
      v['Patient__r.CommCare_Case_ID__c'] = v.Patient_ID__c;
      delete v.Patient_ID__c;
      return clean(v);
    }),
  };

  // cleanup
  delete state.data.Clinic;
  delete state.data.Patient;
  delete state.data.Visit;

  // return state for next opertaion in job
  return state;
});

bulk(
  'Account',
  'upsert',
  { extIdField: 'CAST_Location_ID__c', failOnError: true, allowNoOp: true },
  dataValue('clinics')
);

bulk(
  'Contact',
  'upsert',
  { extIdField: 'CommCare_Case_ID__c', failOnError: true, allowNoOp: true },
  dataValue('patients')
);

bulk(
  'Visit_new__c',
  'upsert',
  {
    extIdField: 'gciclubfootommcare_case_id__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('patients')
);
