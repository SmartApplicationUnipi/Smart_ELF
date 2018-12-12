import asyncio
import json
import websockets
import time
import base64
from multiprocessing import Queue

HOST = '10.101.21.184'  # Standard loopback interface address (localhost)
PORT = 65432        # Port to listen on (non-privileged ports are > 1023)

queue = Queue()

async def echo(websocket, path): # quando si connette qualcuno allora parte questa funzione
    while True:
        data = queue.get()

        await websocket.send(json.dumps({"audio": base64.b64encode(data.audio).decode('ascii'),
                                        "id": data.timestamp,
                                        "emotion": data.emotion,
                                        "text": data.text}))


def loop():
    asyncio.get_event_loop().run_until_complete(websockets.serve(echo, HOST, PORT))
    asyncio.get_event_loop().run_forever()

