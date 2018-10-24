using System;
using SmartApp.HAL.Model;

namespace SmartApp.HAL.Services
{
    public interface IAudioSource : IDisposable
    {
        void Start();
        void Stop();

        event EventHandler<AudioSample> SampleReady;
    }
}
