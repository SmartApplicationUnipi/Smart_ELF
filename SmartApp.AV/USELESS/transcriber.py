import io
import speech_recognition as sr


def google_transc(audio):

	r = sr.Recognizer()
	text_transcribed = r.recognize_google(audio,language = "en-US")
	try:
	    print("\n\nGoogle Speech Recognition thinks you said --->: " + text_transcribed +"\n")
	    return text_transcribed

	except sr.UnknownValueError:
	    print("Google Speech Recognition could not understand audio")
	except sr.RequestError as e:
	    print("Could not request results from Google Speech Recognition service; {0}".format(e))

	return None



def sphinx_transc(audio):

	r = sr.Recognizer()
	text_transcribed = r.recognize_sphinx(audio, "en-US")
	try:
	    print("\n\nGoogle Speech Recognition thinks you said --->: " + text_transcribed +"\n")
	    return text_transcribed

	except sr.UnknownValueError:
	    print("Google Speech Recognition could not understand audio")
	except sr.RequestError as e:
	    print("Could not request results from Google Speech Recognition service; {0}".format(e))

	return None
