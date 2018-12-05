
**register()**

   * Returns
     * **
     
**registerTags(*idSource*, *tagsList*)**

   * Params
     
   * Returns

**getTagDetails(*idSource*, *tagsList*)**

   * Params
     
   * Returns

**addRule(*idSource*, *ruleTag*, *jsonRule*)**

   This function creates a new rule for the inference engine to let it create new fact.
   The inference engine tries to unificate all the clauses of the rule by matching those with facts in the knowledge base and if this operation succedes one or more set of bind are created.
   Those sets of bind are used to instantiate new facts with the same structure of the head of the rule.

   * Params
     * *idSource*
     * *ruleTag*
     * *jsonRule* is a json containing two properties with keys '_head' and '_body', like: { _head: 'predicate', _body: 'clauseList' }, where:
        * predicate is a json object;
        * clauseList is an array of json objects.

   * Returns

   * Example

     ```
     addRule(myId, 'RDF', { "_head": { "subject": "$prof", "relation": "is in", "object": "$room" },
                             "_body": [ { "subject": "$prof", "relation": "teaches", "object": "$course" },
                                        { "subject": "$course", "relation": "is in room", "object": "$room"} ] }
                                        ```

     For example, suppose the KB contains the following facts:

     { subject: "SmartApplication", relation "is in room", object: "Room X1" }

     { subject: "SmartApplication", relation "is in room", object: "Room A" }

     { subject: "Software Validation and Verification", relation "is in room", object: "Room X3" }

     { subject: "Gervasi", relation "teaches", object: "Smartapplication" }

     The inference engine will genereate the following facts:

     { subject: "Gervasi", relation "is in", object: "Room X1" }

     { subject: "Gervasi", relation "is in", object: "Room A" }

**updateFactByID(*idFact*, *idSource*, *tag*, *TTL*, *reliability*, *jsonFact*)**

   * Params
     
   * Returns

**query(*jsonReq*)**

   * Params
     
   * Returns

**queryBind(*jsonReq*)**

   * Params
     
   * Returns

**queryFact(*jsonReq*)**

   * Params
     
   * Returns

**removeFact(*idSource*, *jsonReq*)**

   * Params
     
   * Returns

**removeRule(*idSource*, *idRule*)**

   * Params
     
   * Returns

**subscribe(*idSource*, *jsonReq*, *callback*)**

   * Params
     
   * Returns

