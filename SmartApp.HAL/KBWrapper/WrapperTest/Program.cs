using System;
using System.Threading;
using KBWrapper;

namespace WrapperTest {

    class MainClass {

        public static void Main(string[] args) {

            KBWrapper.Wrapper w = new KBWrapper.Wrapper();
            w.OnOpen += (sender, e) => {
                Console.WriteLine("Wrapper: onOpen");
            };

            w.OnClose += (sender, e) => {
                Console.WriteLine("Wrapper: onClose");
            };

            w.OnConnected += (sender, e) => {
                Console.WriteLine("Wrapper: OnConnected");
                w.WriteUserEngaged();
                Thread.Sleep(20000);
                w.RemoveUserEngaged();
            };

            w.OnMessage += (sender, e) => {
                Console.WriteLine("Wrapper: onMessage: " + e.asString);
            };

            w.OnError += (sender, e) => {
                Console.WriteLine("Wrapper: onError " + e.message);
            };

            w.Connect(); //

            Thread.Sleep(40000);

        }
    }
}
