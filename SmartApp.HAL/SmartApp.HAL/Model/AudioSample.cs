using System;

namespace SmartApp.HAL.Model
{
    public class AudioSample
    {
        public AudioSample(DateTime timestamp, byte[] data, int bufferLength, FixedWaveFormat waveFormat)
        {
            Timestamp = timestamp;
            Data = data ?? throw new ArgumentNullException(nameof(data));
            BufferLength = bufferLength < 0 ? throw new ArgumentOutOfRangeException(nameof(bufferLength), "Must be positive") : bufferLength;
            WaveFormat = waveFormat;
        }

        public DateTime Timestamp { get; private set; }
        public byte[] Data { get; private set; }
        public int BufferLength { get; private set; }
        public FixedWaveFormat WaveFormat{ get; private set; }

        //Convert a byte array wave from float32 to int16
        public static byte[] ConvertFormat32fTO16int(byte[] wave)
        {
            //new buffer
            byte[] res = new byte[wave.Length / 2];
            //every cicle: pick 4 bytes to make a float, convert it to short and write the short's two bytes in res
            for(int i = 0; i < wave.Length; i += 4)
            {
                float f= System.BitConverter.ToSingle(wave, i);
                f = f * 32768;
                if (f > 32767) f = 32767;
                if (f < -32768) f = -32768;
                short i16 = (short)f;
                res[i/2+1] = (byte)(i16 >> 8);
                res[i/2] = (byte)(i16 & 255);
            }

            return res;
        }

        //Wave format accpted is with int16 on one channel
        public struct FixedWaveFormat
        {
            public FixedWaveFormat(int sampleRate, int channels)
            {
                SampleRate = sampleRate;
                Channels = channels;
                BitsPerSample = 16;
            }

            public int SampleRate { get; private set; }
            public int Channels { get; private set; }
            public int BitsPerSample { get; private set; }
        }
    }
}