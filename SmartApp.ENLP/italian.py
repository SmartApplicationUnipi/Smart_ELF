from watson_developer_cloud import LanguageTranslatorV3, WatsonApiException
import json

def watson_authentication():
    """
    authentication in watson
    :return key for connection to translation service
    """
    language_translator = LanguageTranslatorV3(
        version='2018-05-01',
        iam_apikey='H4SJmexLmWXBCbG-eY9OBzZSlMvjHpAwae67p_iUfRQ1',
        url='https://gateway-fra.watsonplatform.net/language-translator/api'
    )
    return language_translator


def tranlsate (text,language_translator):
    """
    ask watson for rtranslation
    :return sentence translate
    """
    try:
        translation = language_translator.translate( text=text,model_id='en-it').get_result()
        return (json.dumps(translation, indent=2, ensure_ascii=False))
    except WatsonApiException as ex:
        #print excaption
        print ("Method failed with status code " + str(ex.code) + ": " + ex.message)


def main():
    auth = authentication()

    text = "Over the last few years many companies have elected to transfer production to Eastern European countries. For instance, Fiat is now manufacturing its Panda model exclusively in Poland. It did’t use to be like this in the past."
    tr = tranlsate(text,auth)
    print (tr)

    text = "The data published by the government show that the number of young people enrolling at university has fallen. Last year 50 thousand young people fewer than the previous year enrolled."
    tr = tranlsate(text,auth)
    print (tr)

if __name__ == '__main__':
    main()