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
    patients: state.data.patients.map(c => {
      delete c.CreatedById;
      delete c.LastModifiedById;
      c.Name = 'MFI Clinic';
      return clean(c);
    }),
  };

  return state;
});

bulk(
  'Account',
  'upsert',
  {
    extIdField: 'CAST_Location_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('patients')
);
