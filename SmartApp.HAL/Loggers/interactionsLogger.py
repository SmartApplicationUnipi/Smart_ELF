from kb import KnowledgeBaseClient
import time as Time
import cv2
import subprocess
import os
import signal


running     = True
recording   = False
kbID        = "interactions-logger"
kbTag       = "USER_ENGAGED"




def onKbMessage (m) :
    global kbIf
    global kbTag

    # value : <bool>
    # interactionName : <string>
    m = kbIf.queryFact ({"_meta" : {"tag" : kbTag}})
    try :
        if (m["success"] == True) :
            engagedObject = m["details"][0]["object"]["_data"]
            print ("Incoming object : ", str(engagedObject))

            if (engagedObject["value"] == True) :
                startRecording (engagedObject["interactionName"])
            else :
                stopRecording ()

        else :
            print ("Some problems:     success is False!")

    except Exception as e:
        print ("New exception   ", e)




def commandString (_title) :
    return  'ffmpeg -f dshow -i video="Integrated Webcam":audio="Microfono (Realtek Audio)" ' + _title + '.mp4'




def startRecording (title) :
    global recording, recordProcess

    if (recording) :
        print ("Program is already recording!")
        return 

    print ("Start recording! File name: ", title)
    
    log             = open(os.devnull, 'a')
    recordProcess   = subprocess.Popen(commandString(title), stdout=log, stderr=log, shell=False)
    recording       = True




def stopRecording () :
    global recording, threadProcess

    if (not recording) :
        print ("Program is not recording!")
        return 

    print ("Stop recording")

    recording   = False
    recordProcess.send_signal (signal.CTRL_C_EVENT)




if __name__ == '__main__':
    
    kbIf    = KnowledgeBaseClient(True)
    print(kbIf.subscribe (kbID, {"_meta" : {"tag" : kbTag}}, onKbMessage))


    while running :
        try :
            c = input ()

            if (c == 'start') :
                startRecording ("hello")
            
            elif (c == 'stop') :
                stopRecording ()
            
            elif (c == 'quit') :
                stopRecording ()
                running = False

            else :
                print ('\n****************\nUnknown command!\n****************\n\n')
        
        except KeyboardInterrupt:
            print ("Retry!")
    
