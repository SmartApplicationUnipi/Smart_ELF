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
using SmartApp.HAL.Model;
using Google.Protobuf;

namespace SmartApp.HAL.Implementation
{
    internal class VideoManager : IVideoManager
    {
        private readonly IVideoSource _source;
        private readonly INetwork _network;
        private readonly ILogger<VideoManager> _logger;

        public VideoManager(IVideoSource source, INetwork network, ILogger<VideoManager> logger)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _network = network ?? throw new ArgumentNullException(nameof(network));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public void Start()
        {
            _source.FrameReady += (_, frame) =>
            {
                // Exit immediately if we did not find any face
                if (frame.Faces.Count == 0)
                {
                    return;
                }

                var videoFrameRgbBuffer = new Image<Rgb, byte>(640, 480);

                // Convert the incoming image which is BGR to RGB
                var bits = frame.Image.LockBits(new Rectangle(0, 0, frame.Image.Width, frame.Image.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
                using (var videoFrameBgr = new Image<Bgr, byte>(frame.Image.Width, frame.Image.Height, bits.Stride, bits.Scan0))
                    CvInvoke.CvtColor(videoFrameBgr, videoFrameRgbBuffer, ColorConversion.Bgr2Rgb);
                frame.Image.UnlockBits(bits);

                // Prepare the packet to send over the net
                var packet = new VideoDataPacket() {
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                };
                foreach (var face in frame.Faces)
                {
                    var faceBits = frame.Image.LockBits(face.Bounds, ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
                    var bytes = new byte[faceBits.Stride * faceBits.Height];
                    Marshal.Copy(faceBits.Scan0, bytes, 0, bytes.Length);
                    frame.Image.UnlockBits(faceBits);

                    packet.Faces.Add(new VideoDataPacket.Types.Face() {
                        Id = -1,
                        Data = ByteString.CopyFrom(bytes)
                    });
                }

                _network.SendPacket(packet);

            };
        }
    }
}
