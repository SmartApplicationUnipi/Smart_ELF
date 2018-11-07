using Google.Protobuf;
using Microsoft.Extensions.Logging;
using NAudio.Wave;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.IO;
using System.Runtime.InteropServices;


namespace SmartApp.HAL.Implementation
{
    internal class AudioManager : IAudioManager
    {
        private readonly IAudioSource _source;
        private readonly ILogger<AudioManager> _logger;

        public AudioManager(IAudioSource source, ILogger<AudioManager> logger)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public void Start()
        {
            _source.SampleReady += (_, sample) =>
            {
                // Encode the sample in a complete WAV
                byte[] byteWav;
                using (var memoryStream = new MemoryStream())
                using (WaveFileWriter writer = new WaveFileWriter(memoryStream, sample.WaveFormat))
                {
                    writer.Write(sample.Data, 0, sample.BufferLenght);
                    byteWav = memoryStream.ToArray();
                }

                // Prepare a packet and send it over the wire
                var packet = new AudioPacket() {
                    Timestamp = (ulong) DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    WavData = ByteString.CopyFrom(byteWav)
                };

            };
        }
    }
}
