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

      const visitDate = new Date(p.Date_of_First_Visit__c);
      const birthdayDate = new Date(p.Birthdate);
      const dayDifference = Math.abs(
        (visitDate - birthdayDate) / (1000 * 3600 * 24)
      );
      p.Age_Months_Started_Treatment__c = dayDifference / 30.4;

      p.Last_Updated_by_India_CAST_App__c = new Date().toISOString();
      p.Upload_Source__c = 'India CAST App'; 

      p.Country__c = 'India'; //default Country

      p.Relapse_Type_Left_India__c = p.Relapse_Type_Left_Foot__c
        ? p.Relapse_Type_Left_Foot__c
        : '';
      p.Relapse_Type_Right_India__c = p.Relapse_Type_Right_Foot__c
        ? p.Relapse_Type_Right_Foot__c
        : '';
      
      //TODO: Convert Date_of_Tetonomy__c when state is in format '24-10-2019'
      /*p.Date_of_Tenotomy__c = p.Date_of_Tenotomy__c
        ? new Date(p.Date_of_Tenotomy__c).toISOString() : ''; */

      //SF field = India field;
      //p.gciclubfoot_CAST_Patient_ID__c = p.CAST_Patient_ID__c; //confirm mapping
      // delete p.CAST_Patient_ID__c;
      delete p.gciclubfoot__CAST_Patient_ID__c;

      p.Gender__c = p.gciclubfoot__Gender__c;
      delete p.gciclubfoot__Gender__c;
      
      p.New_Patient_ID__c = p.CommCare_Case_ID__c; //new external Id

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
