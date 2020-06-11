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
        CAST_Location_Id__c: c.CAST_Location_Id__c
      };
    }),
  };

  return state;
});

bulk(
  'Visit_new__c',
  'delete',
  {
    extIdField: 'CAST_Location_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('deletedVisits')
);