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

namespace SmartApp.HAL
{
    internal class Program
    {
        private static IServiceProvider BuildDIContainer()
        {
            var services = new ServiceCollection();

            // Audio/Video sources
            services.AddSingleton<IAudioSource, LocalMicrophoneSource>();
            services.AddSingleton<IVideoSource, LocalCameraSource>();

            // Configure generic logging services
            services.AddSingleton<ILoggerFactory, LoggerFactory>();
            services.AddSingleton(typeof(ILogger<>), typeof(Logger<>));
            services.AddLogging(builder => builder.SetMinimumLevel(LogLevel.Trace));

            // Build the final provider
            var serviceProvider = services.BuildServiceProvider();

            // Configure NLog
            var loggerFactory = serviceProvider.GetRequiredService<ILoggerFactory>();
            loggerFactory.AddNLog(new NLogProviderOptions() { CaptureMessageTemplates = true, CaptureMessageProperties = true });
            NLog.LogManager.LoadConfiguration("nlog.config");

            return serviceProvider;
        }

        private static void RunDemoApplication(IVideoSource videoSource, IAudioSource audioSource)
        {
            // Create a simple form with just a button and an image
            var form = new Form()
            {
                Text = "SmartApp",
                ClientSize = new Size(640, 550),
                StartPosition = FormStartPosition.CenterScreen,
                MinimizeBox = false,
                MaximizeBox = false,
                FormBorderStyle = FormBorderStyle.FixedSingle
            };

            // Image to render the video
            var buffer = new Bitmap(640, 480, PixelFormat.Format24bppRgb);
            var image = new PictureBox()
            {
                Size = new Size(640, 480),
                Location = new Point(0, 0),
                Image = buffer
            };
            form.Controls.Add(image);

            // Button to start/stop recording
            var btn = new Button()
            {
                Size = new Size(640, 70),
                Location = new Point(0, 480),
                Text = "Keep pressed to record",
                Font = new Font(FontFamily.GenericSansSerif, 16.0f, FontStyle.Bold)
            };
            btn.MouseDown += (_, __) => { videoSource.Start(); audioSource.Start(); };
            btn.MouseUp += (_, __) => { videoSource.Stop(); audioSource.Stop(); };
            form.Controls.Add(btn);

            // Draw the rectangles for the faces on the bitmap and show it on the screen
            videoSource.FrameReady += (_, frame) => {
                using (var g = Graphics.FromImage(buffer))
                using (var pen = new Pen(Color.Red, 3f))
                {
                    g.DrawImage(frame.Image, new Rectangle(0, 0, buffer.Width, buffer.Height));
                    foreach (var face in frame.Faces)
                    {
                        g.DrawRectangle(pen, face.Bounds);
                    }
                }
                image.Invoke((Action)(() => {
                    image.Refresh();
                }));
            };

            // Show the form and block
            Application.EnableVisualStyles();
            form.ShowDialog();
        }

        public static void Main(string[] args)
        {
            var serviceProvider = BuildDIContainer();

            // Initialize Yarp
            Network.init();

            using (var videoSource = serviceProvider.GetRequiredService<IVideoSource>())
            using (var audioSource = serviceProvider.GetRequiredService<IAudioSource>())
            using (var videoPort = new BufferedPortImageRgb())
            using (var audioPort = new BufferedPortBottle())
            using (var videoFrameRgbBuffer = new Image<Rgb, byte>(640, 480))
            {
                // Stream the video frames to a yarp port
                videoPort.open("/camera");
                videoSource.FrameReady += (_, frame) =>
                {
                    using (var msg = videoPort.prepare())
                    {
                        // Convert the incoming image which is BGR to RGB
                        var bits = frame.Image.LockBits(new Rectangle(0, 0, frame.Image.Width, frame.Image.Height), ImageLockMode.ReadOnly, PixelFormat.Format24bppRgb);
                        using (var videoFrameBgr = new Image<Bgr, byte>(frame.Image.Width, frame.Image.Height, bits.Stride, bits.Scan0))
                            CvInvoke.CvtColor(videoFrameBgr, videoFrameRgbBuffer, ColorConversion.Bgr2Rgb);
                        frame.Image.UnlockBits(bits);

                        // Send the RGB image over yarp
                        var handle = GCHandle.Alloc(videoFrameRgbBuffer.Bytes, GCHandleType.Pinned);
                        msg.setExternal(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), (uint)frame.Image.Width, (uint)frame.Image.Height);
                        videoPort.write();
                        videoPort.waitForWrite();
                        handle.Free();
                    }
                };

                // Stream the audio samples to a yarp port
                audioPort.open("/microphone");
                audioSource.SampleReady += (_, sample) =>
                {
                    using (var bottle = audioPort.prepare())
                    {
                        var handle = GCHandle.Alloc(sample.Data, GCHandleType.Pinned);
                        bottle.clear();
                        bottle.add(Value.makeBlob(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), sample.Data.Length));
                        audioPort.write();
                        audioPort.waitForWrite();
                        handle.Free();
                    }
                };

                // Run the sample application
                RunDemoApplication(videoSource, audioSource);
            }

            // Explicitely shutdown NLog and Yarp
            Network.fini();
            NLog.LogManager.Shutdown();
        }
    }
}
