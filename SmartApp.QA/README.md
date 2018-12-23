# Question Answering (QA) module
This module aims to make ELF capable of replying to users in a meaningful and realistic way.
This module is composed by various parts which concurrently perform their analysis.
Different type of processing of user's query take place when the STT module publish its tuple in the KB.

# Blocks
Each block runs concurrently in its own thread. There are 5 parts at the moment:

- DRS Service
- GNLP service (located in SmartApp.GNLP)
- Template matcher Service
- Query Manager service
- Result Manager service

All services are subscribed to the tuple with the tag **TAG_USER_TRANSCRIPT** defined in __interface_tags.py__

## DRS service
DRS service takes user's query transcript and extract the associated Discourse Representation Structure
- __**subscribed to**__: *TAG_USER_TRANSCRIPT*
- __**publishes:**__: *TAG_ANSWER*
(see __interface_tags.py__)

## GNLP service
GNLP service takes user's query transcript and extract the parse tree of the sentence.
- __**subscribed to**__: *TAG_USER_TRANSCRIPT*
- __**publishes:**__: *NLP_ANALYSIS*

## Template service
Template service takes user's query transcript and tries to match it against templates defined in __templates.py__
- __**subscribed to**__: *TAG_USER_TRANSCRIPT*
- __**publishes:**__: *TAG_ANSWER*
(see __interface_tags.py__)

Ideally each modules produces a query that is forwarded to the QueryManager module.

## Query Manager
This modules react to the tuple published by the modules described above, and using a policy decides which query to perform.
Results are then passed to the ResultManager services
- __**subscribed to**__: *TAG_ANSWER*
- __**publishes:**__: *TAG_BINDINGS*
(see __interface_tags.py__)

## Result Manager
This module is in charge of selecting a result among the ones provided by the query manager module, and passing it to the answer generation module.
- __**subscribed to**__: *TAG_BINDINGS*
- __**publishes:**__: *TAG_FINAL_ANSW*
(see __interface_tags.py__)
