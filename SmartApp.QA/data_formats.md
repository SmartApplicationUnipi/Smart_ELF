
##   Aule
```javascript
{
    "object": {
        "_data": {
            "source": "http://margot.di.unipi.it/test12/goa/2018/1/getfullroomlist",
            "tag": "crawler_room",
            "timestamp": 1543596093462,
            "type": "json",
            "data": {
                "name": "Fib A",
                "seats": "217",
                "location": "piano terra",
                "building": "Polo Fibonacci B",
                "features": "VHRA",
                "note": "",
                "owner": [
                    "Ateneo",
                    "Fisica",
                    ":Fisica",
                    "Informatica",
                    ":Informatica",
                    "Fibonacci"
                ],
                "guest": [],
                "class": {
                    "Ateneo": "0",
                    "Fisica": "1",
                    ":Fisica": "1",
                    "Informatica": "3",
                    ":Informatica": "3"
                }
            }
        },
        "_id": 3,
        "_meta": {
            "idSource": "id4",
            "tag": "crawler_room",
            "creationTime": "30/11/2018",
            "TTL": 1,
            "reliability": 100
        }
    },
    "binds": [
        {
            "$X": {
                "source": "http://margot.di.unipi.it/test12/goa/2018/1/getfullroomlist",
                "tag": "crawler_room",
                "timestamp": 1543596093462,
                "type": "json",
                "data": {
                    "name": "Fib A",
                    "seats": "217",
                    "location": "piano terra",
                    "building": "Polo Fibonacci B",
                    "features": "VHRA",
                    "note": "",
                    "owner": [
                        "Ateneo",
                        "Fisica",
                        ":Fisica",
                        "Informatica",
                        ":Informatica",
                        "Fibonacci"
                    ],
                    "guest": [],
                    "class": {
                        "Ateneo": "0",
                        "Fisica": "1",
                        ":Fisica": "1",
                        "Informatica": "3",
                        ":Informatica": "3"
                    }
                }
            }
        }
    ]
}
```

## Corsi
```javascript
{
    "object": {
        "_data": {
            "source": "http://margot.di.unipi.it/test12/goa/2018/1/getlectures",
            "tag": "crawler_course",
            "timestamp": 1543596094073,
            "type": "json",
            "data": {
                "id": "55609_u",
                "attf_id": "55609",
                "name": "Comunicazioni numeriche",
                "ownerid": "3169",
                "ownername": "IFO-L",
                "semester": "2",
                "partition": "Non partizionato",
                "teacher_id": "1007167",
                "teacher_name": "MARCO MARTORELLA",
                "cfu": "9",
                "users": {
                    "IFO-L": 0
                }
            }
        },
        "_id": 1758,
        "_meta": {
            "idSource": "id4",
            "tag": "crawler_course",
            "creationTime": "30/11/2018",
            "TTL": 1,
            "reliability": 100
        }
    },
    "binds": [
        {
            "$X": {
                "source": "http://margot.di.unipi.it/test12/goa/2018/1/getlectures",
                "tag": "crawler_course",
                "timestamp": 1543596094073,
                "type": "json",
                "data": {
                    "id": "55609_u",
                    "attf_id": "55609",
                    "name": "Comunicazioni numeriche",
                    "ownerid": "3169",
                    "ownername": "IFO-L",
                    "semester": "2",
                    "partition": "Non partizionato",
                    "teacher_id": "1007167",
                    "teacher_name": "MARCO MARTORELLA",
                    "cfu": "9",
                    "users": {
                        "IFO-L": 0
                    }
                }
            }
        }
    ]
}
```


## Teachers #############

```javascript
{
    "object": {
        "_data": {
            "source": "http://margot.di.unipi.it/test12/goa/2018/1/getallteachers",
            "tag": "crawler_teacher",
            "timestamp": 1543597424012,
            "type": "json",
            "data": "1377"
        },
        "_id": 5970,
        "_meta": {
            "idSource": "id10",
            "tag": "crawler_teacher",
            "creationTime": "30/11/2018",
            "TTL": 1,
            "reliability": 100
        }
    },
    "binds": []
}
```
