from FERModelEnsemble import *
import pandas as pd
import numpy as np
from keras.models import Sequential, load_model
from keras.layers import Dense
from keras.utils import to_categorical


data = pd.read_csv('/home/carlo/Documents/UNIPI/MSc/SmartApp/fer2013/fer2013.csv')
print(data.head())

image_list = [np.fromstring(image, dtype=int, sep=' ').reshape((48,48)) for image in data['pixels']]
data['image'] = image_list

model = FERModelEnsemble()
raw_results_list = [model.predict_raw_results(image) for image in image_list]

x = np.array(raw_results_list)
y = to_categorical(data['emotion'].values)

keras_model = Sequential()
keras_model.add(Dense(units=7, activation='softmax', input_dim=27, name='dense_layer'))
keras_model.compile(loss='categorical_crossentropy', optimizer='rmsprop', metrics=['accuracy'])
history = keras_model.fit(x=x, y=y, batch_size=256, epochs=10, verbose=2, validation_split=0.2)

keras_model.save('ensemble_emotion.h5')

m = load_model('ensemble_emotion.h5')
print(m.predict(x[0]))
