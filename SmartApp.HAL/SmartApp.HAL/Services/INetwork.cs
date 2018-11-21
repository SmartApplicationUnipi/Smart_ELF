using SmartApp.HAL.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Services
{
    public interface INetwork : IDisposable
    {
        void SendPacket(AudioDataPacket p);
        void SendPacket(VideoDataPacket p);
    }
}
