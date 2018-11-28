import spacy
import pprint
import en_core_web_sm
import it_core_news_sm


def create_dictionary (root):
	token = root

	obj = {}

	obj["0_text"] = token.text
	obj["1_norm"] = token.norm_
	obj["2_lemma"] = token.lemma_
	obj["3_POS" ] = token.pos_
	obj["4_tag"] = token.tag_
	obj["5_parent"] = token.head.text
	obj["6_dep"] = token.dep_
	obj["7_children"] = [create_dictionary(child) for child in token.children]

	return obj

def get_dependency_tree(sentence, language="en"):

	if (language == "it"):
		nlp = it_core_news_sm.load()
	else:
		nlp = en_core_web_sm.load()
	doc = nlp(sentence)

	global root
	for token in doc:
		if token.dep_ == "ROOT":
			root = token

	result = create_dictionary(root)
	return result


if __name__ == '__main__':

        pp = pprint.PrettyPrinter()
        ln = 'it'
        parsing = get_dependency_tree("Dov'è la lezione di Attardi?", ln)
        pp.pprint(parsing)
