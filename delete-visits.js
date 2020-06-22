alterState(state => {
  const ids = state.data.deletedVisits
    .map(c => {
      return `'${c.Visit_ID__c}'`;
    })
    .toString();

  return query(
    `SELECT Id FROM Visit_new__c WHERE gciclubfootommcare_case_id__c IN (${ids})`
  )(state);
});

bulk(
  'Visit_new__c',
  'delete',
  { failOnError: true, allowNoOp: true },
  lastReferenceValue('records')
);