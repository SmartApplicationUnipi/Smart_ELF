from urllib.parse import urlencode # For URL creation
import httplib2
from lxml import etree
import wave, sys, pyaudio

# Mary server informations
mary_host = "localhost"
mary_port = "59125"

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



filename=input("Write the file name [it_in/ en_in]:  ")
language_in=input("Write the langeuage in input [it/en]:  ")

if(language_in=="it"):
  language_in="istc-lucia-hsmm"
  language_text = "it"

else:
  language_in="dfki-prudence"
  language_text = "en-GB"



with open (filename, "r") as f:
    txt = f.read()

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
stream = p.open(format =
                p.get_format_from_width(wf.getsampwidth()),
                channels = wf.getnchannels(),
                rate = wf.getframerate(),
                output = True)
data = wf.readframes(chunk)
while data != '':
    stream.write(data)
    data = wf.readframes(chunk)