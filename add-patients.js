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
    patients: state.data.patients.map(p => {
      //India doesn't send us names, so we set to Id
      p.LastName = p.CAST_Patient_ID__c;
      delete p.Name;
      
      p.CommCare_Case_ID__c = p.CAST_Patient_ID__c;
      delete p.CAST_Patient_ID__c;

      /*p.gciclubfootommcare_case_id__c = p.Visit_ID__c;
      delete p.Visit_ID__c; */

      p.Gender__c = p.gciclubfoot__Gender__c;
      delete p.gciclubfoot__Gender__c;

      //p.CAST_Location_ID__c = p.CAST_Locaion_ID__c;
      p['Account.CAST_Location_ID__c'] = p.CAST_Locaion_ID__c;
      delete p.CAST_Locaion_ID__c;
      
      //we can't update this in SF
      delete p.CreatedById;
      
      return clean(p);
    }),
  };

  return state;
});

bulk(
  'Contact',
  'upsert',
  {
    extIdField: 'CommCare_Case_ID__c',
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('patients')
);
