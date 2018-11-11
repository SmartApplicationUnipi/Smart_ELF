using Google.Protobuf;
using Microsoft.Extensions.Logging;
using NAudio.Wave;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Sockets;
using System.Runtime.InteropServices;
using System.Threading;

namespace SmartApp.HAL.Implementation
{
    internal class AudioManager : IAudioManager
    {
        private readonly IAudioSource _source;
        private readonly INetwork _network;

        public AudioManager(IAudioSource source, INetwork network)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _network = network ?? throw new ArgumentNullException(nameof(network));
        }

        public void Start()
        {
            _source.SampleReady += (_, sample) =>
            {
                // Prepare a packet and send it over the network
                _network.SendPacket(new AudioDataPacket()
                {
                    Timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    SampleRate = sample.WaveFormat.SampleRate,
                    BitsPerSample = sample.WaveFormat.BitsPerSample,
                    Channels = sample.WaveFormat.Channels,
                    Data = ByteString.CopyFrom(sample.Data, 0, sample.BufferLength)
                });
            };
        }

    }
}
