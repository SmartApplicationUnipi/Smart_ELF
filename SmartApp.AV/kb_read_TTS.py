from urllib.parse import urlencode # For URL creation
import httplib2
from lxml import etree
import wave, sys, pyaudio

import json
import sys

sys.path.insert(0, '../SmartApp.KB/')

from kb import *

myID = register()



def make_marry_text(text,valency,arausand):


    v = str(valency)
    a = str(arausand)


    #result="""<emotionml version="1.0" xmlns="http://www.w3.org/2009/10/emotionml" category-set="http://www.w3.org/TR/emotion-voc/xml#everyday-categories"><emotion dimension-set="http://www.w3.org/TR/emotion-voc/xml#pad-dimensions"> """ +text+""" <dimension name="arousal" value="0.1"/><!-- high arousal --><dimension name="pleasure" value="0.9"/><!-- negative valence --><dimension name="dominance" value="0.2"/><!-- low potency    --></emotion></emotionml>"""
    result="""<emotionml version="1.0" xmlns="http://www.w3.org/2009/10/emotionml" category-set="http://www.w3.org/TR/emotion-voc/xml#everyday-categories"><emotion dimension-set="http://www.w3.org/TR/emotion-voc/xml#pad-dimensions"> """ +text+""" <dimension name="arousal" value="0.1"/><!-- high arousal --><dimension name="pleasure" value="0.9"/><!-- negative valence --><dimension name="dominance" value="0.2"/><!-- low potency    --></emotion></emotionml>"""
    
    return result

#print(queryBind({"text_f_audio": "$x"}))
###############################################################################################################################################

def make_audio(txt1):

    # Mary server informations
    mary_host = "localhost"
    mary_port = "59125"

    with open ("en_in", "r") as f:
        txt = f.read()
   # print("\n")
  #  print("\n")

   # print(txt)
   ## print("\n")
   # print(txt1)
  #  print("\n")
   # print("\n")
    
    txt=txt1

    language_in="dfki-prudence"
    language_text = "en-GB"
    
    # Build the query
    query_hash = {"INPUT_TEXT": txt,
                  "INPUT_TYPE": "EMOTIONML", # Input text
                  "LOCALE": language_text,
                  "VOICE": language_in, # Voice informations  (need to be compatible)
                  "OUTPUT_TYPE": "AUDIO",
                  "AUDIO": "WAVE", # Audio informations (need both)
                  }

    query = urlencode(query_hash)


    # Run the query to mary http server
    h_mary = httplib2.Http()
    good_response = False

    for i in range(3):
        resp, content = h_mary.request("http://%s:%s/process?" % (mary_host, mary_port), "POST", query)

        #  Decode the wav file or raise an exception if no wav files
        if (resp["content-type"] == "audio/x-wav"):

            # Write the wav file
            f = open("output_wav.wav", "wb")
            f.write(content)
            f.close()
            good_response = True
            break

    if not good_response:
        raise Exception(content)

    wf = wave.open('output_wav.wav')
    p = pyaudio.PyAudio()
    chunk = 1024
    print("---")

    stream = p.open(format =
                    p.get_format_from_width(wf.getsampwidth()),
                    channels = wf.getnchannels(),
                    rate = wf.getframerate(),
                    output = True)
    data = wf.readframes(chunk)
    print("---")

    while data != '':
        stream.write(data)
        data = wf.readframes(chunk)
        #print()
    print("---")


# to do with arausand and valency
def generate_emotional_text(text, emotion="happy"):
    root = etree.Element('emotionml')
    root.attrib["version"] = "1.0"
    root.attrib["xmlns"] = "http://www.w3.org/2009/10/emotionml"
    root.attrib["category-set"] = "http://www.w3.org/TR/emotion-voc/xml#everyday-categories"
    child = etree.Element('emotion')
    category = etree.Element('category')
    category.attrib["name"] = emotion
    child.text = text
    root.append(child)
    child.append(category)
    return etree.tostring(root, pretty_print=True).decode("utf-8")



###############################################################################################################################################


def callbfun(res):


    print("callback:")


#    ttm = make_marry_text(res[0]['$x'],res[0]['$v'],res[0]['$a'])
    ttm = make_marry_text(res[0]['$x'],0.5,0.5)

    #print(ttm)


    make_audio(ttm)


    print("\n waiting...")



subscribe(myID, {"TAG":"ENLP_EMOTIVE_ANSWER","text": "$x","valence": "$v","arousal": "$a"}, callbfun)

#subscribe(myID, {"TAG":"AV_IN_TRANSC_EMOTION","text": "$x","valence": "$v","arousal": "$a"}, callbfun)

print("\n waiting...")
