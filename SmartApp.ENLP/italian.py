from watson_developer_cloud import LanguageTranslatorV3, WatsonApiException

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


def translate (text,language_translator):
    """
    ask watson for rtranslation
    :return sentence translate
    """
    try:
        translation = language_translator.translate( text=text,model_id='it-en').get_result()
        return translation["translations"][0]["translation"]
    except WatsonApiException as ex:
        #print exception
        print ("Method failed with status code " + str(ex.code) + ": " + ex.message)
