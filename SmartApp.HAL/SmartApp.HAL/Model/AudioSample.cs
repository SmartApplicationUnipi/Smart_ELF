using System;

namespace SmartApp.HAL.Model
{
    public class AudioSample
    {
        public AudioSample(DateTime timestamp, byte[] data, int bufferlenght, int sampleRate, int channels, int bitPerSample)
        {
            Timestamp = timestamp;
            Data = data ?? throw new ArgumentNullException("data");
            BufferLenght = bufferlenght;
            //TODO struct?
            SampleRate = sampleRate;
            Channels = channels;
            BitsPerSample = bitPerSample;
        }

        public DateTime Timestamp { get; private set; }
        public byte[] Data { get; private set; }
        public int BufferLenght { get; private set; }
        public int SampleRate { get; private set; }
        public int Channels { get; private set; }
        public int BitsPerSample { get; private set; }

    }
}