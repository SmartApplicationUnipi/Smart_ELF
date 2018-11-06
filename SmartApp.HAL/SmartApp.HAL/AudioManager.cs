using System.Runtime.InteropServices;


namespace SmartApp.HAL
{
    class AudioManager
    {
        public AudioManager (Services.IAudioSource source)
        {
            using (var audioPort = new BufferedPortBottle())
            {
                // Stream the audio samples to a yarp port
                audioPort.open("/microphone");
                source.SampleReady += (_, sample) =>
                {
                    using (var bottle = audioPort.prepare())
                    {
                        var handle = GCHandle.Alloc(sample.Data, GCHandleType.Pinned);
                        bottle.clear();
                        bottle.add(Value.makeBlob(new SWIGTYPE_p_void(handle.AddrOfPinnedObject(), true), sample.Data.Length));
                        audioPort.write();
                        audioPort.waitForWrite();
                        handle.Free();
                    }
                };
            }
        }
    }
}
