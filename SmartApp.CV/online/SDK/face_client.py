import os
import cv2
import requests
from copy import deepcopy
try:
    import json
except ImportError:
    import simplejson as json


API_HOST = 'https://api-eu.faceplusplus.com/facepp/v3/'

"""
Facepp_Client
    implementation of the client for Face++ APIs.
    it provide interfaces all APIs documented in https://console.faceplusplus.com/documents/6329329
"""
class Facepp_Client():

    def __init__(self, api_key=None, api_secret=None, timeout_request = 1):

        api_key = os.getenv('FACEpp_KEY', None) if api_key==None else api_key
        api_secret = os.getenv('FACEpp_SECRET', None) if api_secret==None else api_secret

        if not api_key or not api_secret:
            raise AttributeError('Missing api_key or api_secret argument')

        self.api_key = api_key
        self.api_secret = api_secret

        self.url_params = { 'api_key': api_key, 'api_secret': api_secret}
        self.detect_params = {}

        self.timeout = timeout_request

    def _sendRequest(self, *args, **kwargs):
        kwargs.update({"timeout": self.timeout})
        jr = json.loads(requests.post(*args, **kwargs).text)
        err = jr.get("error_message")
        if err: raise ValueError(err)
        return jr

    def _validate_str(var, name, illegals_char = "^@,&=*\'\""):
        if isinstance(var, str):
            if any(s in var for s in list(illegals_char)):
                raise AttributeError(name + " cannot contain any of this " + " ".join(illegals_char) + ".")
            return {name: var}
        else:
            raise AttributeError(name + " must be a string. You provided a " + type(var).__name__ + " instead.")

    def _validate_FaceSet_Identifier(outer_id, faceset_token):
        params = {}

        if outer_id is None and faceset_token is None:
            raise AttributeError('You must define a unique outer_id or faceset_token.')
        if outer_id and faceset_token:
            raise AttributeError('You must define only one between outer_id and faceset_token.')

        if outer_id is not None:
            params.update(Facepp_Client._validate_str(outer_id, "outer_id"))
        if faceset_token is not None:
            params.update(Facepp_Client._validate_str(faceset_token, "faceset_token"))

        return params

    """
    -----------------------API to manage Detect---------------------------------
    """
    def setParamsDetect(self, return_landmark = 0, return_attributes = "gender,age,smiling,emotion", calculate_all = None, face_rectangle = None):
        """
            Set attribute to be returned in the response for next detect requests.
            For a complete list of attributes and returned json see detect() docs
            or official doc https://console.faceplusplus.com/documents/5679127.

            Params:
                Like detect() see there.

            Return:
                Like detect() see there.
        """
        _all = "gender,age,smiling,headpose,facequality,blur,eyestatus,emotion,ethnicity,beauty,mouthstatus,eyegaze,skinstatus"

        if not isinstance(return_landmark, int) or return_landmark < 0 or return_landmark > 2:
            raise AttributeError("return_landmark must be an int between 0 and 2. See docs for meaning of value.")
        else: self.detect_params.update({"return_landmark": return_landmark})

        if not isinstance(return_attributes, str):
            if all([isinstance(ele, str) for ele in return_attributes]):
                self.detect_params.update({"return_attributes": ",".join(return_attributes)})
            else:
                raise TypeError("return_attributes should be a str.")
        else: self.detect_params.update({"return_attributes": _all if return_attributes.lower() == "all" else return_attributes })

        if calculate_all:
            if not isinstance(calculate_all, int) or not calculate_all in range(2):
                raise AttributeError("calculate_all must be an int between 0 and 1. See docs for meaning of value.")
            else:
                self.detect_params.update({"calculate_all": calculate_all})

        if face_rectangle:
            if not isinstance(face_rectangle, str):
                raise TypeError("face_rectangle should be a str.")
            else:
                self.detect_params.update({"face_rectangle": face_rectangle})

    def detect(self, frame = None, file = None, return_landmark = 0, return_attributes = "gender,age,smiling,emotion", calculate_all = 0, face_rectangle = None):
        """
            Detect and analyze human faces within the image that you provided.

            Detect API can detect all the faces within the image. Each detected
            face gets its face_token, which can be used in follow-up analysis
            and operations. With a Standard API Key, you can specify a rectangle
            area within the image to perform face detection.

            Detect API can analyze detected faces directly, providing face
            landmarks and attributes information. With a Free API Key, only the
            5 largest faces by its bounding box size can be analyzed, while you
            can use Face Analyze API to analyze the rest faces. With a Standard
            API Key, you can analyze all the detected faces.

            Official docs: https://console.faceplusplus.com/documents/5679127

            Image Details:
                - Format : JPG (JPEG), PNG
                - Size : between 48*48 and 4096*4096 (pixels)
                - File size : no larger than 2MB
                - Minimal size of face: the bounding box of a detected face is a
                    square. The minimal side length of a square should be no less
                    than 1/48 of the short side of image, and no less than 48
                    pixels. For example if the size of image is 4096 * 3200px,
                    the minimal size of face should be 66 * 66px.

            Params:
                frame(numpy.ndarray): matrix-like object representing a frame.
                    frame or file must be setted.

                file(file or buffer or str): file object, file descriptor or
                    filepath of the image. file or frame must be setted.

                [return_landmark] (int): Whether or not detect and return key
                    points of facial features and contour.
                    Valid values are:
                        - 2: detect and return 106-point landmarks
                        - 1: detect and return 83-point landmarks
                        - 0: do not detect (default value)

                [return_attributes] (str or list): String comma-seperated without
                    any requirement on sequence of attributes you need should be
                    detect. List of attribute that you wold detect in a face.
                    Valid values are:
                        - gender
                        - age
                        - smiling
                        - headpose
                        - facequality
                        - blur
                        - eyestatus
                        - emotion
                        - ethnicity
                        - beauty
                        - mouthstatus
                        - eyegaze
                        - skinstatus
                    Default value is "gender,age,smiling,emotion"

                [calculate_all] (int): Analyze and return attributes and
                    landmarks or not all the detected faces. If not used, only
                    the 5 largest faces by its bounding box size will be
                    analyzed.
                    Valid values are:
                        - 1: yes (default)
                        - 0: no
                    Available only with a Standard API Key.

                [face_rectangle] (str): A rectangle to perform face detection.
                    Is a sub rectangle of image where is performed dectection.
                    Must be a string comma-separated of four integers,
                    indicating respettively:
                        - Y-coordinate of upper left corner (top)
                        - X-coordinate of upper left corner (left)
                        - width of the rectangle frame (width)
                        - height of the rectangle frame (height).
                    Such as "70,80,100,100".
                    Available only with a Standard API Key.

            Return:
                json object thus structured:
                {
                    "request_id" (str): Unique id of each request,
                    "faces" (list): Array of detected faces thus structured:
                        {
                            "face_token" (str):
                            "face_rectangle" (obj): A rectangle area of position
                                of face in image. The following are all int.
                                {
                                    "top"：Y-coordinate of upper left corner
                                    "left"：X-coordinate of upper left corner
                                    "width"：The width of the rectangle frame
                                    "height"：The height of the rectangle frame
                                }
                            "landmark" (obj): all position of landmark see
                                for 83 landmark
                                https://console.faceplusplus.com/documents/6329308
                                for 106 landmark
                                https://console.faceplusplus.com/documents/13207488
                            "attributes" (obj): see offcial doc for property of
                                all attribute.
                        }
                    "image_id" (str): Unique id of an image,
                    "time_used" (int): Time that the whole request takes, millis
                    ["error_message"] (list):  Error message if there is.
                }
        """
        url = API_HOST + 'detect'
        params = deepcopy(self.url_params)

        if frame is None and not file:
                raise AttributeError("Missing frame or file argument. At least one must be set.")

        self.setParamsDetect(return_landmark, return_attributes, calculate_all, face_rectangle)
        params.update(self.detect_params)

        if frame is not None:
            data = cv2.imencode('.jpg', frame)[1]

        if file is not None:
            if isinstance(file, str):
                data = open(file, 'rb')
            else:
                data = file

        return self._sendRequest(url, params = params, files = {'image_file': data})

    """
    -----------------------API to manage Seach----------------------------------
    """
    def search(self, face_token = None, frame = None, file = None, image_url = None, faceset_token = None, outer_id = None, return_result_count = 1):
        """
            search a face in the faceset
            for a complete list of attributes and returned json see: https://console.faceplusplus.com/documents/5679127

            params:
                face_token: The id of the face to be searched. (Highest precedence)
                frame: matrix-like object representing a single frame
                file: file object, file descriptor or filepath of the image
                image_url: URL of the image containing the face to be searched.
                faceset_token: The id of Faceset.
                outer_id: User-defined id of Faceset.
                return_result_count: The number of returned results that have highest confidence score, between [1,5]. The default value is 1.

            return:
                json object
        """
        url = API_HOST + "search"
        params = deepcopy(self.url_params)
        data = None

        if face_token is None and frame is None and file is None and image_url is None:
            raise AttributeError('Missing face_token or frame or file or image_url argument. At least one must be set.')

        if face_token is not None:
            if isinstance(face_token, str):
                params.update({'face_token': face_token})
            else:
                raise AttributeError("face_token must be a string. You provided a " + type(face_token).__name__ + " instead.")
        if image_url is not None:
            if isinstance(image_url, str):
                params.update({'image_url': image_url})
            else:
                raise AttributeError("face_token must be a string.  You provided a " + type(image_url).__name__ + " instead.")
        if file is not None:
            if isinstance(file, str):
                data = open(file, 'rb')
            else:
                data = file

            data = {'image_file': data}

        if frame is not None:
            data = {'image_file': cv2.imencode('.jpg', frame)[1]}

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if return_result_count <= 0 or return_result_count > 5:
            raise AttributeError('return_result_count can be between [1,5]. The default value is 1.')
        else:
            params.update({'return_result_count': return_result_count})

        return self._sendRequest(url, params = params, files = data)

    """
    -----------------------API to manage Face-----------------------------------
    """
    def setUserID(self, face_token, faceset_token = None, user_id = None):
        """
            Set user_id for a detected face. user_id can be returned in Search results to determine the identity of user.
            for a complete list of attributes and returned json see: https://console.faceplusplus.com/documents/5679127

            params:
                face_token: The id of the face to be searched. (Highest precedence)
                faceset_token: The id of Faceset.
                outer_id: User-defined id of Faceset.
            return:
                json object
        """
        url = API_HOST + "faceset/setuserid"
        params = deepcopy(self.url_params)

        if not face_token and not faceset_token and not user_id:
            raise AttributeError('You must define all the params')

        if isinstance(face_token, str):
            params.update({'face_token': face_token})
        else:
            raise AttributeError('face_token should be a str. You provided a ' + type(face_token).__name__ + 'instead.')

        if isinstance(faceset_token, str):
            params.update({'faceset_token': faceset_token})
        else:
            raise AttributeError('faceset_token should be a str. You provided a ' + type(faceset_token).__name__ + 'instead.')

        if isinstance(user_id, str):
            params.update({'user_id': user_id})
        else:
            raise AttributeError('user_id should be a str. You provided a ' + type(user_id).__name__ + 'instead.')

        return self._sendRequest(url, params = params)

    """
    --------------------API to manage Facesets---------------------------------
    """

    def getFaceSets(self, tags = None, start = 1):
        """
        Get all the FaceSet.
        Get the list of FaceSet under an API Key, as well as information such as faceset_token, outer_id, display_name, and tags.
        https://console.faceplusplus.com/documents/5679127

        params:
            tags: Tags of the FaceSet to be searched, comma-seperated
            start: An integer, indicating the sequence number of the faceset_token under   this API Key. All the faceset_token returned in this request will start from this faceset_token. faceset_token is sorted by its creation time. Each request returns 1000 faceset_token at the most.

        Default value: 1.
                return:
                    json object
        """

        url = API_HOST + 'faceset/getfacesets'
        params = deepcopy(self.url_params)

        if isinstance(tags, str):
            params.update({'tags': tags})
        elif not tags is None:
            raise AttributeError('tags should be a str. You provided a ' + type(tags).__name__ + ' instead.')

        if not isinstance(start, int):
            raise AttributeError('start should be a int. You provided a ' + type(start).__name__ + ' instead.')
        elif start < 1:
            raise AttributeError('start must be at least one.')
        else:
            params.update({'start': start})

        return self._sendRequest(url, params = params)

    def deleteFaceSet(self, outer_id = None, faceset_token = None, check_empty = 0):
        """
        Delete a FaceSet
        https://console.faceplusplus.com/documents/5679127

        params:
            faceset_token: The id of Faceset.
            outer_id: User-defined id of Faceset.
            check_empty: Check if the FaceSet contains face_token when deleting.
                            0: do not check
                            1: check
                            The default value is 1.

            If the value is 1, when the FaceSet contains face_token, it cannot be deleted.
        return:
            json object
        """
        url = API_HOST + 'faceset/delete'
        params = deepcopy(self.url_params)

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if not isinstance(check_empty, int):
            raise AttributeError('check_empty should be a int. You provided a ' + type(check_empty).__name__ + ' instead.')
        elif check_empty < 0 or check_empty > 1:
            raise AttributeError('check_empty must be 0 or 1 .')
        else:
            params.update({'check_empty': check_empty})

        return self._sendRequest(url, params = params)

    def getFaceSetDetail(self, outer_id = None, faceset_token = None, start = 1):
        """
        Get details about a FaceSet, including information such as faceset_token, outer_id, display_name, as well as the number and list of face_token within this FaceSet.
        https://console.faceplusplus.com/documents/5679127

        params:
            faceset_token: The id of Faceset.
            outer_id: User-defined id of Faceset.
            start: An integer between  [1,10000], indicating the sequence number of the face_token in this FaceSet. All the face_token returned in this request will  start from this face_token. face_token is sorted by its creation time. Each request returns 100 face_token at the most.
            Default value: 1
            You can pass the value of `next `parameter in last request, to get the next 100 face_token.
        return:
            json object
        """

        url = API_HOST + 'faceset/getdetail'
        params = deepcopy(self.url_params)

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if not isinstance(start, int):
            raise AttributeError('start should be a int. You provided a ' + type(start).__name__ + ' instead.')
        elif start < 1 or start > 10000:
            raise AttributeError('start must be between 1 and 10.000 .')
        else:
            params.update({'start': start})

        return self._sendRequest(url, params = params)

    def updateFaceSet(self, outer_id = None, faceset_token = None, new_outer_id = None, display_name = None, user_data = None, tags = None):
        """
        Update the attributes of a FaceSet.
        https://console.faceplusplus.com/documents/5679127

        params:
            faceset_token: The id of Faceset.
            outer_id: User-defined id of Faceset.
            new_outer_id: Custom unique id of Faceset under your account, used for managing FaceSet objects. No more than 255 characters, and must not contain characters ^@,&=*'"
            display_name: The name of FaceSet. No more than 256 characters, and must not contain characters ^@,&=*'"
            user_data: Custom user information. No larger than 16KB, and must not contain characters ^@,&=*'"
            tags: String consists of FaceSet custom tags, used for categorizing FaceSet, comma-seperated. No more than 255 characters, and must not contain characters ^@,&=*'"
        return:
            json object
        """

        url = API_HOST + 'faceset/update'
        params = deepcopy(self.url_params)

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if not new_outer_id and not display_name and not user_data and not tags:
            raise AttributeError('You must define at least one of the following params: new_outer_id, display_name, user_data, user_data')

        if new_outer_id is not None:
            params.update(Facepp_Client._validate_str(new_outer_id, "new_outer_id"))
        if display_name is not None:
            params.update(Facepp_Client._validate_str(display_name, "display_name"))
        if user_data is not None:
            params.update(Facepp_Client._validate_str(user_data, "user_data"))
        if tags is not None:
            params.update(Facepp_Client._validate_str(tags, "tags"))

        return self._sendRequest(url, params = params)

    def removeFace(self, face_tokens, outer_id = None, faceset_token = None):
        """
        Remove all or part of face_token within a FaceSet.
        https://console.faceplusplus.com/documents/5679127

        params:
            face_tokens: The face_token to be removed, comma-seperated. The number of face_token must not be larger than 1000.
                Note: if this string passed "RemoveAllFaceTokens", all the face_token within FaceSet will be removed.
                Return Values
            faceset_token: The id of Faceset.
            outer_id: User-defined id of Faceset.

        return:
            json object
        """

        url = API_HOST + "faceset/removeface"
        params = deepcopy(self.url_params)

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if face_tokens:
            if isinstance(face_tokens, list):
                if len(face_tokens) <= 1000:
                    params.update({'face_tokens': ",".join(face_tokens)})
                else:
                    raise AttributeError('face_tokens array must be length at most 1000.')
            elif isinstance(face_tokens, str):
                params.update({'face_tokens': face_tokens})
            else:
                raise AttributeError('face_tokens should be a string or a list of string. You provided a ' + type(face_tokens).__name__ + 'instead.')

        return self._sendRequest(url, params = params)

    def addFace(self, face_tokens, outer_id = None, faceset_token = None):
        """
        Add face_token into an existing FaceSet. One FaceSet can hold up to 1000 face_token.
        https://console.faceplusplus.com/documents/5679127

        params:
            face_tokens: One or more face_token, comma-seperated. The number of face_token must not be larger than 5.
            faceset_token: The id of Faceset.
            outer_id: User-defined id of Faceset.

        return:
            json object
        """

        url = API_HOST + "faceset/addface"
        params = deepcopy(self.url_params)

        params.update(Facepp_Client._validate_FaceSet_Identifier(outer_id, faceset_token))

        if face_tokens:
            if isinstance(face_tokens, list):
                if len(face_tokens) <= 5:
                    params.update({'face_tokens': ",".join(face_tokens)})
                else:
                    raise AttributeError('face_tokens array must be length at most 5.')
            elif isinstance(face_tokens, str):
                params.update({'face_tokens': face_tokens})
            else:
                raise AttributeError('face_tokens should be a string or a list of string. You provided a ' + type(face_tokens).__name__ + 'instead.')

        return self._sendRequest(url, params = params)

    def createFaceSet(self, display_name = None, outer_id = None, tags = None, face_tokens = None):
        """
        Create a face collection called FaceSet to store face_token. One FaceSet can hold up to 1,000 face_token.
        https://console.faceplusplus.com/documents/5679127

        params:
            face_tokens: One or more face_token, comma-seperated. The number of face_token must not be larger than 5.
            display_name: The name of FaceSet. No more than 256 characters, and must not contain characters ^@,&=*'"
            outer_id: User-defined id of Faceset.
            tags: String consists of FaceSet custom tags, used for categorizing FaceSet, comma-seperated. No more than 255 characters, and must not contain characters ^@,&=*'"

        return:
            json object
        """
        url = API_HOST + 'faceset/create'
        params = deepcopy(self.url_params)

        if outer_id is not None:
            params.update(Facepp_Client._validate_str(outer_id, "outer_id"))
        else:
            raise AttributeError("outer_id cannot be a None. Insert a value.")
        if tags is not None:
            if isinstance(tags, list):
                tags = ",".join(tags)
            params.update(Facepp_Client._validate_str(tags, "tags", illegals_char = "^@&=*\'\""))

        if display_name:
            params.update({'display_name': display_name})

        if face_tokens:
            if isinstance(face_tokens, list):
                if len(face_tokens) <= 5:
                    params.update({'face_tokens': ",".join(face_tokens)})
                else:
                    raise AttributeError('face_tokens array must be length at most 5.')
            elif isinstance(face_tokens, str):
                params.update({'face_tokens': face_tokens})
            else:
                raise AttributeError('face_tokens should be a string or a list of string. You provided a ' + type(face_tokens).__name__ + 'instead.')

        return self._sendRequest(url, params = params)
