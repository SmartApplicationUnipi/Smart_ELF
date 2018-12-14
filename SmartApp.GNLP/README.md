# General NLP Group

Our module provides two services: first, it performs a semantic analysis over written text (provided both from the AV and CRW modules); secondly, it builds a natural language answer out of the information provided by the reasoning module.

In order to extract entites and intents from a text, we resort to LUIS services [https://www.luis.ai/]. A JSON output example is:
```
{'
  entities': [
    {
      'endIndex': 24,                
      'entity': 'poloni',
      'score': 0.959523439,
      'startIndex': 19,
      'type': 'Professor'
    }
  ],
  'query': 'At which time Prof Poloni has lecture?',
  'topScoringIntent': {
    'intent': 'Lecture.Time',
    'score': 0.5547177
  }
}
```
In order to build a dependecy tree of the text we use the spaCy library [https://spacy.io/]. Each entry of the JSON output has the following fields:
```
'0_text' // the original word text
'1_norm' // the normalized word text
'2_lemma' // the base form of the word
'3_POS' // the simple part-of-speech tag
'4_tag' // the detailed part-of-speech tag
'5_parent' // the text of the parent node
'6_dep' //syntactic dependency, i.e. the relation between tokens
'7_children' // list of children nodes
```

## NLP_Generate

In order to build an answer out of a set of templates we assume the following JSON object format, e.g.:
```
JSON_Response = {
        "intent" : "Lecture.Time",
        "Lecture"   : "Math",
        "Professor" : "Poloni",
        "Daytime"   : "Tuesday from 14 to 16"
}
```

## Tuples structure
For the analysis phase:
```
{
  "tag" : "NLP_ANALYSIS",
  "entities": entities,
  "dependencies": parse_tree,
  "user_query": question,
  "timestamp": 1 # TODO
}
```
For the answer phase
```
{
  "tag" : "NLP_ANSWER",
  "text": answer,
  "user_query": question,
  "timestamp": 1 # TODO
}
```

## Usage
```
pip install -r requirements.txt
```
