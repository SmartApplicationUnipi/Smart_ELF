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

namespace SmartApp.HAL.Implementation
{
    /// <summary>
    /// Uses the local camera as a video source.
    /// Face detection is performed using OpenCV.
    /// </summary>
    internal class LocalCameraSource : IVideoSource
    {
        private readonly ILogger<LocalCameraSource> _logger;

        private readonly VideoCapture _capture = new VideoCapture();
        private readonly CascadeClassifier _faceDetector = new CascadeClassifier("OpenCV/haarcascade_frontalface_default.xml");

        public LocalCameraSource(ILogger<LocalCameraSource> logger)
        {
            _logger = logger;
            _logger.LogInformation("Local camera source loaded.");

            // Starts the video capture
            _capture.ImageGrabbed += OnFrameGrabbed;
        }

        private void OnFrameGrabbed(object sender, EventArgs e)
        {
            using (UMat ugray = new UMat())
            using (Mat _frame = new Mat())
            {
                // Retrive the frame from the camera
                _capture.Retrieve(_frame);

                // Convert to grayscale
                CvInvoke.CvtColor(_frame, ugray, ColorConversion.Bgr2Gray);

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
                    faceBounds.Select(bounds => new Face(bounds)).ToList(),
                    _frame.Bitmap
                ));
            }
        }

        public event EventHandler<VideoFrame> FrameReady;

        public void Start()
        {
            _capture.Start();
            _logger.LogInformation("Capture started.");
        }

        public void Stop()
        {
            _capture.Stop();
            _logger.LogInformation("Capture stopped.");
        }

        public void Dispose()
        {
            // Stop the capture and release all the resources
            Stop();
            _capture.Dispose();
            _faceDetector.Dispose();
        }
    }
}
