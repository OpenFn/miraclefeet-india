# MiracleFeet India Integration
OpenFn integration between CAST custom app and MF Global Salesforce system. See the main [MiracleFeet Repo](https://github.com/OpenFn/Miracle-Feet/) for more on other Salesforce integrations. 

This integration is live on the OpenFn.org `MiracleFeet India` project. 

**Note: All commits `master` branch will be automatically published to OpenFn.**

## Solution Overview
This OpenFn-powered integration automates a one-way data sync between the India CAST app and the global Salesforce system. **[See these slides](https://docs.google.com/presentation/d/14xP5Si9zW4GEvrB8OssRF_5xNjsKWa-KPdVrO7N1VPQ/edit?usp=sharing)** for an overview. 

### Key Assumptions
1. The CAST app has developed a custom webhook to schedule a payload of data to be forwarded to the OpenFn inbox. This automation will run every day. 
- If OpenFn responds with error code → India will resend the next day. 
2. This payload will contain any records created or modified since the last upload. 
3. This payload will contain a “Lookup Table” catalog with a list of coded and corresponding string value definitions to inform how coded values can be translated and mapped to the global system (e.g., For the Abnormalities field, a “1” value should be re-labeled as → “No abnormalities” ). 

## Technical Overview
How the OpenFn automation works...
1. The CAST app will regurlarly send `clinic`, `patient`, and `visit` data to the OpenFn inbox as a JSON payload or `Message` ([see test example](https://github.com/OpenFn/miraclefeet-india/blob/master/sample_data/payload_new.json)). 
2. On receipt, OpenFn will trigger the job [`1. Handle Bulk CAST Data`](https://www.openfn.org/projects/pde3z9/jobs/jyxzgm) to read and parse this payload into smaller batches of `clinic`, `patient`, and `visit` records to be uploaded to Salesforce. 
3. These smaller batches will trigger the following jobs, which will perform additional data cleaning before uploading to Salesforce: 
- [`2a. Upload Clinics`](https://www.openfn.org/projects/pde3z9/jobs/jv8xjp) job maps to Salesforce `Clinics` (`Account` object)
- [`2b. Upload Patients`](https://www.openfn.org/projects/pde3z9/jobs/jv98rb) job maps to Salesforce `Patients` (`Contact` object)
- [`2c. Upload Visits`](https://www.openfn.org/projects/pde3z9/jobs/jvnr7w) job maps to Salesforce `Visits` (`Visit_new__c` object)
- [`2d. Delete Visits`](https://www.openfn.org/projects/pde3z9/jobs/jyjz8k) job deletes Salesforce `Visits` (`Visit_new__c` object) if requested by CAST in the scenario that there was a data entry mistake or change in data sharing consent
4. Data uploaded successfully to Salesforce will be visible in the _________ dashboards. 

## Integration Monitoring
The MiracleFeet Global System Administrators will be responsible for ongoing integration monitoring after the historical sync is complete. Admins may receive email alerts or may monitor `Activity History`. 

Failures may require additional data cleaning automation or coordination with the MiracleFeet India team to review which data was/was not forwarded from the CAST app. 

# Implementation Next Steps
- [ ] Historical migration of all clinic data; adjustment to integration
- [ ] System admin training 
- [ ] Finalization of data sharing agreement - [see draft here](https://docs.google.com/document/d/1wbxwRj_UK8C8sI7-t3GO2FAWQlJKUUBwvnY_VYtsfQA/edit?usp=sharing)


