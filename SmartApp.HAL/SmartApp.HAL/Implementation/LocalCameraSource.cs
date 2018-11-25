using Microsoft.Extensions.Logging;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.Reactive.Subjects;
using System.Text;
using Emgu.CV;
using Emgu.CV.CvEnum;
using System.Drawing;
using System.Linq;
using Emgu.CV.Structure;
using System.Timers;

namespace SmartApp.HAL.Implementation
{
    /// <summary>
    /// Uses the local camera as a video source.
    /// Face detection is performed using OpenCV.
    /// </summary>
    internal class LocalCameraSource : IVideoSource
    {
        private readonly ILogger<LocalCameraSource> _logger;
        private readonly Timer _timer;
        private float _framerate = 10; // fps
        private readonly int _frameWidth = 640;
        private readonly int _frameHeigth = 480;

        private readonly VideoCapture _capture = new VideoCapture();
        private readonly CascadeClassifier _faceDetector = new CascadeClassifier("OpenCV/haarcascade_frontalface_default.xml");

        public LocalCameraSource(ILogger<LocalCameraSource> logger)
        {
            _logger = logger;
            _logger.LogInformation("Local camera source loaded.");

            IsAvailable = true;

            // Starts the timer
            _timer = new Timer(1000.0 / _framerate) { AutoReset = true, Enabled = false };
            _timer.Elapsed += OnTimerTick;
        }

        private void OnTimerTick(object sender, EventArgs e)
        {
            using (UMat ugray = new UMat())
            using (Mat frame = _capture.QueryFrame())
            {
                if (frame == null)
                {
                    _logger.LogWarning("Frame not ready from camera. Maybe framerate is too high?");
                    return;
                }

                // Resize the frame
                CvInvoke.ResizeForFrame(frame, frame, new Size(_frameWidth, _frameHeigth), Inter.Cubic, scaleDownOnly: true);

                // Convert to grayscale
                CvInvoke.CvtColor(frame, ugray, ColorConversion.Bgr2Gray);

                // Normalizes brightness and increases contrast of the image
                CvInvoke.EqualizeHist(ugray, ugray);

                // Detect the faces from the gray scale image and store the locations as rectangles.
                // The first dimension is the channel,
                // The second dimension is the index of the rectangle in the specific channel                     
                var faceBounds = _faceDetector.DetectMultiScale(
                    ugray,
                    1.1,
                    10,
                    new Size(20, 20)
                );

                _logger.LogTrace("Got frame. Found {0} faces.", faceBounds.Length);

                // Publish a completed frame
                FrameReady?.Invoke(this, new VideoFrame(
                    DateTime.Now,
                    faceBounds.Select(bounds => new VideoFrame.Face(bounds,-1,-1,-1)).ToList(),
                    frame.ToImage<Bgr, byte>(),
                    _frameWidth,
                    _frameHeigth
                ));
            }
        }

        public event EventHandler<VideoFrame> FrameReady;

        public void Start()
        {
            _timer.Start();
            _logger.LogInformation("Capture started.");
        }

        public void Stop()
        {
            _timer.Stop();
            _logger.LogInformation("Capture stopped.");
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

        public bool IsAvailable{ get; set; }
        

        public void Dispose()
        {
            // Stop the capture and release all the resources
            Stop();
            _timer.Dispose();
            _capture.Dispose();
            _faceDetector.Dispose();
        }
    }
}
