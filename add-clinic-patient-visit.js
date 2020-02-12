//** New Job to map CAST custom mobile app data to Salesforce **//


//upsert Clinics
each(
  dataPath("$.Clinic[*]"),
  upsert("Account", "CAST_Location_ID__c", fields(
    field("CAST_Location_ID__c", dataValue("CAST_Location_ID__c")),
    field("Name", "MFI Clinic"), //Ask MFI re: naming convention
    field("Zone__c", dataValue("Zone__c")),
    field("Start_Date__c", dataValue("Start_Date__c")),
    field("Active__c", dataValue("Active__c"))
  ))
)
//--> CHANGE TO BULK UPSERT
//upsert Patients
each(
  dataPath("$.Patient[*]"),
  upsert("Contact", "CommCare_Case_ID__c", fields(
    field("CommCare_Case_ID__c", dataValue("Patient_ID__c")), //added ExtId
    relationship('Account', 'CAST_Location_ID__c', dataValue('CAST_Location_ID__c')), //added ExtId
    field("Referral_Source_Doctor_Name__c", (state) => {
      return (dataValue("Referral_Source_Doctor_Name__c")(state) === '-' ? '' : dataValue("Referral_Source_Doctor_Name__c")(state))
    }),
    //field("Neighborhood__c", ...)
    //insert other direct field mappings as line above, AND...
    //add logic so that across all mappings return blank/no value specified => (dataValue==='-' ? '' : value)
    //see what I did in L21-22 for this logic
  ))
)
//--> CHANGE TO BULK UPSERT
//upsert Visits
each(
  dataPath("$.Visit[*]"),
  upsert("Visit_new__c", "gciclubfootommcare_case_id__c", fields(
    field("gciclubfootommcare_case_id__c", dataValue("gciclubfootommcare_case_id__c")),
    relationship('Patient__r', "CommCare_Case_ID__c", dataValue("Patient_ID__c")), //added ExtId
    field("Referral_Type__c", (state) => {
      return (dataValue("Referral_Type__c")(state) === '-' ? '' : dataValue("Referral_Type__c")(state))
    }),
    //field("Case_Closed_Date__c", ...)
    //insert other direct field mappings as line above, AND...
    //add logic so that across all mappings return blank if no value specified => (dataValue==='-' ? '' : value)
    //see what I did in L37-38 for this logic
  ))
)
