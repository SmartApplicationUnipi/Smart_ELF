import asyncio
import websockets

HOST = '10.101.2.106'  # Standard loopback interface address (localhost)
PORT = 65432        # Port to listen on (non-privileged ports are > 1023)

async def echo(websocket, path):
    with open('Trump.wav', 'rb') as wave_file:
        data = wave_file.read(1024)
        while data:
            print(data)
            await websocket.send(data)
            data = wave_file.read(1024)
        print("sss")


asyncio.get_event_loop().run_until_complete(
    websockets.serve(echo, HOST, PORT))
asyncio.get_event_loop().run_forever()
