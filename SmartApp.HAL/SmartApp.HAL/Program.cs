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





        private static void runApplication (IVideoSource videoSource, IAudioSource audioSource)
        {
            // Create a simple form with just a button and an image
            var form = new Form()
            {
                Text = "SmartApp",
                ClientSize = new Size(640, 480),
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

            videoSource.Start();
            audioSource.Start();

            // Draw the rectangles for the faces on the bitmap and show it on the screen
            videoSource.FrameReady += (_, frame) => {
                using (var g = Graphics.FromImage(buffer))
                using (var pen = new Pen(Color.Red, 3f))
                {
                    g.Clear(Color.White);

                    foreach (var face in frame.Faces)
                    {
                        // Bounds : X, Y, Width, Height
                        var frameFace = (System.Drawing.Image) frame.Image.Clone(face.Bounds, System.Drawing.Imaging.PixelFormat.DontCare);
                        g.DrawImage(frameFace, face.Bounds);
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
            using (var streamPort = new BufferedPortImageRgb())
            using (var facesPort = new BufferedPortBottle())
            using (var audioPort = new BufferedPortBottle())
            using (var videoFrameRgbBuffer = new Image<Rgb, byte>(640, 480))
            {
                // Stream the video frames to a yarp port
                streamPort.open("/camera/stream");
                facesPort.open("/camera/faces");

                videoSource.FrameReady += (_, frame) =>
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
                            bottle.add(Value.makeBlob (new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), bytes.Length ));
                        }

                        facesPort.write();
                        facesPort.waitForWrite();
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
                runApplication (videoSource, audioSource);
            }

            // Explicitely shutdown NLog and Yarp
            Network.fini();
            NLog.LogManager.Shutdown();
        }
    }
}
