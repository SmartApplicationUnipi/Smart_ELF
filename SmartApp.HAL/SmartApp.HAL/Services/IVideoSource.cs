using System;
using SmartApp.HAL.Model;

namespace SmartApp.HAL.Services
{
    public interface IVideoSource : IDisposable
    {
        void Start();
        void Stop();

        event EventHandler<VideoFrame> FrameReady;
    }
}
