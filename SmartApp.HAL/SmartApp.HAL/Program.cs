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
using System.Net;
using Microsoft.Kinect;
using SmartApp.HAL.Model;

namespace SmartApp.HAL
{
    internal class Program
    {
        private static IServiceProvider BuildDIContainer()
        {
            var services = new ServiceCollection();

            // Default option values
            services.AddSingleton(new Options() {
                BindToAddress = IPAddress.Any,
                AudioPort = 2001,
                VideoPort = 2002
            });

            // Audio/Video sources
            services.AddSingleton<LocalMicrophoneSource>();
            services.AddSingleton<LocalCameraSource>();
            services.AddSingleton<KinectVideoSource>();
            services.AddSingleton<KinectAudioSource>();
            services.AddSingleton<IVideoSource>(VideoSourceFactory);
            services.AddSingleton<IAudioSource>(AudioSourceFactory);

            // Audio and video managers
            services.AddSingleton<IVideoManager, VideoManager>();
            services.AddSingleton<IAudioManager, AudioManager>();

            // User interface
            services.AddSingleton<IUserInterface, WinFormsUI>();

            // Network
            services.AddSingleton<INetwork, Network>();

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

        private static IAudioSource AudioSourceFactory(IServiceProvider serviceProvider)
        {
            return KinectSensor.GetDefault().IsAvailable
                ? (IAudioSource) serviceProvider.GetService<KinectAudioSource>()
                : (IAudioSource) serviceProvider.GetService<LocalMicrophoneSource>();
        }

        private static IVideoSource VideoSourceFactory(IServiceProvider serviceProvider)
        {
            return KinectSensor.GetDefault().IsAvailable
                ? (IVideoSource)serviceProvider.GetService<KinectVideoSource>()
                : (IVideoSource)serviceProvider.GetService<LocalCameraSource>();
        }

        public static void Main(string[] args)
        {
            var serviceProvider = BuildDIContainer();

            using (serviceProvider.GetRequiredService<INetwork>())
            using (serviceProvider.GetRequiredService<IVideoSource>())
            using (serviceProvider.GetRequiredService<IAudioSource>())
            {
                // Start the audio and video managers
                serviceProvider.GetRequiredService<IVideoManager>().Start();
                serviceProvider.GetRequiredService<IAudioManager>().Start();

                // Run the sample application
                serviceProvider.GetRequiredService<IUserInterface>().Run();
            }

            // Explicitely shutdown NLog
            NLog.LogManager.Shutdown();
        }
    }
}
