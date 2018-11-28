
** register() **

   * Returns
     * <>
     
** registerTags(<idSource>, <tagsList>) **

   * Params
     
   * Returns

** getTagDetails(<idSource>, <tagsList>) **

   * Params
     
   * Returns

** addRule(<idSource>, <ruleTag>, <jsonRule>) **

   * Params
     * <idSource>
     * <ruleTag>
     * <jsonRule> is a json containing two properties with keys `_head` and `_body`, like:
       { _head: `predicate', _body: `clauseList' }
       where
        `predicate`: is a json object;
        `clauseList` is an array of json objects.

   * Returns
     

** updateFactByID(<idFact>, <idSource>, <tag>, <TTL>, <reliability>, <jsonFact>) **

   * Params
     
   * Returns

** query(<jsonReq>) **

   * Params
     
   * Returns

** queryBind(<jsonReq>) **

   * Params
     
   * Returns

** queryFact(<jsonReq>) **

   * Params
     
   * Returns

** removeFact(<idSource>, <jsonReq>) **

   * Params
     
   * Returns

** removeRule(<idSource>, <idRule>) **

   * Params
     
   * Returns

** subscribe(<idSource>, <jsonReq>, <callback>) **

   * Params
     
   * Returns

