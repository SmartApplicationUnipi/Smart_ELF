using Microsoft.Extensions.Logging;
using Microsoft.Kinect;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Implementation
{
    class KinectAudioSource : IAudioSource
    {
        private readonly ILogger<KinectAudioSource> _logger;
        private KinectSensor _kinect = null;

        private AudioBeamFrameReader _audioBeamFrameReader = null;
        private readonly byte[] _waveBuffer = null;
        private int _waveBufferPos = 0;

        public KinectAudioSource(ILogger<KinectAudioSource> logger)
        {
            _logger = logger;
            _kinect = KinectSensor.GetDefault();

            AudioSource audioSource = _kinect.AudioSource;
            //audioSource.AudioBeams[0].AudioBeamMode = AudioBeamMode.Manual; //scegli angolo "di ascolto"
            //audioSource.AudioBeams[0].BeamAngle = 0; //angolo 0 == al centro (valori da -50 a +50 da sinistra a destra)
            _waveBuffer = new byte[64000 * 5]; //avg_byte_per_sec * 5
            _audioBeamFrameReader = audioSource.OpenReader();
            _audioBeamFrameReader.IsPaused = true;
            if (!_kinect.IsOpen) { 
                _kinect.Open();
            }

            logger.LogInformation("Kinect audio source loaded.");
        }

        private void Reader_FrameArrived(object sender, AudioBeamFrameArrivedEventArgs e)
        {
            AudioBeamFrameReference frameReference = e.FrameReference;
            AudioBeamFrameList frameList = frameReference.AcquireBeamFrames();
            if (frameList != null)
            {
                using (frameList)
                {
                    byte[] audioBuffer = new byte[_kinect.AudioSource.SubFrameLengthInBytes];
                    IReadOnlyList<AudioBeamSubFrame> subFrameList = frameList[0].SubFrames;
                    foreach (AudioBeamSubFrame subFrame in subFrameList)
                    {
                        int bytesRecorded = (int)subFrame.FrameLengthInBytes;
                        subFrame.CopyFrameDataToArray(audioBuffer);


                        if (_waveBufferPos + bytesRecorded < _waveBuffer.Length)
                        {
                            Array.Copy(audioBuffer, 0, _waveBuffer, _waveBufferPos, bytesRecorded);
                            _waveBufferPos += bytesRecorded;
                        }
                        else
                        {
                            PublishBuffer();

                            Array.Copy(audioBuffer, _waveBuffer, bytesRecorded);
                            _waveBufferPos = bytesRecorded;
                        }

                    }
                }
            }
        }

        private void PublishBuffer()
        {
            _logger.LogInformation("Kinect published audio.");
            SampleReady?.Invoke(this, new AudioSample(DateTime.Now, _waveBuffer, _waveBuffer.Length, new NAudio.Wave.WaveFormat(16000,32,1)));
            _waveBufferPos = 0;
        }

        public event EventHandler<AudioSample> SampleReady;

        public void Dispose()
        {
            if (_kinect != null)
            {
                if (_kinect.IsOpen)
                {
                    _kinect.Close();
                }
                _kinect = null;
            }

            if (_audioBeamFrameReader != null)
            {
                _audioBeamFrameReader.Dispose();
                _audioBeamFrameReader = null;
            }
        }

        public void Start()
        {
            if (_kinect != null)
            {
                _audioBeamFrameReader.FrameArrived += Reader_FrameArrived;
                _audioBeamFrameReader.IsPaused = false;
                _waveBufferPos = 0;
            }
        }

        public void Stop()
        {
            if (_waveBufferPos != 0)
            {
                PublishBuffer();
            }
            _audioBeamFrameReader.FrameArrived -= Reader_FrameArrived;
            _audioBeamFrameReader.IsPaused = true;
        }
    }
}
