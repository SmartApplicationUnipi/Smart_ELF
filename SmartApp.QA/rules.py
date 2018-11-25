from constants import PRE,R_ID,DRS,VARS,KW,PREDS

def retrieve_professors_names():
    list = []
    #TODO:read RDF CRAWLING tuples and retrieve all professor (surnames/ full names?)
    return list

transform_rules =   [
                        {PRE:{
                            R_ID:KW,
                            VALUE:["lezione","corso"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["lecture($1)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["prof","prof.","professore","professor"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["person($1)","professor($1)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:retrieve_professors_names()
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["person($1)","professor($1)","equals($1,$this.VALUE)"] #TODO: decide both on equals(x,y) [logic variables binding] and constant extraction $this.VALUE
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["un","una","uno","un'"]
                            },
                        DRS:{VARS:[],
                            PREDS:[]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["il","lo","la","i","gli","le"]
                            },
                        DRS:{VARS:[],
                            PREDS:[]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["di","del","dello","della","dei","degli","delle"]
                            },
                        DRS:{VARS:["$1","$2"],
                            PREDS:["own($1,$2)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["quale"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["unknown($1)","target($1)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["dove"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["location($1)","unknown($1)","target($1)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["chi"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["person($1)","unknown($1)","target($1)"]
                            }
                        },
                        {PRE:{
                            R_ID:KW,
                            VALUE:["quando"]
                            },
                        DRS:{VARS:["$1"],
                            PREDS:["time($1)","unknown($1)","target($1)"]
                            }
                        }
                    ]
merge_rules =       [
                    ]
rules = transform_rules + merge_rules
