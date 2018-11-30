using Emgu.CV;
using Emgu.CV.Structure;
using Microsoft.Extensions.Logging;
using Microsoft.Kinect;
using Microsoft.Kinect.Face;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Timers;

namespace SmartApp.HAL.Implementation
{
    internal class KinectVideoSource : IVideoSource
    {
        private KinectSensor _kinect = null;
        private readonly ILogger<KinectVideoSource> _logger;
        private readonly IAudioSource _audioSource;
        //face detection
        private FaceFrameSource[] _faceFrameSources;
        private FaceFrameReader[] _faceFrameReaders;
        private FaceFrameResult[] _faceFrameResults;
        //bodies detected (needed for face tracking)
        private Body[] _bodies;
        //reader for body tracking
        private BodyFrameReader _bodyFrameReader = null;
        //reader polling the color camera
        private MultiSourceFrameReader _multiSourceFrameReader = null;

        private readonly Timer _timer;
        private float _framerate;

        private bool _isEngaged = false;
        private float _distanceEngaged = 2.5f; //meters within engaged accepted
        private float _timeEngaged = 0.5f; //seconds engaged
        private short _frameEngaged = 0; //number of frame from when start engagement
        private float _timeNotEngaged = 1.5f; //seconds to decide if not engaged
        private short _frameNotEngaged = 0;  //number of frame from when stop engagement

        private short _frameStopTalking = 0; //number of frame without talking


        public KinectVideoSource(ILogger<KinectVideoSource> logger, IAudioSource audioSource)
        {
            _logger = logger;
            _logger.LogInformation("Kinect video source loaded.");
            _audioSource = audioSource;

            _kinect = KinectSensor.GetDefault();
            //kinect availability callback
            _kinect.IsAvailableChanged += Sensor_IsAvailableChanged;
            //frame of color camera and bodies callback
            _multiSourceFrameReader = _kinect.OpenMultiSourceFrameReader(FrameSourceTypes.Color);
            
            //features needed of a face
            FaceFrameFeatures faceFrameFeatures = FaceFrameFeatures.BoundingBoxInColorSpace | FaceFrameFeatures.MouthMoved | FaceFrameFeatures.MouthOpen;
            //BodyCount == 6, we need arrays for detect up to 6 faces at time
            _faceFrameSources = new FaceFrameSource[_kinect.BodyFrameSource.BodyCount];
            _faceFrameReaders = new FaceFrameReader[_kinect.BodyFrameSource.BodyCount];
            _faceFrameResults = new FaceFrameResult[_kinect.BodyFrameSource.BodyCount];

            _bodies = new Body[_kinect.BodyFrameSource.BodyCount];
            _bodyFrameReader = _kinect.BodyFrameSource.OpenReader();
           

            for (int i = 0; i < _kinect.BodyFrameSource.BodyCount; i++)
            {
                _faceFrameSources[i] = new FaceFrameSource(_kinect, 0, faceFrameFeatures);
                _faceFrameReaders[i] = _faceFrameSources[i].OpenReader();
            }
            if (!_kinect.IsOpen)
            {
                _kinect.Open();
            }

            _framerate = 15f;
            _timer = new Timer(1000.0 / _framerate) { AutoReset = true, Enabled = false };
            _timer.Elapsed += OnTimerTick;
           
        }
        

        private void Sensor_IsAvailableChanged(object sender, IsAvailableChangedEventArgs e)
        {
            IsAvailable = _kinect.IsAvailable;
            _logger.LogInformation("Kinect available = {0}", IsAvailable);
        }

