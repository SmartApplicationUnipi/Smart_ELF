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
            services.AddSingleton<IVideoManager, VideoManager>();
            services.AddSingleton<IAudioManager, AudioManager>();

            // User interface
            services.AddTransient<IUserInterface, WinFormsUI>();

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

        public static void Main(string[] args)
        {
            var serviceProvider = BuildDIContainer();

            // Initialize Yarp
            Network.init();

            using (var videoSource = serviceProvider.GetRequiredService<IVideoSource>())
            using (var audioSource = serviceProvider.GetRequiredService<IAudioSource>())
            {
                // Start the audio and video managers
                var videoManager = serviceProvider.GetRequiredService<IVideoManager>();
                var audioManager = serviceProvider.GetRequiredService<IAudioManager>();

                videoManager.Start();
                audioManager.Start();

                // Run the sample application
                serviceProvider.GetRequiredService<IUserInterface>().Run();
            }

            // Explicitely shutdown NLog and Yarp
            Network.fini();
            NLog.LogManager.Shutdown();
        }
    }
}
