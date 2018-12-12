using System;
using System.Configuration;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using DirectShow.Capture;
using Newtonsoft.Json.Linq;
using KBWrapper;





namespace InteractionsLogger
{

    // =================
    // ConfigKeys struct
    struct ConfigKeys
    {
        public static string OutputFileBasePath = "OutputFileBasePath";
        public static string MicrophoneIndex = "MicrophoneIndex";
        public static string WebcamIndex = "WebcamIndex";
    }




    // =============
    // Program class
    class Program
    {
        private static string recordFileBasePath = "./";
        private static int microphoneIndex = 0;
        private static int webcamIndex = 0;

        private static KBWrapper.Wrapper wrapper;
        private static bool kbConnected = false;

        private static Filters filters;
        private static Capture currentCapture;
        private static bool isRecording;




        private static void setupKb ()
        {
            wrapper = new KBWrapper.Wrapper();


            wrapper.OnOpen += (sender, e) => {
                kbConnected = true;
                isRecording = false;
                Console.WriteLine("Wrapper: onOpen");
            };

            wrapper.OnClose += (sender, e) => {
                if (isRecording)
                    stopRecording();
                kbConnected = false;
            };

            wrapper.OnConnected += (sender, e) => {
                Console.WriteLine("Wrapper: OnConnected");
            };

            wrapper.OnMessage += (sender, e) => {
                Console.WriteLine("Wrapper: onMessage: " + e.Value);
                if (e.Value == true)
                {
                    // Starting new capture
                    Console.WriteLine("Wrapper: starting new capture named    " + e.InteractionName + "\n");
                    startRecording(e.InteractionName);
                }
                else
                {
                    // Stopping current capture
                    Console.WriteLine("Wrapper: stopping current capture\n");
                    stopRecording();
                }
            };

            wrapper.OnError += (sender, e) => {
                Console.WriteLine("Wrapper: onError " + e.message);
            };


            int i = 0;
            wrapper.Connect();
            while (!kbConnected && i< 10)
            {
                System.Threading.Thread.Sleep(5000);
                wrapper.Connect();
            }

            if (i >= 10)
            {
                Console.WriteLine("Cannot connect to KB!\nEXITING");
                throw new System.Exception ();
            }
        }




        private static void readConfiguration () {
            try
            {
                string basePath = ConfigurationManager.AppSettings[ConfigKeys.OutputFileBasePath];
                string micIndex = ConfigurationManager.AppSettings[ConfigKeys.MicrophoneIndex];
                string wcIndex = ConfigurationManager.AppSettings[ConfigKeys.WebcamIndex];

                if (basePath != null)
                    recordFileBasePath = basePath;

                if (wcIndex != null)
                    microphoneIndex = Int32.Parse(wcIndex);

                if (micIndex != null)
                    microphoneIndex = Int32.Parse(micIndex);
            }
            catch (ConfigurationErrorsException)
            {
                Console.WriteLine("Error reading app settings");
                throw;
            }
        }




        private static void setup (string[] args)
        {
            filters = new Filters();


            readConfiguration();

            if (webcamIndex >= filters.VideoInputDevices.Count || microphoneIndex >= filters.AudioInputDevices.Count)
            {
                Console.WriteLine("Inserted Wrong index of audio or video input!");
                Console.WriteLine("VideoInputDevices.Count   " + filters.VideoInputDevices.Count);
                Console.WriteLine("AuioInputDevices.Count   " + filters.AudioInputDevices.Count);

                throw new System.Exception();
            }


            if (File.Exists(recordFileBasePath))
            {
                // This path is a file: wrong values!
                Console.WriteLine("Inserted path is a file! Exiting");
                throw new System.Exception();
            }
            else if (Directory.Exists(recordFileBasePath))
            {
                // This path is a directory: do nothing
                Console.WriteLine("Inserted path is a directory: good choice!");
            }
            else
            {
                // This path doesn't exists: creating a directory
                Console.WriteLine("Inserted path doesn't exist: creating this path..");
                Directory.CreateDirectory(recordFileBasePath);
            }

            setupKb();



            Console.WriteLine("Setup done!");
            Console.WriteLine("\trecording file base path: " + recordFileBasePath);
            Console.WriteLine("\twebcam index: " + webcamIndex);
            Console.WriteLine("\tmicrophone index: " + microphoneIndex);
        }



        private static void startRecording(string filename)
        {
            Capture newCap;

            if (currentCapture != null)
            {
                // Another one record is running: stopping current record and starting a new one
                stopRecording();
            }

            newCap = new Capture(filters.VideoInputDevices[webcamIndex], filters.AudioInputDevices[microphoneIndex]);
            newCap.Filename = recordFileBasePath + "/" + filename + ".mp4";
            newCap.Cue();
            newCap.Start();

            isRecording = true;
            currentCapture = newCap;
        }



        private static void stopRecording()
        {
            currentCapture.Stop();
            currentCapture.Dispose();

            currentCapture = null;
            isRecording = false;
        }




        static void Main(string[] args)
        {
            setup(args);

            Console.WriteLine("\nType   'quit'   to exit");

            while (Console.ReadLine() != "quit") {}

            if (wrapper != null)
                wrapper.Close();
        }
    }
}
