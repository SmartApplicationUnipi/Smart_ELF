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
            {
                // Creating VideoManager instance
                var videoManager = new VideoManager(videoSource);

                // Creating AudioManager instance
                var audioManager = new AudioManager(audioSource);

                // Run the sample application
                runApplication(videoSource, audioSource);
            }

            // Explicitely shutdown NLog and Yarp
            Network.fini();
            NLog.LogManager.Shutdown();
        }
    }
}
