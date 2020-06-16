alterState(state => {
  function clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === '-' || obj[propName] === null) {
        delete obj[propName];
      }
    }
    return obj;
  }

  state.data = {
    visits: state.data.visits.map(v => {
      v['Patient__r.CommCare_Case_ID__c'] = v.Patient_ID__c;
      delete v.Patient_ID__c;
      return clean(v);
    }),
  };

  return state;
});

bulk(
  'Visit_new__c',
  'upsert',
  {
    extIdField: 'gciclubfootommcare_case_id__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('visits')
);