        //Callback for a face arrived
        private void Face_FrameArrived(object sender, FaceFrameArrivedEventArgs e)
        {
            using (FaceFrame faceFrame = e.FrameReference.AcquireFrame())
            {
                if (faceFrame != null)
                {
                    //index of the source of this face
                    int index = GetFaceSourceIndex(faceFrame.FaceFrameSource);
                    if (ValidateFaceBoundingBox(faceFrame.FaceFrameResult))
                    {
                        //store result of the frame
                        _faceFrameResults[index] = faceFrame.FaceFrameResult;
                    }
                    else
                    {
                        _faceFrameResults[index] = null;
                    }
                }
            }
        }
        //Checks if a face has a balid bounding box
        private bool ValidateFaceBoundingBox(FaceFrameResult faceFrameResult)
        {
            bool isFaceValid = faceFrameResult != null;
            if (isFaceValid)
            {
                RectI boundingBox = faceFrameResult.FaceBoundingBoxInColorSpace;
                if (boundingBox != null)
                {
                    isFaceValid = (boundingBox.Right - boundingBox.Left) > 0 &&
                    (boundingBox.Bottom - boundingBox.Top) > 0 &&
                    boundingBox.Right <= _kinect.ColorFrameSource.FrameDescription.Width &&
                    boundingBox.Bottom <= _kinect.ColorFrameSource.FrameDescription.Height;
                }
            }
            return isFaceValid;
        }

        //Get the index of the sources given a face frame arrived
        private int GetFaceSourceIndex(FaceFrameSource faceFrameSource)
        {
            int index = -1;
            for (int i = 0; i < 6; i++)
            {
                if (_faceFrameSources[i] == faceFrameSource)
                {
                    index = i;
                    break;
                }
            }
            return index;
        }

        //When the timer ticks the colorframe is polled and checked if there is a face
        private void OnTimerTick(object sender, ElapsedEventArgs e)
        {
            MultiSourceFrame multiSourceFrame = _multiSourceFrameReader.AcquireLatestFrame();
            if (multiSourceFrame != null) {
                using (ColorFrame colorFrame = multiSourceFrame.ColorFrameReference.AcquireFrame())
                {
                    if (colorFrame != null)
                    {
                        if (!_isEngaged)
                        {
                            NewEngagmentCheck(colorFrame);
                        }
                        else
                        {
                            StopEngagmentCheck(colorFrame);
                            if (_audioSource.IsRecording())
                            {
                                _logger.LogTrace("Check stop recording");
                                CheckStopRecording(colorFrame);
                            }
                            else
                            {
                                _logger.LogTrace("Check start recording");
                                CheckStartRecording(colorFrame);
                            }
                           
                           
                            //SendFaces(colorFrame);
                        }
                    }
                    else if(_isEngaged) //no color frame -> if engaged check not engagment
                    {
                        StopEngagmentCheck(null);
                    }
                }
            }
            else if(_isEngaged) //no frame -> if engaged check not engagment
            {
                StopEngagmentCheck(null);
            }
        }

        //check transition from not engaged to engaged
        private void NewEngagmentCheck(ColorFrame colorFrame)
        {
           EngageOnFrame(colorFrame);
            //when there frame with engagment for _timeEngaged time -> engage event
            if (_frameEngaged > _framerate * _timeEngaged)
            {
                _logger.LogTrace("User engaged");
                _isEngaged = true;
                if(!_audioSource.IsRecording()) _audioSource.Start();
                _frameStopTalking = 0;
                _frameNotEngaged = 0;
                _frameEngaged = 0;
            }
           
        }

        //check transition from engaged to not engaged
        private void StopEngagmentCheck(ColorFrame colorFrame)
        {
            EngageOnFrame(colorFrame);

            //when there frame without engagment for _timeNotEngaged time -> not engage event
            if (_frameNotEngaged > _framerate * _timeNotEngaged)
            {
                _logger.LogTrace("User not engaged");
                _isEngaged = false;
                if (_audioSource.IsRecording())
                {
                    _audioSource.Stop();
                }
                _frameNotEngaged = 0;
                _frameEngaged = 0;
            }

        }

