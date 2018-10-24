using System;

namespace SmartApp.HAL.Model
{
    public class AudioSample
    {
        public AudioSample(DateTime timestamp, byte[] data)
        {
            Timestamp = timestamp;
            Data = data ?? throw new ArgumentNullException("data");
        }

        public DateTime Timestamp { get; private set; }
        public byte[] Data { get; private set; }
    }
}