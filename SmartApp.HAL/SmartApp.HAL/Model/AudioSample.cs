using System;
using NAudio.Wave;

namespace SmartApp.HAL.Model
{
    public class AudioSample
    {
        public AudioSample(DateTime timestamp, byte[] data, int bufferLength, WaveFormat waveFormat)
        {
            Timestamp = timestamp;
            Data = data ?? throw new ArgumentNullException(nameof(data));
            BufferLength = bufferLength < 0 ? throw new ArgumentOutOfRangeException(nameof(bufferLength), "Must be positive") : bufferLength;
            WaveFormat = waveFormat ?? throw new ArgumentNullException(nameof(waveFormat));
        }

        public DateTime Timestamp { get; private set; }
        public byte[] Data { get; private set; }
        public int BufferLength { get; private set; }
        public WaveFormat WaveFormat { get; private set; } //ad ora viene usato il formato di NAudio
    }
}