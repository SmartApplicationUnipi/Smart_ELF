using Microsoft.Extensions.Logging;
using SmartApp.HAL.Model;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.Net.Sockets;
using System.Threading;
using Google.Protobuf;
using System.Linq;
using System.Collections.Concurrent;
using System.IO;
using System.Net;
using ThreadInterruptedException = System.Threading.ThreadInterruptedException;

namespace SmartApp.HAL.Implementation
{
    internal class Network : INetwork
    {
        private readonly ILogger<Network> _logger;
        private readonly IVideoSource _videoSource;
        private readonly ProtobufServer<AudioDataPacket, AudioDataPacket> _audioServer;
        private readonly ProtobufServer<VideoDataPacket, VideoControlPacket> _videoServer;

        public Network(Options options, IVideoSource videoSource, ILogger<Network> logger, ILoggerFactory loggerFactory)
        {
            if (options == null)
            {
                throw new ArgumentNullException(nameof(options));
            }
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _videoSource = videoSource ?? throw new ArgumentNullException(nameof(videoSource));

            // Starts the audio and video servers
            _audioServer = new ProtobufServer<AudioDataPacket, AudioDataPacket>(
                options.BindToAddress,
                options.AudioPort,
                AudioDataPacket.Parser, // This is a dummy value, we have no AudioControlPacket (for now)
                loggerFactory.CreateLogger($"{typeof(Network).FullName}.ProtobufServer<Audio>")
            );
            _videoServer = new ProtobufServer<VideoDataPacket, VideoControlPacket>(
                options.BindToAddress,
                options.VideoPort,
                VideoControlPacket.Parser,
                loggerFactory.CreateLogger($"{typeof(Network).FullName}.ProtobufServer<Video>")
            );

            _videoServer.IncomingControlPacket += OnIncomingVideoControlPacket;
        }

        public void SendPacket(AudioDataPacket p)
        {
            _audioServer.BroadcastPacket(p);
            _logger.LogTrace("Enqueued audio packet.");
        }

        public void SendPacket(VideoDataPacket p)
        {
            _videoServer.BroadcastPacket(p);
            _logger.LogTrace("Enqueued video packet.");
        }

        public void Dispose()
        {
            // Terminate the servers
            _audioServer.Dispose();
            _videoServer.Dispose();
        }

        private void OnIncomingVideoControlPacket(VideoControlPacket packet)
        {
            _logger.LogTrace("Received video control packet.");

            switch (packet.RequestCase)
            {
                case VideoControlPacket.RequestOneofCase.FramerateRequest:
                    _videoSource.Framerate = packet.FramerateRequest.Framerate;
                    break;

                default:
                    throw new ArgumentOutOfRangeException();
            }
        }



        private class ProtobufServer<TDataPacket, TControlPacket> : IDisposable
            where TDataPacket : IMessage<TDataPacket>
            where TControlPacket : IMessage<TControlPacket>
        {
            private class Connection
            {
                public Connection(TcpClient client, Thread t)
                {
                    Client = client;
                    Thread = t;
                }

                public TcpClient Client { get; }
                public Thread Thread { get; }
            }

            private readonly MessageParser<TControlPacket> _parser;
            private readonly ILogger _logger;
            private bool _isDisposed = false;

            private readonly TcpListener _listener;
            private readonly Thread _listenerThread;
            private readonly Thread _broadcastThread;
            private readonly BlockingCollection<TDataPacket> _outgoingPackets = new BlockingCollection<TDataPacket>();
            private readonly List<Connection> _connections = new List<Connection>();

            public ProtobufServer(IPAddress bindAddress, int port, MessageParser<TControlPacket> parser, ILogger logger)
            {
                if (port <= 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(port));
                }
                _parser = parser ?? throw new ArgumentNullException(nameof(parser));
                _logger = logger ?? throw new ArgumentNullException(nameof(logger));

                // Starts the listening socket
                _listener = new TcpListener(bindAddress, port);
                _listener.Start();
                _logger.LogInformation("Started socket on {0}:{1}", bindAddress, port);

                // Starts the thread that accepts incoming connections
                _listenerThread = new Thread(ListenerThreadMain);
                _listenerThread.Start();

                // Starts the thread that broadcasts outgoing messages
                _broadcastThread = new Thread(BroadcastThreadMain);
                _broadcastThread.Start();
            }

