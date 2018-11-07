# ELFVisionModule
ELF Agent Vision Module

*This project is currently under heavy development. Come back often to see what's new.*

## Highlights

APIs integration with:
- *Azure Face*
- *Skybiometrics*
- *Face++*

that provides the following features:
- Face detection and recognition
- Emotion detection
- Age, gender dstimation

and an Offline neural-network-based model to perform:
- face recognition (not implemented yet)
- face detection
- scene understanding (not implemented yet)
- object tracking (not implemented yet)

## Usage

### Download/Installation

Using pip:
```
pip install -r requirements.txt
```
and run:
```
python StreamWebCam.py
```

## Important

- To use it you have to get API_KEY and API_SECRET for at least one of the services listed before.
- set virtual enviroments variables according to the service you want to use

*Variable Enviroment names*

AZURE:
- AZURE_FACE
- AZURE_VISION

SKYBIOMETRICS:
- SKYB_KEY
- SKYB_SECRET

FACE++:
- FACEpp_KEY
- FACEpp_SECRET

