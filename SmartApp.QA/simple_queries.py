"""
This file lists a certain number of query
queries are grouped by "topic"
lists are lists of tuple (ID,query)
associated to each query t

"""

"""queries with professor as last word"""
query_prof = [
    "Dove posso trovare la lezione del Professor",
    "Dov'è la lezione del Professor",
    "Dove fa lezione il Professor",
    "In che aula è la lezione del Professor",
    "Dimmi l'aula della lezione del Professor",
    "Dove devo andare per seguire la lezione del Professor",
    "A che ora inizia la lezione del Professor",
    "Sono in tempo per la lezione del Professor",
    "A che ora finisce la lezione del Professor",
    "Quando inizia la lezione del Professor",
    "Quando farà lezione il Professor",
    "Quando sarà la prossima lezione del professore",
    "A che ora fa lezione il professor",
    "In che giorno è la prossima lezione del professor",
    "In che giorno fa lezione il professor",
    "In che giorno ed a che ora è la prossima lezione del professor",
    "Qual è l’orario settimanale del professor",
    "Qual è l’orario settimanale delle lezioni del professor",
    "Quali sono le lezioni del professor",
    "In quale dipartimento fa ricevimento il professor",
    "Dove è il ricevimento del professor",
    "A che ora è il ricevimento del professor",
    "Quando è il ricevimento del professor",
    "In quale dipartimento è lo studio del professor",
    "Qual è lo studio del professor",
    "Qual è il numero dello studio del professor",
    "Dove è lo studio del professor",
    "Dove si trova la Lezione del Professor",
    ]

jsonq_room = '{"_predicates":[["containsString",["$teach","<prof-placeholder>"]]],{"_data":{"teach" : "$teach", "room" : "$x"}}}'
jsonq_room = '{"data":{"aula" : "$room", "descrizione" : "$course"}}'



query_prof_t = [
    (jsonq_room, "La lezione del professor <professor> è in <room>"),
    (jsonq_room, "La lezione del professor <professor> è in <room>"),
    (jsonq_room, "La lezione del professor <professor> è in <room>"),
    (jsonq_room, "Il <professor> fa lezione in <room>"),
    (jsonq_room, "Il <professor> fa lezione in <room>"),
    (jsonq_room, "Il <professor> fa lezione in <room>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> è alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> inizia alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La prossima lezione del professor <professor> è prevista per <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> è il giorno <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La prossima lezione del professor <professor> è prevista per <time> alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La prossima lezione del professor <professor> è prevista per <time> alle <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> ha lezione <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> ha lezione <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> insegna i corsi di <course>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve al dipartimento di <department>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve nel suo studio <location>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professore <professor> riceve alle <time> il giorno <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professore <professor> riceve alle <time> il giorno <time>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve al dipartimento di <department>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve al dipartimento di <department> stanza <room>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve al dipartimento di <department> stanza <room>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "Il professor <professor> riceve al dipartimento di <department>"),
    ({"_data":{"subject":"<professor>", "relation":"teach","object":"time"}}, "La lezione del professor <professor> è in <room>")
]

"""Queries with corso as last word"""
query_corso = [
'Quando sarà la prossima lezione del corso',
'A che ora è la prossima lezione del corso',
'In che giorno è la prossima lezione del corso',
'In che giorno ed a che ora è la prossima lezione del corso',
'Qual è  l’orario settimanale del corso',
'Qual è l’orario  settimanale delle lezioni del corso',
'Quando sono le lezioni del corso',
'Quando sarà la prossima lezione del corso di',
'A che ora è la prossima lezione del corso di',
'In che giorno è la prossima lezione del corso di',
'In che giorno ed a che ora è la prossima lezione del corso di',
'Qual è  l’orario settimanale del corso di',
'Qual è l’orario  settimanale delle lezioni del corso di ',
'Quando sono le lezioni del corso di ',
"A che ora è la lezione del corso",

]

query_corso_t = [
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>." ),
    ({}, "La prossima lezione del corso <corso> è alle ore <time>."),
    ({}, "La prossima lezione del corso <corso> è il <data>."),
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>."),
    ({}, "Non ho tempo per elencarti tutto l'orario della settimana, sono molto richiesto!"),
    ({}, "Non ho tempo per elencarti tutto l'orario della settimana, sono molto richiesto!"),
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>."),
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>." ),
    ({}, "La prossima lezione del corso <corso> è alle ore <time>."),
    ({}, "La prossima lezione del corso <corso> è il <data>."),
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>."),
    ({}, "Non ho tempo per elencarti tutto l'orario della settimana, sono molto richiesto!"),
    ({}, "Non ho tempo per elencarti tutto l'orario della settimana, sono molto richiesto!"),
    ({}, "La prossima lezione del corso <corso> si svolgerà il <data> alle <time>."),
    ({}, "La prossima lezione del corso <corso> è alle ore <time>."),

]

query_aule = [
"Dove sta l'aula",
"Come faccio a raggiungere l'aula",
"Che lezione c'è in aula"
]

query_aule_t = [
    ({}, "L'aula <aula> si trova qui: <mappa>"),
    ({}, "Per raggiungere l'aula <aula> devi andare qui: <mappa>"),
    ({}, "In aula <aula> c'è la lezione di <lezione>.")
]

query_cancellazione = [
"La lezione del professore C è stata cancellata",
"La lezione del corso Y è stata cancellata",
"La lezione del professore C del giorno D è stata cancellata",
"La lezione del corso Y del giorno D è stata cancellata",
"La lezione del professore C dell’ora Y è stata cancellata",
"La lezione del professore C del giorno D all’ora Y è stata cancellata"
]

query_cancellazione_t = [
    ({}, "<bool>"),
    ({}, "<bool>"),
    ({}, "<bool>"),
    ({}, "<bool>"),
    ({}, "<bool>"),
    ({}, "<bool>")
]
