alterState(state => {
  function clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === '-' || obj[propName] === null) {
        delete obj[propName];
      }
    }
    return obj;
  }

  const bracingStageMap = {
    'All day and night': 'bracing_all_day',
    'At night and for naps': 'bracing_night_naps',
  };

  const relapseTypeMap = {
    1: 'Cavus',
    2: 'Dynamic Supination',
    3: 'Equinus',
    4: 'Forefoot Adduction',
    5: 'Varus',
  };

  const miracleFeetBarSizeMap = {
    '150 mm': 'Extra Small',
    '180 mm': 'Small',
    '220 mm': 'Large',
  };

  function getBarSize(matched_value) {
    return miracleFeetBarSizeMap[matched_value]
      ? miracleFeetBarSizeMap[matched_value]
      : '-';
  }

  function searchBarSizeStringByRegex(str) {
    let regExp = /(\d+\s*mm$)/g;
    let matches = str.trim().match(regExp);
    return matches ? matches[0] : 'Invalid';
  }

  state.data = {
    visits: state.data.visits.map(v => {
      //delete from upload; we can't update this in SF unless setting enabled?
      delete v.CreatedById;
      delete v.LastModifiedById;

      //Mappings India provided need to be re-mapped to correct Salesforce field
      v['Patient__r.CommCare_Case_ID__c'] = v.Patient__c; //lookup parent patient
      delete v.Patient__c;
      delete v.CommCare_Case_ID__c;

      v.gciclubfootommcare_case_id__c = v.Visit_ID__c; //reassign external Id
      delete v.Visit_ID__c;

      v.Right_Treatment_Other__c = v.TreatmentR_Other;
      delete v.TreatmentR_Other;

      v.Left_Treatment_Other__c = v.TreatmentL_Other;
      delete v.TreatmentL_Other;

      v.Casting_Complications_Type__c = v.ComplicationType;
      delete v.ComplicationType;

      v.Casting_Complications_Notes__c =
        v.ComplicationType_L + v.ComplicationType_R;
      delete v.ComplicationType_L;
      delete v.ComplicationType_R;
      
      v.Relapse_Feet_Affected__c == 0 ? null : v.Relapse_Feet_Affected__c; 

      // New transformations implemented ========================
      v.Bracing_Stage__c = bracingStageMap[v.Bracing_Stage__c];

      v.Relapse_Feet_Affected__c =
        v.Relapse_Feet_Affected__c == 1
          ? 'Left'
          : v.Relapse_Feet_Affected__c == 2
          ? 'Right'
          : 'Both';

      let RelapseTypeTransformed = [];

      const RelapseTypeRight = v.Relapse_Type_Right__c.split(',');
      for (let type of RelapseTypeRight) {
        RelapseTypeTransformed.push(relapseTypeMap[type]);
      }
      v.Relapse_Type_Right__c = RelapseTypeTransformed.join('; ');

      const RelapseTypeLeft = v.Relapse_Type_Left__c.split(',');
      RelapseTypeTransformed = [];
      for (let type of RelapseTypeLeft) {
        RelapseTypeTransformed.push(relapseTypeMap[type]);
      }
      v.Relapse_Type_Left__c = RelapseTypeTransformed.join('; ');

      v.MiracleFeet_Bar_Size__c = getBarSize(
        searchBarSizeStringByRegex(v.MiracleFeet_Bar_Size__c)
      );
      // ========================================================

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
