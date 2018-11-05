using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Drawing;
using System.Drawing.Imaging;


namespace Tester
{
    class Program
    {

        static void Main(string[] args)
        {
            // Initialize Yarp
            Network.init();



            // Create a simple form with just a button and an image
            var form = new Form()
            {
                Text = "SmartApp Tester",
                ClientSize = new Size(640, 480),
                StartPosition = FormStartPosition.CenterScreen,
                MinimizeBox = false,
                MaximizeBox = false,
                FormBorderStyle = FormBorderStyle.FixedSingle
            };

            // Image to render the video
            var buffer = new Bitmap(640, 480, PixelFormat.Format24bppRgb);
            var image = new PictureBox()
            {
                Size = new Size(640, 480),
                Location = new Point(0, 0),
                Image = buffer
            };
            form.Controls.Add(image);



            using (var streamPort = new BufferedPortImageRgb())
            using (var facesPort = new BufferedPortBottle())
            {
                streamPort.open("/camera/stream");
                facesPort.open("/camera/faces");

                while (true) {
                    var data    = facesPort.read();
                    Console.WriteLine ("Read something _" + data + "_");
                }
            }

            // Show the form and block
            Application.EnableVisualStyles();
            form.ShowDialog();
        }
    }
}
