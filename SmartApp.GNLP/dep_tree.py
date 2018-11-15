import spacy
import pprint
import en_core_web_sm

		
def create_dictionary (root):
	token = root
	
	obj = {}
	
	obj["0_TEXT"] = token.text
	obj["1_COARSE_POS" ] = token.pos_
	obj["2_FINE_POS"] = token.tag_
	obj["3_HEAD"] = token.head.text
	obj["4_DEP"] = token.dep_
	obj["5_NORM"] = token.norm_
	obj["6_LEMMA"] = token.lemma_
	
	obj["7_CHILDREN"] = [create_dictionary(child) for child in token.children]
	
	return obj

def get_dependency_tree(sentence):

	nlp = en_core_web_sm.load()
	doc = nlp(sentence)

	global root
	for token in doc:
		if token.dep_ == "ROOT":
			root = token
	
	result = create_dictionary(root)
	return result
	
	
if __name__ == '__main__':
	
	get_dependency_tree("At which time Prof Poloni has lecture?")
