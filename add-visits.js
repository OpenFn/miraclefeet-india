alterState(state => {
  function clean(obj) {
    for (var propName in obj) {
      if (obj[propName] === '-' || obj[propName] === null) {
        delete obj[propName];
      } else if (obj[propName] === 0) {
        obj[propName]='';
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
    5: 'Heel Varus',
  };

  const miracleFeetBarSizeMap = {
    '150 mm': 'Extra Small',
    '180 mm': 'Small',
    '220 mm': 'Large',
  };
  
  const treatmentMap = {
    'Manipulation and Casting': 'Casting',
    'Casting': 'Casting', 
    'First Brace': 'First Brace', 
    'Brace Followup': 'Brace Followup', 
    'Brace Follow Up': 'Brace Follow Up', 
    'Tenotomy': 'Tenotomy', 
    'Surgery': 'Surgery',
    'Temporarily Suspend Treatment': 'Temporarily Suspend',
    'Temporarily Suspend': 'Temporarily Suspend',
    'Temporarily Complete': 'Temporarily Complete',
    'None -Treatment is Complete': 'Temporarily Complete',
    'Refer': 'Other', 
    'Other': 'Other',
    '0': '',
    0 : ''
  };

  function getBarSize(matched_value) {
    return miracleFeetBarSizeMap[matched_value]
      ? miracleFeetBarSizeMap[matched_value]
      : '-';
  }

  function searchBarSizeStringByRegex(str) {
    let regExp = /(\d+\s*mm$)/g;
    let matches = str ? str.trim().match(regExp) : str;
    return matches ? matches[0] : 'Invalid';
  }

  state.data = {
    visits: state.data.visits.map(v => {
      //delete from upload; we can't update this in SF unless setting enabled?
      delete v.CreatedById;
      delete v.LastModifiedById;
      
      v.Last_Updated_by_India_CAST_App__c = new Date().toISOString();
      v.Upload_Source__c = 'India CAST App';

      //Mappings India provided need to be re-mapped to correct Salesforce field
      v['Patient__r.CommCare_Case_ID__c'] = v.Patient__c; //lookup parent patient
      delete v.Patient__c;
      delete v.CommCare_Case_ID__c;
      
      v.gciclubfootommcare_case_id__c = v.New_Visit_ID__c;
      v.gciclubfootommcare_case_id__c = v.Visit_ID__c; //reassign external Id
      delete v.Visit_ID__c;

      v.Right_Treatment_Other__c = v.TreatmentR_Other;
      delete v.TreatmentR_Other;

      v.Left_Treatment_Other__c = v.TreatmentL_Other;
      delete v.TreatmentL_Other;

     v.Casting_Complications_Type__c = v.ComplicationType;
     delete v.ComplicationType;
     
     v.ComplicationType_L = v.ComplicationType_L && v.ComplicationType_L !== undefined && v.ComplicationType_L !== 'undefined'? v.ComplicationType_L : '';
     v.ComplicationType_R = v.ComplicationType_R && v.ComplicationType_R !== undefined && v.ComplicationType_R !== 'undefined'? v.ComplicationType_R : '';

      v.Casting_Complications_Notes__c = 
        v.ComplicationType_L  + v.ComplicationType_R;
      delete v.ComplicationType_L;
      delete v.ComplicationType_R;
      v.Casting_Complications_Notes__c === undefined || v.Casting_Complications_Notes__c === 'undefined' ? '' : v.Casting_Complications_Notes__c;
      
      v.Left_Treatment__c == 0 || v.Left_Treatment__c =='0' ? '' : v.Left_Treatment__c; 
      v.Right_Treatment__c == 0 || v.Right_Treatment__c =='0' ? '' : v.Right_Treatment__c; 
      
      v.Right_Treatment_Other__c = treatmentMap[v.Right_Treatment__c]==='Other'
      ? v.Right_Treatment__c 
      : '';
      
      v.Left_Treatment_Other__c = treatmentMap[v.Left_Treatment__c]==='Other' 
      ? v.Left_Treatment__c
      : '';
      
      v.Right_Treatment__c = v.Right_Treatment__c===0 ? '': treatmentMap[v.Right_Treatment__c] || 'Other';
      v.Left_Treatment__c = v.Left_Treatment__c===0 ? '': treatmentMap[v.Left_Treatment__c] || 'Other';

      // New transformations implemented ========================
      v.Bracing_Stage__c = bracingStageMap[v.Bracing_Stage__c];

      v.Relapse_Feet_Affected__c =
        v.Relapse_Feet_Affected__c == 1
          ? 'Left'
          : v.Relapse_Feet_Affected__c == 2
          ? 'Right'
          : v.Relapse_Feet_Affected__c
          ? 'Both'
          : '';

      v.Tenotomy_Given__c =
        v.Tenotomy_Given__c == 1
          ? 'Yes'
          : v.Tenotomy_Given__c == 0
          ? 'No'
          : '';

      if (v.Date_of_Tenotomy__c) {
        const dateParts = v.Date_of_Tenotomy__c.split('-');
        const standardizedDate =
          dateParts[0].length == 4
            ? v.Date_of_Tenotomy__c
            : `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;

        v.Date_of_Tenotomy__c = new Date(standardizedDate).toISOString();
      }

      let RelapseTypeTransformed = [];

      const RelapseTypeRight =  v.Relapse_Type_Right__c 
        ? v.Relapse_Type_Right__c.split(',') : '';
      for (let type of RelapseTypeRight) {
        RelapseTypeTransformed.push(relapseTypeMap[type]);
      }
      v.Relapse_Type_Right__c = RelapseTypeTransformed.join('; ');

      const RelapseTypeLeft = v.Relapse_Type_Left__c
        ? v.Relapse_Type_Left__c.split(','): '';
      RelapseTypeTransformed = [];
      for (let type of RelapseTypeLeft) {
        RelapseTypeTransformed.push(relapseTypeMap[type]);
      }
      v.Relapse_Type_Left__c = RelapseTypeTransformed.join('; ');

      v.MiracleFeet_Bar_Size__c = getBarSize(
        searchBarSizeStringByRegex(v.MiracleFeet_Bar_Size__c)
      );
      
      v.First_Brace__c = (v.First_Brace__c==='1') ? true : 
        (v.First_Brace__c==='2') ? false : undefined; 
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