        //check if in this frame there is someone engaged
        private void EngageOnFrame(ColorFrame colorFrame)
        {
            bool engage = false;
            if (colorFrame != null)
            {
                for (int f = 0; f < 6; f++)
                {
                    if (_faceFrameResults[f] != null)
                    {
                        FaceFrameResult face = _faceFrameResults[f];
                        bool eng = face.FaceProperties[FaceProperty.Engaged] == DetectionResult.Yes ||
                            face.FaceProperties[FaceProperty.Engaged] == DetectionResult.Maybe;
                        float dist = _bodies[f].Joints[JointType.Head].Position.Z;
                        engage = eng && dist < _distanceEngaged; //engage condition (eyes engaged and distance)
                        if (engage)
                        {
                            break;
                        }
                    }
                }
            }
            //count frame with engage and not engage condition, 5 consecutive frames of a kind nullify the other
            if (engage)
            {
                _frameEngaged++;
                _frameNotEngaged = _frameEngaged > 5 ? (short)0 : _frameNotEngaged;
            }
            else
            {
                _frameNotEngaged++;
                _frameEngaged = _frameNotEngaged > 5 ? (short)0 : _frameEngaged;
            }
            
        }
        
        //send faces found in a frame
        private void SendFaces(ColorFrame colorFrame)
        {
            FrameDescription colorFrameDescription = _kinect.ColorFrameSource.FrameDescription;
            uint bytesPerpixel = 4;//colorFrameDescription.BytesPerPixel;
            byte[] allBytes = new byte[(uint)(colorFrameDescription.Width * colorFrameDescription.Height * bytesPerpixel)];
            colorFrame.CopyConvertedFrameDataToArray(allBytes, ColorImageFormat.Bgra);

            Mat frame = new Mat(colorFrameDescription.Height, colorFrameDescription.Width, Emgu.CV.CvEnum.DepthType.Cv8U, (int)bytesPerpixel);
            colorFrame.CopyConvertedFrameDataToIntPtr(frame.DataPointer, (uint)(colorFrameDescription.Width * colorFrameDescription.Height * bytesPerpixel), ColorImageFormat.Bgra);

            List<VideoFrame.Face> faces = new List<VideoFrame.Face>();
            bool faceFound = false;
            for (int f = 0; f < 6; f++)
            {
                if (_faceFrameResults[f] != null)
                {
                    faceFound = true;
                    FaceFrameResult faceResult = _faceFrameResults[f];
                    //Return -1 if maybe
                    int isSpeaking = -1;
                    if (faceResult.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.Yes ||
                        faceResult.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.Yes)
                    {
                        isSpeaking = 1;
                    }
                    else if (faceResult.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.No ||
                        faceResult.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.No)
                    {
                        isSpeaking = 0;
                    }

                    RectI boundingBox = faceResult.FaceBoundingBoxInColorSpace;
                    int xCoord = boundingBox.Left;
                    int yCoord = boundingBox.Top;
                    int width = boundingBox.Right - boundingBox.Left;
                    int height = boundingBox.Bottom - boundingBox.Top;

                    Joint head = _bodies[f].Joints[JointType.Head];

                    var face = new VideoFrame.Face(
                        new Rectangle(xCoord, yCoord, width, height),
                        (long)_bodies[f].TrackingId,
                        head.Position.Z,
                        isSpeaking
                    );
                    faces.Add(face);
                }
            }
            if (faceFound)
            {
                _logger.LogTrace("Kinect: Got frame. Found {0} faces.", faces.Count);

                FrameReady?.Invoke(this, new VideoFrame(
                    DateTime.Now,
                    faces.ToList(),
                    frame.ToImage<Bgr, byte>(),
                    colorFrame.FrameDescription.Width,
                    colorFrame.FrameDescription.Height
                ));
            }
            
        }

        //check if the recording has to be stopped
        private void CheckStopRecording(ColorFrame colorframe)
        {
            bool isTalking = false;
            for (int f = 0; f < 6; f++)
            {
                if (_faceFrameResults[f] != null)
                {
                    FaceFrameResult face = _faceFrameResults[f];
                    bool moved = face.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.Yes || face.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.Maybe;
                    bool open = face.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.Yes || face.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.Maybe;
                    isTalking = moved || open; //is talking condition = mouse moved or open (yes or maybe)
                    if (isTalking)
                    {
                        break;
                    }
                }
            }
            if (!isTalking)
            {
                _frameStopTalking++;
            }
            else
            {
                _frameStopTalking = 0;
            }

            //if for for half of the frame rate nobody is talking -> stop recording
            if (_frameStopTalking > _framerate / 2f)
            {
                if (_audioSource.IsRecording())
                {
                    _audioSource.Stop();
                }
            }

        }

