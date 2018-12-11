using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static KBWrapper.Wrapper;

namespace KBWrapper
{
    public interface IKbWrapper
    {
        void Connect();

        event EventHandler OnOpen;

        event EventHandler<bool> OnConnected;

        event EventHandler<MessageEventArgs> OnMessage;

        event EventHandler<ErrorEventArgs> OnError;

        event EventHandler OnClose;

        void Close();

        void WriteUserEngaged();

        void RemoveUserEngaged();


    }
}
