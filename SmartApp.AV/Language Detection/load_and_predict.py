from keras.models import load_model
import PIL.Image as Image
import numpy as np
import wav_to_lang



def identify_language(audio_file, model):

    ### CREATE THE SPECTOGRAM ###
    width = 858
    im = Image.open(wav_to_lang.wav_to_spectro(audio_file))
    im = im.transform((width, im.height), Image.EXTENT, (0, 0, width, im.height))
    data = np.transpose(np.array(im).astype(np.float32) / 256.0)
    data = data.reshape(1, data.shape[0], data.shape[1], 1)


    prediction = model.predict(data)

    return 'it' if int(round(prediction[0][0])) == 1 else 'en'

my_model = load_model("my_model_augm_250.h5")

lang = identify_language('male.wav', my_model)
print(lang)