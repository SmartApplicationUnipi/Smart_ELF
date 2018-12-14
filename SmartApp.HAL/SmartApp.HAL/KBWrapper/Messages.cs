using System;
using System.Diagnostics.Contracts;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace KBWrapper {

    public class Message {

        public const string REGISTER_ID = "registerId";
        public const string REGISTER_TAG_ID = "registerTagId";
        public const string SUBCRIBE_ID = "subscribeId";
        public const string ADD_FACT_ID = "addFactId";
        public const string REMOVE_FACT_ID = "removeFactId";

        private struct Methods {
            internal static readonly string Register = "register";
            internal static readonly string RegisterTags = "registerTags";
            internal static readonly string AddFact = "addFact";
            internal static readonly string RemoveFact = "removeFact";
            internal static readonly string Subscribe = "subscribe";
        }

        //------------------------------------------------------------------------
        // PUBLIC STATIC CONSTRUCTORS
        //------------------------------------------------------------------------
        public static Message Register(string token) {
            return new Message(Methods.Register, new JObject(), token, REGISTER_ID);
        }

        public static Message RegisterTags(string sourceID, Tag[] tags, string token) {
            JObject o = new JObject();
            foreach (Tag t in tags) {
                o[t.name] = t.infoAsJSON;
            }
            JObject oo = new JObject();
            oo["tagsList"] = o;
            oo["idSource"] = sourceID;
            return new Message(Methods.RegisterTags, oo, token, REGISTER_TAG_ID);
        }

        public static Message AddFact(Fact fact, string token) {
            return new Message(Methods.AddFact, JObject.FromObject(fact), token, ADD_FACT_ID);
        }

        public static Message RemoveFact(JObject request, string token) {
            return new Message(Methods.RemoveFact, request, token, REMOVE_FACT_ID);
        }

        public static Message Subscribe(JObject request, string token) {
            return new Message(Methods.Subscribe, request, token, SUBCRIBE_ID);
        }

        //------------------------------------------------------------------------
        // Properties
        //------------------------------------------------------------------------
        [JsonProperty("method")]
        public string Method;

        [JsonProperty("params")]
        public JObject Params;

        [JsonProperty("token")]
        public string Token;

        [JsonProperty("reqId")]
        public string ReqId;

        private Message(string method, JObject param, string token, string reqId = null) {
            this.Method = method;
            this.Params = param;
            this.Token = token;
            this.ReqId = reqId;
        }

        public string Serialize() {
            return JsonConvert.SerializeObject(this, Formatting.None);
        }




        //----------------------------------------------------------------------
        // Objects representing KB parameters
        //----------------------------------------------------------------------
        // Only the ones needed by HAL group are implemented

        public class Tag {

            internal string name;
            private string description;
            private string documentation;

            public JObject asJSON {
                get {
                    JObject o = new JObject();
                    JObject doc = new JObject();
                    doc["desc"] = description;
                    doc["doc"] = documentation;
                    o[name] = doc;
                    return o;
                }
            }

            public JObject infoAsJSON {
                get {
                    JObject doc = new JObject();
                    doc["desc"] = description;
                    doc["doc"] = documentation;
                    return doc;
                }
            }


            public Tag(string name, string description, string documentation) {
                this.name = name;
                this.description = description;
                this.documentation = documentation;
            }
        }




        public class Fact {

            [JsonProperty("idSource")]
            public string SourceID;

            [JsonProperty("tag")]
            public string Tag;

            [JsonProperty("TTL")]
            public int TTL;

            [JsonProperty("reliability")]
            public int Reliability;

            [JsonProperty("jsonFact")]
            public JObject JSONFact;

            public Fact(string sourceID, string tag, int ttl, int reliability, JObject fact) {
                this.SourceID = sourceID;
                this.Tag = tag;
                this.TTL = ttl;
                this.Reliability = reliability;
                this.JSONFact = fact;
            }
        }




        public class UserEngaged {

            private static string datePattern = @"yyyy-MM-dd_[HH-mm-ss]";

            [JsonProperty("value")]
            internal bool Value;

            [JsonProperty("interactionName")]
            internal string InteractionName;

            public UserEngaged(bool value) {
                this.Value = value;
                this.InteractionName = value ? String.Format("ELF_Log_{0}", DateTime.UtcNow.ToString(datePattern)) : "";
            }
        }
    }


    public class RegisterResponse {

        [JsonProperty("success")]
        public bool Success;

        [JsonProperty("details")]
        public string SourceID;

        private RegisterResponse() { }
    }
}
