using System;
using System.Configuration;
using Newtonsoft.Json.Linq;
using WebSocketSharp;

namespace KBWrapper {

    //---------------------------------------------------------------
    // Wrapper Class
    //---------------------------------------------------------------
    public class Wrapper {

        private static readonly string USER_ENGAGED = "USER_ENGAGED";

        private string SOURCE_ID;

        private WebSocket socket;

        private string socketAddress;
        private string token;

        //dealing in stupid way with this async lib
        private bool waitingRegisterResponse = false;
        private bool waitingRegisterTagResponse = false;
        private bool waitingSubscribeResponse = false;


        public Wrapper() {
            readWebSocketConfig();
            socket = new WebSocket(socketAddress);
            socket.OnOpen += _OnOpen;
            socket.OnClose += _OnClose;
            socket.OnMessage += _OnMessage;
            socket.OnError += _OnError;
        }

        //---------------------------------------------------------------
        // Public API
        //---------------------------------------------------------------
        public void Connect() {
            socket.Connect();
            this.Register();
            this.waitingRegisterResponse = true;
        }

        public void Close() {
            socket.Close();
            //socket.dispose() ??
        }

        public void WriteUserEngaged() {
            this.removePreviousUserEngaged();
            Message.UserEngaged engaged = new Message.UserEngaged(true);
            this.AddFact(USER_ENGAGED, 1, 100, engaged);
        }


        public void RemoveUserEngaged() {
            this.removePreviousUserEngaged();
            Message.UserEngaged engaged = new Message.UserEngaged(false);
            this.AddFact(USER_ENGAGED, 1, 100, engaged);
        }

        public event EventHandler OnOpen;

        public event EventHandler<bool> OnConnected;

        public event EventHandler<MessageEventArgs> OnMessage;

        public event EventHandler<ErrorEventArgs> OnError;

        public event EventHandler OnClose;

        //---------------------------------------------------------------
        // KB API
        //---------------------------------------------------------------

        private void Register() {
            Message register = Message.Register(this.token);
            Send(register.Serialize());
        }

        private void RegisterTags(Message.Tag[] tagsList) {
            Message registerTag = Message.RegisterTags(SOURCE_ID, tagsList, this.token);
            Send(registerTag.Serialize());
        }

        private void AddFact(string tag, int ttl, int reliability, Object fact) {
            Message.Fact f = new Message.Fact(SOURCE_ID, tag, ttl, reliability, JObject.FromObject(fact));
            Message addFact = Message.AddFact(f, this.token);
            Send(addFact.Serialize());
        }

        private void RemoveFact(JObject request) {
            Message m = Message.RemoveFact(request, token);
            Send(m.Serialize());
        }

        private void Subscribe(JObject request) {
            Message m = Message.Subscribe(request, token);
            Send(m.Serialize());
        }

        private void Send(string request) {
            Console.WriteLine(String.Format("Sending: {0}", request));
            socket.SendAsync(request, null);
        }
        //---------------------------------------------------------------
        // Private methods
        //---------------------------------------------------------------

        private void readWebSocketConfig() {
            try {
                string address = ConfigurationManager.AppSettings[ConfigKeys.Address];
                string port = ConfigurationManager.AppSettings[ConfigKeys.Port];
                token = ConfigurationManager.AppSettings[ConfigKeys.Token];
                if (address == null || port == null || token == null) {
                    Console.WriteLine("The config file MUST contain Address, Port, and Token.");
                    throw new ConfigurationErrorsException("The config file MUST contain Address, Port, and Token.");
                }
                socketAddress = String.Format("ws://{0}:{1}", address, port);
            } catch (ConfigurationErrorsException) {
                Console.WriteLine("Error reading app settings");
                throw;
            }
        }

        private void removePreviousUserEngaged() {
            JObject o = new JObject();
            JObject meta = new JObject();
            meta["tag"] = "USER_ENGAGED";
            o["_meta"] = meta;

            JObject w = new JObject();
            w["idSource"] = SOURCE_ID;
            w["jsonReq"] = o;

            this.RemoveFact(w);
        }

