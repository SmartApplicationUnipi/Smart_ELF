using System;
using SmartApp.HAL.Model;

namespace SmartApp.HAL.Services
{
    public interface IVideoSource : IDisposable
    {
        void Start();
        void Stop();

        int Framerate { get; set; }

        event EventHandler<VideoFrame> FrameReady;
    }
}
