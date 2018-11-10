using Microsoft.Extensions.Logging;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Threading;
using Google.Protobuf;
using System.Linq;
using System.Collections.Concurrent;

namespace SmartApp.HAL.Implementation
{
    internal class Network : INetwork
    {
        private readonly ILogger<Network> _logger;

        private readonly TcpListener _audioListener;
        private readonly Thread _audioAcceptThread;
        private readonly Thread _audioBroadcastThread;
        private readonly BlockingCollection<AudioDataPacket> _audioOutgoingPackets = new BlockingCollection<AudioDataPacket>();
        private readonly List<TcpClient> _audioClients = new List<TcpClient>();

        private readonly TcpListener _videoListener;
        private readonly Thread _videoAcceptThread;
        private readonly Thread _videoBroadcastThread;
        private readonly BlockingCollection<VideoDataPacket> _videoOutgoingPackets = new BlockingCollection<VideoDataPacket>();
        private readonly List<TcpClient> _videoClients = new List<TcpClient>();

        public Network(Options options, ILogger<Network> logger)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Starts the listening sockets
            _audioListener = new TcpListener(options.BindToAddress, options.AudioPort);
            _audioListener.Start();
            _videoListener = new TcpListener(options.BindToAddress, options.VideoPort);
            _videoListener.Start();

            // Starts the two threads for the broadcasting of messages
            _audioBroadcastThread = new Thread(() => BroadcastThreadMain(_audioOutgoingPackets, _audioClients));
            _audioBroadcastThread.Start();
            _videoBroadcastThread = new Thread(() => BroadcastThreadMain(_videoOutgoingPackets, _videoClients));
            _videoBroadcastThread.Start();

            // Starts two new threads to manage the incoming connections
            _audioAcceptThread = new Thread(() => AcceptThreadMain(_audioListener, _audioClients));
            _audioAcceptThread.Start();
            _videoAcceptThread = new Thread(() => AcceptThreadMain(_videoListener, _videoClients));
            _videoAcceptThread.Start();
        }

        public void SendPacket(AudioDataPacket p)
        {
            _audioOutgoingPackets.Add(p);
        }

        public void SendPacket(VideoDataPacket p)
        {
            _videoOutgoingPackets.Add(p);
        }

        public void Dispose()
        {
            // Terminate all the threads
            var threads = new Thread[] { _audioAcceptThread, _audioBroadcastThread, _videoAcceptThread, _videoBroadcastThread };
            foreach (var t in threads)
            {
                t.Interrupt();
                t.Join();
            }

            // Close all the sockets
            foreach (var client in _audioClients.Concat(_videoClients))
            {
                client.Close();
            }
            _audioListener.Stop();
            _videoListener.Stop();
        }

        private void AcceptThreadMain(TcpListener listener, List<TcpClient> clients)
        {
            while (true)
            {
                try
                {
                    // Blocks waiting for incoming connections
                    var client = listener.AcceptTcpClient();
                    _logger.LogInformation("New client connected from {0}.", client.Client.RemoteEndPoint);

                    // Stores the received listener in the list
                    lock (clients)
                    {
                        clients.Add(client);
                    }
                }
                catch (Exception e)
                {
                    _logger.LogError(e, "Error accepting connection.");
                }
            }
        }

        private void BroadcastThreadMain<TPacket>(BlockingCollection<TPacket> outgoingPackets, List<TcpClient> clients)
            where TPacket : IMessage
        {
            while (true)
            {
                // Wait for a packet to send
                var packet = outgoingPackets.Take();

                // Send it to all the clients
                lock (clients)
                {
                    var i = 0;
                    while (i < clients.Count)
                    {
                        try
                        {
                            packet.WriteDelimitedTo(clients[i].GetStream());
                            i++;
                        }
                        catch (Exception)
                        {
                            _logger.LogInformation("Client {0} disconnected.", clients[i].Client.RemoteEndPoint);
                            clients.RemoveAt(i);
                        }
                    }

                    _logger.LogTrace("Packet sent to {0} clients.", i);
                }
            }
        }
    }
}
