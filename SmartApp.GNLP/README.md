# General NLP Group

These files are used to make the basic answer to the user, given a transcripted query.

In order to gain entites and intents of the query, the `nlp.py` script makes requests to a LUIS server[https://www.luis.ai/].

The generate answer is given to the Emotional NLP group with the tag `"NLP_Answer"`.

Here are explained the two main functions.

## NLP_Understand

This function creates the request that is given to LUIS from an input string query and return the JSON, e.g.:
```
print(NLP_Understand("At which time Prof Poloni has lecture?"))
```
```
{'entities': [{'endIndex': 24,                
'entity': 'poloni',
'score': 0.959523439,
'startIndex': 19, 
'type': 'Professor'}],
'query': 'At which time Prof Poloni has lecture?', 
'topScoringIntent': {'intent': 'Lecture.Time', 
'score': 0.5547177}}
```

## NLP_Generate

This function creates the answer from a list of templates, given as a JSON object, e.g.:
```
JSON_Response = {
        "intent" : "Lecture.Time",
        "Lecture"   : "Math",
        "Professor" : "Poloni",
        "Daytime"   : "Tuesday from 14 to 16"
}
```
