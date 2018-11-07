using Microsoft.Extensions.Logging;
using NAudio.Wave;
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
            var audioSamplesPort = new BufferedPortBottle();
            {
                // Stream the audio samples to a yarp port
                audioSamplesPort.open("/microphone/samples");
                _source.SampleReady += (_, sample) =>
                {
                    byte[] byteWav;
                    using (var memoryStream = new MemoryStream())
                    using (WaveFileWriter writer = new WaveFileWriter(memoryStream, sample.WaveFormat))
                    {
                        writer.Write(sample.Data, 0, sample.Data.Length);
                        byteWav = memoryStream.ToArray();
                        //TEST SU FILE
                        //String now = DateTime.Now.ToString("HH mm ss");
                        //String filename = "C:\\Users\\AleB\\Desktop\\Audiotest\\second" + now + ".wav";
                        //File.WriteAllBytes(filename, byteWav);
                        //
                    }

                    using (var bottle = audioSamplesPort.prepare())
                    {
                       
                        var handle = GCHandle.Alloc(byteWav, GCHandleType.Pinned);
                        bottle.clear();
                        bottle.addInt64(new DateTimeOffset(sample.Timestamp).ToUnixTimeSeconds());
                        bottle.add(Value.makeBlob(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), byteWav.Length));
                        audioSamplesPort.write();
                        audioSamplesPort.waitForWrite();

                        handle.Free();
                    }
                };
            }
        }
    }
}
