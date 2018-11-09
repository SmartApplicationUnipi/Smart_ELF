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
        private readonly ILogger<AudioManager> _logger;
        //To take from configuration file or container?
        private IPAddress _ipAddress = System.Net.Dns.GetHostEntry("localhost").AddressList[0];
        private int _port = 55555;

        private List<TcpClient> _clients;

        public AudioManager(IAudioSource source, ILogger<AudioManager> logger)
        {
            _source = source ?? throw new ArgumentNullException(nameof(source));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            _clients = new List<TcpClient>();
            //Thread for the server socket
            ThreadStart task = AudioServerThread;
            Thread thread = new Thread(task);
            thread.Start();

        }

        //Thread server
        private void AudioServerThread()
        {
            TcpListener audioServer = new TcpListener(_ipAddress, _port);
            audioServer.Start();
            _logger.LogInformation("Audio tcp listener started.");
            while (true)
            {
                _clients.Add(audioServer.AcceptTcpClient());
            }
            //TODO stop server?
            //svr.Stop();
        }

        public void Start()
        {
            _source.SampleReady += (_, sample) =>
            {
                /*
                // Encode the sample in a complete WAV
                byte[] byteWav;
                var waveFormat = new WaveFormat(sample.SampleRate, sample.BitsPerSample, sample.Channels);
                using (var memoryStream = new MemoryStream())
                using (WaveFileWriter writer = new WaveFileWriter(memoryStream, waveFormat))
                {
                    writer.Write(sample.Data, 0, sample.BufferLenght);
                    byteWav = memoryStream.ToArray();
                }
                */

                // Prepare a packet and send it over the wire
                var packet = new AudioDataPacket() {
                    Timestamp = (ulong) DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                    SampleRate = (uint) sample.SampleRate,
                    Channels = (uint) sample.Channels,
                    BitsPerSample = (uint) sample.BitsPerSample,
                    Data = ByteString.CopyFrom(sample.Data)
                };
                _logger.LogTrace("Audio sample packet builded");
                if (_clients.Count > 0)
                {
                    foreach (TcpClient client in _clients)
                    {
                        if (client.Connected)
                        {
                            client.GetStream().Write(packet.ToByteArray(), 0, packet.ToByteArray().Length);
                            _logger.LogTrace("Audio sample packet sended to client " + client.Client.ToString());
                        }
                        else
                        {
                            _clients.Remove(client);
                        }
                    }
                }
            };
        }

    }
}
