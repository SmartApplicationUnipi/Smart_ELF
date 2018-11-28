using System;
using SmartApp.HAL.Model;

namespace SmartApp.HAL.Services
{
    public interface IVideoSource : IDisposable
    {
        void Start();
        void Stop();

        float Framerate { get; set; }

        bool IsAvailable { get;}

        event EventHandler<VideoFrame> FrameReady;
    }
}