            public event Action<TControlPacket> IncomingControlPacket;

            public void BroadcastPacket(TDataPacket packet)
            {
                _outgoingPackets.Add(packet);
            }

            public void Dispose()
            {
                _isDisposed = true;

                // Terminate the main threads
                _listener.Stop();
                _listenerThread.Interrupt();
                _broadcastThread.Interrupt();
                _listenerThread.Join();
                _broadcastThread.Join();
                _logger.LogTrace("Socket closed.");

                // Close all the client sockets
                lock (_connections)
                {
                    foreach (var c in _connections)
                    {
                        c.Client.Close();
                    }
                }

                // Terminate all the client threads
                while (_connections.Count > 0)
                {
                    Connection c;
                    lock (_connections)
                    {
                        c = _connections.FirstOrDefault();
                    }
                    if (c != null)
                    {
                        c.Thread.Interrupt();
                        c.Thread.Join();

                        // The threads will remove themselves from the collection
                    }
                }
                _logger.LogTrace("Threads terminated.");

                _logger.LogInformation("Server shutdown complete.");
            }

            private void ListenerThreadMain()
            {
                while (!_isDisposed)
                {
                    try
                    {
                        // Blocks waiting for incoming connections
                        var client = _listener.AcceptTcpClient();
                        _logger.LogInformation("New client connected from {0}.", client.Client.RemoteEndPoint);

                        // Stores the received listener in the list
                        var t = new Thread(ClientThreadMain);
                        var connection = new Connection(client, t);
                        lock (_connections)
                        {
                            _connections.Add(connection);
                        }
                        t.Start(connection);
                        
                    }
                    catch (Exception e)
                    {
                        if (_isDisposed && (e is IOException || e is SocketException || e is ThreadInterruptedException))
                        {
                            // The listening socket was closed, so just exit the thread
                            break;
                        }
                        _logger.LogError(e, "Error accepting connection.");
                    }
                }
            }

            private void BroadcastThreadMain()
            {
                while (!_isDisposed)
                {
                    try
                    {
                        // Wait for a packet to send
                        var packet = _outgoingPackets.Take();

                        // Send it to all the clients
                        lock (_connections)
                        {

                            // Do nothing if no one is connected
                            if (_connections.Count == 0)
                            {
                                continue;
                            }

                            foreach (var conn in _connections)
                            {
                                try
                                {
                                    packet.WriteDelimitedTo(conn.Client.GetStream());
                                }
                                catch (Exception)
                                {
                                    // Close the client socket and interrupt its thread
                                    conn.Client.Close();
                                    conn.Thread.Interrupt();
                                }
                            }

                            _logger.LogTrace("Packet sent to {0} clients.", _connections.Count);
                        }
                    }
                    catch (ThreadInterruptedException) when (_isDisposed)
                    {
                        // We just got interrupted, so exit immediately
                        break;
                    }
                }
            }

            private void ClientThreadMain(object c)
            {
                var connection = (Connection)c;
                while (!_isDisposed)
                {
                    try
                    {
                        // Read an incoming data packet from the client
                        var packet = _parser.ParseDelimitedFrom(connection.Client.GetStream());

                        // We got a new packet!
                        IncomingControlPacket?.Invoke(packet);
                    }
                    catch (Exception e)
                    {
                        if (!_isDisposed && !(e is ThreadInterruptedException))
                        {
                            _logger.LogInformation("Client {0} disconnected.", connection.Client.Client.RemoteEndPoint);
                        }

                        // The client wither disconnected or sent an invalid packet, so kill this connection.
                        // We will reach this point also if we get interrupted.
                        break;
                    }
                }

                // Remove our self from the list of connections
                connection.Client.Close();
                connection.Client.Dispose();
                while (true)
                {
                    try
                    {
                        lock (_connections)
                        {
                            _connections.Remove(connection);
                        }
                        break;
                    }
                    catch (ThreadInterruptedException) when (_isDisposed)
                    {
                        // Keep on trying
                    }
                }
            }
        }
    }
}
