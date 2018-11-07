using NAudio.Wave;
using System;
using System.IO;
using System.Runtime.InteropServices;


namespace SmartApp.HAL
{
    class AudioManager
    {
        public AudioManager (Services.IAudioSource source)
        {
            var audioSamplesPort = new BufferedPortBottle();
            {
                // Stream the audio samples to a yarp port
                audioSamplesPort.open("/microphone/samples");
                source.SampleReady += (_, sample) =>
                {
                    byte[] byteWav;
                    using (var memoryStream = new MemoryStream())
                    using (WaveFileWriter writer = new WaveFileWriter(memoryStream, sample.WaveFormat))
                    {
                        writer.Write(sample.Data, 0, sample.Data.Length);
                        byteWav = memoryStream.ToArray();
                        //TEST SU FILE
                        String now = DateTime.Now.ToString("HH mm ss");
                        String filename = "C:\\Users\\AleB\\Desktop\\Audiotest\\second" + now + ".wav";
                        File.WriteAllBytes(filename, byteWav);
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
