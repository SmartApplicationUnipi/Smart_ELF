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
        private bool _isRecording = false;

        public KinectAudioSource(ILogger<KinectAudioSource> logger)
        {
            _logger = logger;
            _kinect = KinectSensor.GetDefault();

            AudioSource audioSource = _kinect.AudioSource;
            //audioSource.AudioBeams[0].AudioBeamMode = AudioBeamMode.Manual; //scegli angolo "di ascolto"
            //audioSource.AudioBeams[0].BeamAngle = 0; //angolo 0 == al centro (valori da -50 a +50 da sinistra a destra)
            _waveBuffer = new byte[64000 * 30]; //avg_byte_per_sec * 30
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
            if (_waveBufferPos > 64000*1.5) //if less then 1.5 seconds, don't publish
            {
                _logger.LogInformation("Kinect published audio.");
                byte[] convertedWave = AudioSample.ConvertFormat32fTO16int(_waveBuffer, _waveBufferPos, 1);
                SampleReady?.Invoke(this, new AudioSample(DateTime.Now, convertedWave, convertedWave.Length, new AudioSample.FixedWaveFormat(16000)));
                _waveBufferPos = 0;
            }
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
                _isRecording = true;

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
            _isRecording = false;
        }

        public bool IsRecording()
        {
            return _isRecording;
        }
    }
}