        //check if someone is talking
        private void CheckStartRecording(ColorFrame colorframe)
        {
            bool isTalking = false;
            for (int f = 0; f < 6; f++)
            {
                if (_faceFrameResults[f] != null)
                {
                    FaceFrameResult face = _faceFrameResults[f];
                    bool moved = face.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.Yes || face.FaceProperties[FaceProperty.MouthMoved] == DetectionResult.Maybe;
                    bool open = face.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.Yes || face.FaceProperties[FaceProperty.MouthOpen] == DetectionResult.Maybe;
                    isTalking = moved || open; //is talking condition = mouse moved and open (yes or maybe)
                    if (isTalking)
                    {
                        break;
                    }
                }
            }
            if (isTalking) //start to record now
            {
                if (!_audioSource.IsRecording())
                {
                    _audioSource.Start();
                }
            }
         
        }

        //Needed for tracking also faces
        private void Body_FrameArrived(object sender, BodyFrameArrivedEventArgs e)
        {
            using (BodyFrame bodyFrame = e.FrameReference.AcquireFrame())
            {
                if (bodyFrame != null)
                {
                    //If it is a body frame
                    for (int i = 0; i < 6; i++)
                    {
                        bodyFrame.GetAndRefreshBodyData(_bodies);
                        if (!_faceFrameSources[i].IsTrackingIdValid)
                        {
                            if (_bodies[i].IsTracked)
                            {
                                _faceFrameSources[i].TrackingId = _bodies[i].TrackingId;
                            }
                        }
                    }
                }
            }
        }

        

        public float Framerate
        {
            get
            {
                lock (this)
                {
                    return _framerate;
                }
            }
            set
            {
                lock (this)
                {
                    _framerate = value;
                    _timer.Interval = 1000.0 / value;
                    _logger.LogInformation("New framerate: {0} fps.", value);
                }
            }
        }

        public bool IsAvailable { get; private set; }

        public event EventHandler<VideoFrame> FrameReady;

        public void Dispose()
        {
            if (_kinect != null)
            {
                if (_kinect.IsOpen)
                {
                    _kinect.Close();
                }
                _kinect = null;
            }

            if (_multiSourceFrameReader != null)
            {
                _multiSourceFrameReader.Dispose();
                _multiSourceFrameReader = null;
            }

            if (_bodyFrameReader != null)
            {
                _bodyFrameReader.Dispose();
                _bodyFrameReader = null;
            }

            if (_faceFrameSources != null)
            {
                for (int i = 0; i < _faceFrameSources.Length; i++)
                {
                    if (_faceFrameSources[i] != null) _faceFrameSources[i].Dispose();
                }
            }
            if (_faceFrameReaders != null)
            {
                for (int i = 0; i < _faceFrameReaders.Length; i++)
                {
                    if (_faceFrameReaders[i] != null) _faceFrameReaders[i].Dispose();
                }
            }
        }

        public void Start()
        {
            if (_kinect != null)
            {
                _timer.Start();
                _bodyFrameReader.FrameArrived += Body_FrameArrived;
                for (int i = 0; i < 6; i++)
                {
                    _faceFrameReaders[i].FrameArrived += Face_FrameArrived;
                }
                    _logger.LogInformation("Kinect started.");
                
                
            }
        }

        public void Stop()
        {
            _timer.Stop();
            _bodyFrameReader.FrameArrived -= Body_FrameArrived;
            for (int i = 0; i < 6; i++)
            {
                _faceFrameReaders[i].FrameArrived -= Face_FrameArrived;
            }
            _logger.LogInformation("Kinect stopped.");


        }
    }
}
