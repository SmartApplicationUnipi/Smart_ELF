import os
import tensorflow as tf
### CONFIGURE GPU USAGE ###
config= tf.ConfigProto(device_count = {'GPU':1})
config.gpu_options.per_process_gpu_memory_fraction = 0.35
tf.logging.set_verbosity(tf.logging.ERROR)
os.environ["CUDA_DEVICE_ORDER"] = "PCI_BUS_ID"   # see issue #152
os.environ["CUDA_VISIBLE_DEVICES"] = "3"
from keras.backend.tensorflow_backend import set_session
set_session(tf.Session(config=config))
import random
import numpy as np
import PIL.Image as Image
from keras import Model
from keras import optimizers
from keras.layers import Input, Conv2D, MaxPool2D, Flatten, Dense, AvgPool2D, BatchNormalization, Dropout
from sklearn.metrics import accuracy_score
import numpy.random as rng


train_listfile = open("../train/training_enc_langs_augm.csv", "r")
raw_data_path = "/home/c4/Workspace/Spoken-language-identification/augmented/resized/"

# LOAD DATA
train_list_raw = train_listfile.readlines()
train_list_raw = np.array(train_list_raw)
print(train_list_raw[0:3])
print(train_list_raw[240:243])
tt = train_list_raw.reshape(20,240)
tt = tt.T
tt = tt.flatten()

tt=tt.reshape(-1,20)
rng.shuffle(tt)
tt = tt.flatten()

train_list_raw = tt[0:20*210]
test_list_raw = tt[0+20*210:]
train_listfile.close()

train_x = np.zeros((len(train_list_raw), 858, 256), dtype=np.float32)
train_y = []

test_x = np.zeros((len(test_list_raw), 858, 256), dtype=np.float32)
test_y = []

### SPECTOGRAMS TO ARRAY ###
for i in range(len(train_list_raw)):
    train_y.append(int(train_list_raw[i].split(',')[1]))
    name = train_list_raw[i].split(',')[0]
    path = raw_data_path + name + "png"
    im = Image.open(path)
    train_x[i] = np.transpose(np.array(im).astype(np.float32) / 256.0)

for i in range(len(test_list_raw)):
    test_y.append(int(test_list_raw[i].split(',')[1]))
    name = test_list_raw[i].split(',')[0]
    path = raw_data_path + name + "png"
    im = Image.open(path)
    test_x[i] = np.transpose(np.array(im).astype(np.float32) / 256.0)

train_x = train_x.reshape((len(train_x), 858, 256, 1))
train_y = np.array(train_y, dtype=np.int32)

test_x = test_x.reshape((len(test_x), 858, 256, 1))
test_y = np.array(test_y, dtype=np.int32)
print(test_list_raw)

### CREATE MODEL ###
input_layer = Input(shape=(858,256,1))
#conv_1 = Conv2D(filters=64, kernel_size=(3,3),strides=(1,1), activation='tanh')(input_layer)
#max_pool_1 = MaxPool2D(pool_size=(3,3))(conv_1)
#conv_2 = Conv2D(filters=16, kernel_size=(3,3),strides=(1,1), activation='tanh')(max_pool_1)
#max_pool_2 = MaxPool2D(pool_size=(3,3))(conv_2)
flat_1 = Flatten()(input_layer)#(max_pool_2)
#batch_norm_1 = BatchNormalization()(flat_1)
#dropout_1 = Dropout(0.5)(flat_1)#(batch_norm_1)
dense_1 = Dense(450, activation='relu')(flat_1)
#batch_norm_2 = BatchNormalization()(dense_1)
#dropout_2 = Dropout(0.5)(dense_1)
dense_2 = Dense(100, activation='relu')(dense_1)
#batch_norm_3 = BatchNormalization()(dense_2)
#dropout_3 = Dropout(0.5)(dense_2)
dense_3 = Dense(25, activation='tanh')(dense_2)
#batch_norm_4 = BatchNormalization()(dense_3)
#dropout_4 = Dropout(0.5)(dense_3)
dense_4 = Dense(5, activation='tanh')(dense_3)
out = Dense(1, activation='sigmoid')(dense_4)

model = Model(inputs=input_layer, outputs=out)
opt = optimizers.SGD(lr=1e-6, momentum=0.7)
model.compile(loss='binary_crossentropy', optimizer=opt, metrics=['accuracy'])
model.fit(x=train_x, y=train_y, batch_size=168, epochs=600, validation_data=(test_x, test_y))
model.save('my_model_augm_250.h5')

#prediction = model.predict(train_x)
#print(prediction)
#print(train_y)

#prediction = [round(x[0]) for x in prediction]
#print(prediction)
#print(accuracy_score(y_true=train_y, y_pred=prediction))
