using Emgu.CV;
using Emgu.CV.CvEnum;
using Emgu.CV.Structure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NLog.Extensions.Logging;
using SmartApp.HAL.Implementation;
using SmartApp.HAL.Services;
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using System.IO;


namespace SmartApp.HAL.Implementation
{
    internal class VideoManager : IVideoManager
    {
        private readonly IVideoSource _source;
        private readonly ILogger<VideoManager> _logger;

        public VideoManager(IVideoSource source, ILogger<VideoManager> logger)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public void Start()
        {
            var streamPort = new BufferedPortImageRgb();
            var facesPort = new BufferedPortBottle();
            var videoFrameRgbBuffer = new Image<Rgb, byte>(640, 480);
           
            
            // Stream the video frames to a yarp port
            streamPort.open("/camera/stream");
            facesPort.open("/camera/faces");

            _source.FrameReady += (_, frame) =>
            {
                // Convert the incoming image which is BGR to RGB
                var bits = frame.Image.LockBits(new Rectangle(0, 0, frame.Image.Width, frame.Image.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
                using (var videoFrameBgr = new Image<Bgr, byte>(frame.Image.Width, frame.Image.Height, bits.Stride, bits.Scan0))
                    CvInvoke.CvtColor(videoFrameBgr, videoFrameRgbBuffer, ColorConversion.Bgr2Rgb);
                frame.Image.UnlockBits(bits);


                // Sending new the new frame to "/camera/stream"
                using (var streamMsg = streamPort.prepare())
                {
                    // Send the RGB image over yarp
                    var handle = GCHandle.Alloc(videoFrameRgbBuffer.Bytes, GCHandleType.Pinned);
                    streamMsg.setExternal(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), (uint)frame.Image.Width, (uint)frame.Image.Height);
                    streamPort.write();
                    streamPort.waitForWrite();
                    handle.Free();
                }


                // Sending array of faces to "/camera/faces"
                using (var bottle = facesPort.prepare())
                {
                    bottle.clear();
                    bottle.add(Value.makeInt64(new DateTimeOffset(frame.Timestamp).ToUnixTimeSeconds()));
                    bottle.add(Value.makeInt(frame.Faces.Count));

                    foreach (var face in frame.Faces)
                    {
                        var clonedFace = (System.Drawing.Image)frame.Image.Clone(face.Bounds, System.Drawing.Imaging.PixelFormat.Format24bppRgb);
                        var ms = new MemoryStream();
                        clonedFace.Save(ms, System.Drawing.Imaging.ImageFormat.Png);
                        var bytes = ms.ToArray();

                        var handle = GCHandle.Alloc(bytes, GCHandleType.Pinned);

                        bottle.add(Value.makeInt(face.Bounds.Width));
                        bottle.add(Value.makeInt(face.Bounds.Height));
                        bottle.add(Value.makeBlob(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), bytes.Length));
                    }

                    facesPort.write();
                    facesPort.waitForWrite();
                }
            };
        }
    }
}
