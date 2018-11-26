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

        public KinectVideoSource(ILogger<KinectVideoSource> logger)
        {
            _logger = logger;
            _logger.LogInformation("Kinect video source loaded.");

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

            _framerate = 10f;
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

                                Joint head =_bodies[f].Joints[JointType.Head];
                          
                                var face = new VideoFrame.Face(
                                    new Rectangle(xCoord, yCoord, width, height),
                                    (long)_bodies[f].TrackingId,
                                    head.Position.Z,
                                    isSpeaking,
                                    faceResult.FaceProperties[FaceProperty.Engaged] == DetectionResult.Yes
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
