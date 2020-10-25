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
      
      v['Patient__r.CommCare_Case_ID__c'] = v.Patient__c; //lookup parent patient
      delete v.Patient__c;
      delete v.CommCare_Case_ID__c; 
      
      v.gciclubfootommcare_case_id__c = v.Visit_ID__c; //reassign external Id
      delete v.Visit_ID__c;
      
      //delete from upload; we can't update this in SF unless setting enabled?
      delete v.CreatedById;
      
      return clean(v);
    }),
  };

  return state;
});

//Upsert Visits
bulk(
  'Visit_new__c',
  'upsert',
  {
    extIdField: 'gciclubfootommcare_case_id__c', //Visit external Id
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('visits')
);
