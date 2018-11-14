import requests
import re
import json

def NLP_GetTemplate(intent):
    with open('templates.json') as f:
        data = json.load(f)

    templates = list(filter(lambda x: x['intent'] == intent, data))
    template = templates[0]['template']
    regex = "\[\w*\]"
    processor = re.compile(regex)
    placeholders = processor.findall(template)

    return (placeholders,template)

def NLP_Generate (JSON_Object):

    placeholders, template = NLP_GetTemplate(JSON_Object['intent']) 
    for el in placeholders:

        key = el[1:-1]
        template = template.replace(el, JSON_Object[key])

    return template



def NLP_Understand (string, language = "en"): 

    if language != "en":
        raise NotImplementedError("Language not implemented yet!")
    
    headers = {
        # Request headers
        'Ocp-Apim-Subscription-Key': 'f92fd052225848cca5de626fd874a7b5',
    }

    params ={
        # Query parameter
        'q': string,
        # Optional request parameters, set to default values
        'timezoneOffset': '0',
        'verbose': 'false',
        'spellCheck': 'false',
        'staging': 'false',
    }

    try:
        r = requests.get('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/118d13b3-b1fe-4ed5-be14-b48ca355935f',headers=headers, params=params)
        return r.json()
    
    except Exception as e:
        print("[Errno {0}] {1}".format(e.errno, e.strerror))
        raise e

 

if __name__ == '__main__':

    print("Testing:\n")

    print(NLP_Understand("When will the next lecture of machine learning will be held and which professor will teach it?"))

    JSON_Response_1 = {
        "intent" : "Lecture.Place",
        "Lecture"   : "Math",
        "Professor" : "Poloni",
        "Classroom" : "class A1"
    }

    print("\n")

    JSON_Response_2 = {
        "intent" : "Lecture.Time",
        "Lecture"   : "Math",
        "Professor" : "Poloni",
        "Daytime"   : "Tuesday from 14 to 16"
    }
    print(NLP_Generate(JSON_Response_2))
