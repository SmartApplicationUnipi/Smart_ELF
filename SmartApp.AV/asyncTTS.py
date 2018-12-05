from urllib.parse import urlencode # For URL creation
import httplib2
from lxml import etree
import asyncio
import websockets
import base64
import json
import sys
import janus
sys.path.insert(0, '../SmartApp.KB/bindings/python/')
import kb
from kb import KnowledgeBaseClient
import logging

def make_mary_text(text, valency, arousal):
    """
    This function creates the MaryXML representation of the speech related to the emotion
    :param text: string that represent the text that will be synthesized
    :param valency: valency of the emotion
    :param arousal: arousal of the emotion
    :return: XML-based representation of the speech with emotion
    """
    v = str(valency)
    a = str(arousal)

    #result="""<emotionml version="1.0" xmlns="http://www.w3.org/2009/10/emotionml" category-set="http://www.w3.org/TR/emotion-voc/xml#everyday-categories"><emotion dimension-set="http://www.w3.org/TR/emotion-voc/xml#pad-dimensions"> """ +text+""" <dimension name="arousal" value="0.1"/><!-- high arousal --><dimension name="pleasure" value="0.9"/><!-- negative valence --><dimension name="dominance" value="0.2"/><!-- low potency    --></emotion></emotionml>"""
    result="""<emotionml version="1.0" xmlns="http://www.w3.org/2009/10/emotionml" category-set="http://www.w3.org/TR/emotion-voc/xml#everyday-categories"><emotion dimension-set="http://www.w3.org/TR/emotion-voc/xml#pad-dimensions"> """ +text+""" <dimension name="arousal" value="0.1"/><!-- high arousal --><dimension name="pleasure" value="0.9"/><!-- negative valence --><dimension name="dominance" value="0.2"/><!-- low potency    --></emotion></emotionml>"""

    return result


def make_audio(txt, lang="en-GB"):
    """
    This function produces the audio from text using MaryTTS
    :param txt: text (or MaryXML representation of speech) to be synthetize
    :param lang: language of the text
    :return: wav audio
    """
    # Mary server informations
    mary_host = "localhost"
    mary_port = "59125"

    language_in="dfki-prudence"#TODO Improve with other models
    if lang == "it":
        language_in="istc-lucia-hsmm"
        lang = "it"

    # Build the query
    query_hash = {"INPUT_TEXT": txt,
                  "INPUT_TYPE": "EMOTIONML", # Input text
                  "LOCALE": lang,
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

        #  check if contain wav audio or not
        if resp["content-type"] == "audio/x-wav":
            good_response = True
            break

    if not good_response:
        log.error("MaryTTS didn't provide audio: " + str(content))

    return content


# TODO with arousal and valency
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


async def kb_to_audio(queue):
    """
    This function handles the subscription to KB and the production of the audio
    :param queue: blocking asynchronous queue
    """
    text = "Hello how are you?"
    valence = 1
    arousal = 1
    language = "en-GB"

    ttm = make_mary_text(text, valence, arousal)
    audio = make_audio(ttm, language)
    '''def callbfun(res):
        #TODO log
        print("callback: ", res)

        timestamp = res[0][0]["$ts"]
        text = res[0][0]['$input']
        valence = res[0][0]['$v']
        arousal = res[0][0]['$a']
        language = res[0][0]["$l"]

        ttm = make_mary_text(text, valence, arousal)
        audio = make_audio(ttm, language)

        queue.put({"id": timestamp,
                   "audio": base64.b64encode(audio).decode('ascii'),
                   "valence": valence,
                   "arousal": arousal,
                   "text": text,
                   "language": language})

        print("\n waiting...")

    kb_client = KnowledgeBaseClient(False)
    #kb_client.subscribe("AV_ID", {"_data": {"tag": 'AV_IN_TRANSC_EMOTION', "text": "$input"}}, callbfun) #todo change with appropriate tag
    kb_client.subscribe("AV_ID", {"_data": {"tag": "ENLP_EMOTIVE_ANSWER",
                                            "time_stamp": "$ts",
                                            "text": "$input",
                                            "valence": "$v",
                                            "arousal": "$a",
                                            "language": "$l"}}, callbfun) #todo change with appropriate tag'''


def face_communication(queue, log):
    """
    This function handles the communication with the face-client
    :param queue: blocking asynchronous queue
    :return:  WebSocketServer object
    """
    async def echo(websocket, path): # on client connections
        log.info("New connection " + str(websocket))
        while True:
            data = await queue.get()
            await websocket.send(json.dumps(data))
            log.info(str(websocket)+ " sent data:" + str(data["id"]))

    return websockets.serve(echo, HOST, PORT)


if __name__ == '__main__':
    HOST = '10.101.27.153'  # Standard loopback interface address (localhost)
    PORT = 65432  # Port to listen on (non-privileged ports are > 1023)

    log = logging.basicConfig(filename='TTS.log', filemode='w', format='%(name)s - %(levelname)s - %(message)s')
    log.info("Start TTS process")

    loop = asyncio.get_event_loop()
    q = janus.Queue(loop=loop)

    loop.run_until_complete(kb_to_audio(q.sync_q,log))
    #loop.run_until_complete(face_communication(q.async_q, log))
    loop.run_forever()
