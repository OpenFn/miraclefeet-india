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
    deletedVisits: state.data.deletedVisits.map(c => {
      return {
        gciclubfootommcare_case_id__c: c.Visit_ID__c
      };
    }),
  };

  return state;
});

bulk(
  'Visit_new__c',
  'delete',
  {
    extIdField: 'gciclubfootommcare_case_id__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('deletedVisits')
);
