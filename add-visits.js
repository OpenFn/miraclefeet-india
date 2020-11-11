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
      
      v.Right_Treatment_Other__c = v.TreatmentR_Other; 
      delete v.TreatmentR_Other; 
      
      v.Left_Treatment_Other__c = v.TreatmentL_Other; 
      delete v.TreatmentL_Other; 
      
      v.Casting_Complications_Type__c = v.ComplicationType;
      delete v.ComplicationType;
      
      v.Casting_Complications_Notes__c = v.ComplicationType_L + v.ComplicationType_R;
      delete v.ComplicationType_L;
      delete v.ComplicationType_R; 
      
      //TODO: ADD BACK IN AFTER TRANSFORMATIONS IMPLEMENTED...
      delete v.Relapse_Type_Left__c; 
      delete v.Relapse_Type_Right__c
      delete v.Relapse_Feet_Affected__c; 
      delete v.Bracing_Stage__c;
      //=========================//
      
      delete v.LastModifiedById;
      
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
