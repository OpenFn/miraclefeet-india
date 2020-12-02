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
    clinics: state.data.clinics.map(c => {
      //delete; we cannot update these in SF unless setting enabled
      delete c.CreatedById; // map to Open Date CommCare fields
      delete c.LastModifiedById;
      
      c.Clinic_External_ID__c = c.Name; 
      c.India_Clinic_Code__c = c.CAST_Location_ID__c;
      delete c.CAST_Location_ID__c
      
     // c.Name = 'MFI Clinic';  //confirm we name all India clinic this? 
      
      return clean(c);
    }),
  };

  return state;
});

//upsert Clinics
bulk(
  'Account',
  'upsert',
  {
    extIdField: 'Clinic_External_ID__c',
    //extIdField: 'CAST_Location_ID__c', //Clinic External Id
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('clinics')
);
