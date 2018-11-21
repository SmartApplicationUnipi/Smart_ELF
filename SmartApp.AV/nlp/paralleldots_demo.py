# ENLP group
# Demo with parallel dots API 
# Andrea Cossu

import paralleldots

OK_CODE = 200 
threshold = 0.5 # like IBM Watson, discard weak results

print('Using paralleldots API')
key = input('Insert API key:')
paralleldots.set_api_key(key)

sentence = input('Write your sentence (write exit to quit):\n')
while sentence != 'exit':

    result = paralleldots.emotion(sentence)

    if result['code'] == OK_CODE: # if API did good
        winner_emotion = result['emotion']['emotion']

        if result['emotion']['probabilities'][winner_emotion] > threshold:
            print("You feel ", winner_emotion)
        else:
            print("You feel Neutral")

        print('Extended result: ', result['emotion']['probabilities'])

    else: # if there is some error
        print("Error code: ", result['code'], " on: ", sentence)

    sentence = input('Write your sentence:\n')


