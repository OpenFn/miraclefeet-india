//** New Job to map CAST custom mobile app data to Salesforce **//
//** Consider using Salesforce BulkAPI? This will be a daily post to OpenFn to load into Salesforce **//

//upsert Clinics
upsert("Account", "CAST_Location_ID__c", fields(
  ...
))

//upsert Patients
upsert("Contact", "CommCare_Case_ID__c", fields(
  ...
))

//upsert Visits
upsert("Visit_new__c", "gciclubfootommcare_case_id__c", fields(
  ...
))
