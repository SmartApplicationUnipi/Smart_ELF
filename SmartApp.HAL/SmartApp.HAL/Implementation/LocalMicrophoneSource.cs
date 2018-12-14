using System;
using System.Reactive.Subjects;
using Microsoft.Extensions.Logging;
using NAudio.Wave;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;

namespace SmartApp.HAL.Implementation
{
    /// <summary>
    /// Uses the local microphone as an audio source.
    /// Samples are collected every 30 seconds (approx).
    /// </summary>
    internal class LocalMicrophoneSource : IAudioSource
    {
        private readonly ILogger<LocalMicrophoneSource> _logger;

        // Microphone source as wave source
        private readonly WaveInEvent _waveIn = new WaveInEvent();
        private readonly byte[] _waveBuffer;
        private int _waveBufferPosition = 0;
        private DateTime _startRecordTime;
        private bool _isRecording = false;

        public LocalMicrophoneSource(ILogger<LocalMicrophoneSource> logger)
        {
            _logger = logger;
            _logger.LogInformation("Local microphone audio source loaded.");

            // Prepare the buffer to hold the data
            _waveBuffer = new byte[_waveIn.WaveFormat.AverageBytesPerSecond * 30];

            // Add the event handlers
            _waveIn.DataAvailable += OnDataAvailable;
            _waveIn.RecordingStopped += OnRecordingStopped;
        }

        private void OnDataAvailable(object sender, WaveInEventArgs e)
        {
            // Store the new data in the buffer
            if (_waveBufferPosition + e.BytesRecorded < _waveBuffer.Length)
            {
                Array.Copy(e.Buffer, 0, _waveBuffer, _waveBufferPosition, e.BytesRecorded);
                _waveBufferPosition += e.BytesRecorded;
            }
            else
            {
                // Publish the current buffer as a complete sample
                PublishBuffer();
                _startRecordTime = DateTime.Now;
                // Reset the buffer and put the new data inside
                Array.Copy(e.Buffer, _waveBuffer, e.BytesRecorded);
                _waveBufferPosition = e.BytesRecorded;
            }
        }

        private void OnRecordingStopped(object sender, StoppedEventArgs e)
        {
            // If there's something in the buffer, publish it as a complete sample
            if (_waveBufferPosition > 0)
            {
                PublishBuffer();
            }

            // Clear the buffer
            _waveBufferPosition = 0;
        }

        private void PublishBuffer()
        {
            // Publish a new complete sample
            _logger.LogTrace("New audio sample with WaveFormat: " + _waveIn.WaveFormat);
            SampleReady?.Invoke(this, new AudioSample(DateTime.Now, _waveBuffer, _waveBufferPosition, new AudioSample.FixedWaveFormat(_waveIn.WaveFormat.SampleRate)));
        }

        public event EventHandler<AudioSample> SampleReady;

        public void Start()
        {
            _isRecording = true;
            _waveIn.StartRecording();
            _startRecordTime = DateTime.Now;
            _logger.LogInformation("Recording started.");
        }

        public void Stop()
        {
            _isRecording = false;
            _waveIn.StopRecording();
            _logger.LogInformation("Recording stopped.");
        }

        public void Dispose()
        {
            // Stop the recording and dispose the audio source
            Stop();
            _waveIn.Dispose();
        }

        public bool IsRecording()
        {
            return _isRecording;
        }
    }
}