        private void subscribeForUserEngagedEvents() {
            JObject o = new JObject();
            JObject meta = new JObject();
            meta["tag"] = "USER_ENGAGED";
            o["_meta"] = meta;

            JObject w = new JObject();
            w["idSource"] = SOURCE_ID;
            w["jsonReq"] = o;

            this.Subscribe(w);
        }


        //----------------------------------------------------------------------
        // CallBacks
        //----------------------------------------------------------------------
        private void _OnOpen(Object sender, System.EventArgs empty) {
            Console.WriteLine("Connection with KB opened.");
            OnOpen?.Invoke(this, EventArgs.Empty);
        }

        private void _OnClose(Object sender, WebSocketSharp.CloseEventArgs e) {
            Console.WriteLine(String.Format("Connection with KB closed (code {0}: {1})", e.Code, e.Reason));
            OnClose?.Invoke(this, EventArgs.Empty);
        }

        private void _OnMessage(Object sender, WebSocketSharp.MessageEventArgs e) {
            Console.WriteLine("Message received from KB." + e.Data);
            if (!wrapperHandled(e.Data)) {
                // TODO: if reqId is not remFact or AddFact -> KB update not merged
                JObject o = JObject.Parse(e.Data);
                JArray a = null;
                try {
                    a = JArray.FromObject(o["details"]);
                    foreach (var obj in a) {
                        Message.UserEngaged u = JObject.FromObject(obj["object"]["_data"]).ToObject<Message.UserEngaged>();
                        OnMessage?.Invoke(this, new MessageEventArgs(u));
                    }
                } catch (Exception) { }
            }
        }

        private void _OnError(Object sender, WebSocketSharp.ErrorEventArgs e) {
            Console.WriteLine(String.Format("An error occurs during the interaction with KB. (Message: {0}. Exception: {1})", e.Message, e.Exception.Message));
            OnError?.Invoke(this, new ErrorEventArgs(e));
        }

        //Private handling of onMessage
        private bool wrapperHandled(string json) {

            if (this.waitingRegisterResponse) {
                RegisterResponse r = JObject.Parse(json).ToObject<RegisterResponse>();
                this.SOURCE_ID = r.SourceID;

                Message.Tag tag = new Message.Tag(USER_ENGAGED, "A human is about to interact with ELF", "(A human is about to interact with ELF).verbose()");
                this.RegisterTags(new Message.Tag[] { tag });

                this.waitingRegisterResponse = false;
                this.waitingRegisterTagResponse = true;
                return true;
            }

            if (this.waitingRegisterTagResponse) {
                //should I check the answer? -> false, someone already (me, before crashing) register this tag -> I can add fact with that tag anyway
                this.waitingRegisterTagResponse = false;
                this.waitingSubscribeResponse = true;
                this.subscribeForUserEngagedEvents();
                return true;
            }

            if (this.waitingSubscribeResponse) {
                this.waitingSubscribeResponse = false;
                OnConnected?.Invoke(this, true);
                return true;
            }
            return false;
        }

        //---------------------------------------------------------------
        // EventArgs to hide WebSocketSharpLib
        //---------------------------------------------------------------
        public class MessageEventArgs : EventArgs {
            public bool Value { get; }
            public string InteractionName { get; }

            public MessageEventArgs(Message.UserEngaged userEngaged) {
                this.Value = userEngaged.Value;
                this.InteractionName = userEngaged.InteractionName;
            }
        }

        public class ErrorEventArgs : EventArgs {
            public string message { get; }
            public System.Exception exception { get; }

            public ErrorEventArgs(WebSocketSharp.ErrorEventArgs e) {
                message = e.Message;
                exception = e.Exception;
            }
        }
    }

    //---------------------------------------------------------------
    // app.config keys
    //---------------------------------------------------------------
    struct ConfigKeys {
        public static string Address = "Address";
        public static string Port = "Port";
        public static string Token = "Token";
    }
}
