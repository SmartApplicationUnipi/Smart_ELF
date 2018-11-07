using NAudio.Wave;
using System;

namespace SmartApp.HAL.Model
{
    public class AudioSample
    {
        public AudioSample(DateTime timestamp, byte[] data, int bufferlenght, WaveFormat waveFormat)
        {
            Timestamp = timestamp;
            Data = data ?? throw new ArgumentNullException("data");
            BufferLenght = bufferlenght;
            WaveFormat = waveFormat ?? throw new ArgumentNullException("waveFormat");
        }

        public DateTime Timestamp { get; private set; }
        public byte[] Data { get; private set; }
        public int BufferLenght { get; private set; }
        public WaveFormat WaveFormat { get; private set; } //ad ora viene usato il formato di NAudio

    }
}