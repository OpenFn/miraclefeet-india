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
      //India doesn't send us names, so we set LastName to Id
      p.LastName = p.CAST_Patient_ID__c;
      p.Patient_Name__c = p.CAST_Patient_ID__c;
      delete p.Name;
      
      p.Country__c = 'India'; //default Country
      
      //SF field = India field;
      //p.gciclubfoot_CAST_Patient_ID__c = p.CAST_Patient_ID__c; //confirm mapping
     // delete p.CAST_Patient_ID__c;
      delete p.gciclubfoot__CAST_Patient_ID__c;

      p.Gender__c = p.gciclubfoot__Gender__c;
      delete p.gciclubfoot__Gender__c;

      //p['Account.CAST_Location_ID__c'] = p.CAST_Locaion_ID__c;
      //delete p.CAST_Locaion_ID__c;
      p['Account.India_Clinic_Code__c'] = p.CAST_Location_ID__c;
      delete p.CAST_Location_ID__c;
      
      //delete from upload; we can't update this in SF unless setting enabled?
      delete p.CreatedById;
      
      
      
      return clean(p);
    }),
  };

  return state;
});

//Upload Patients
bulk(
  'Contact',
  'upsert',
  {
    extIdField: 'CommCare_Case_ID__c', //Patient external Id
    failOnError: true,
    allowNoOp: true,
  },
  dataValue('patients')
);
