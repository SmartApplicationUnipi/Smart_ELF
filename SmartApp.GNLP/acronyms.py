import json
import spacy
import en_core_web_sm


with open('all_lectures.json') as f:
    all_lectures = json.load(f)

# Days of the week
days = {
    "Mon" : "Monday",
    "Tue" : "Tuesday",
    "Wed" : "Wednesday",
    "Thu" : "Thursday",
    "Fri" : "Friday",
    "Sat" : "Saturday",
    "Sun" : "Sunday"
}

# Lectures
lectures = {}
parser = en_core_web_sm.load()
for entry in all_lectures:
    lecture = all_lectures[entry]["name"]
    tree = parser(lecture)
    acronym = ""
    for token in tree:
        if (token.tag_ != "IN" and token.tag_ != "TO" and token.tag_ != "DT" and token.tag_ != "CC"):
            acronym = acronym + token.text[0].upper()
    lectures[acronym] = lecture


with open('lectures_acr.json', 'w') as fp:
    json.dump(lectures, fp)

with open('days_acr.json', 'w') as fp:
    json.dump(days, fp)
