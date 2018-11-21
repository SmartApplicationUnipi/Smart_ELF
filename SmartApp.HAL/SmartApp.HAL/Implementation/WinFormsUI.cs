using Microsoft.Extensions.Logging;
using SmartApp.HAL.Services;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace SmartApp.HAL.Implementation
{
    internal class WinFormsUI : IUserInterface
    {
        private readonly IVideoSource _videoSource;
        private readonly IAudioSource _audioSource;
        private readonly ILogger<WinFormsUI> _logger;

        public WinFormsUI(IVideoSource videoSource, IAudioSource audioSource, ILogger<WinFormsUI> logger)
        {
            _videoSource = videoSource ?? throw new ArgumentNullException(nameof(videoSource));
            _audioSource = audioSource ?? throw new ArgumentNullException(nameof(audioSource));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public void Run()
        {
            // Create a simple form with just a button and an image
            var form = new Form()
            {
                Text = "SmartApp",
                ClientSize = new Size(640, 530),
                StartPosition = FormStartPosition.CenterScreen,
                MinimizeBox = false,
                MaximizeBox = false,
                FormBorderStyle = FormBorderStyle.FixedSingle
            };

            // Image to render the video
            var buffer = new Bitmap(640, 480, PixelFormat.Format24bppRgb);
            var latestTimestamp = DateTime.Now;
            var image = new PictureBox()
            {
                Size = new Size(640, 480),
                Location = new Point(0, 0),
                Image = buffer
            };
            form.Controls.Add(image);

            // Button
            var btn = new Button()
            {
                Size = new Size(640, 50),
                Location = new Point(0, 480),
                Text = "Press and hold to record",
                Font = new Font(FontFamily.GenericSansSerif, 14.0f, FontStyle.Bold)
            };
            form.Controls.Add(btn);
            btn.MouseDown += (_, __) => { _videoSource.Start(); _audioSource.Start(); };
            btn.MouseUp += (_, __) => { _videoSource.Stop(); _audioSource.Stop(); };
            
            // Draw the rectangles for the faces on the bitmap and show it on the screen
            _videoSource.FrameReady += (_, frame) => {
                image.Invoke((Action)(() => {

                    if (latestTimestamp >= frame.Timestamp)
                    {
                        return;
                    }

                    using (var g = Graphics.FromImage(buffer))
                    using (var pen = new Pen(Color.Red, 3f))
                    using (var fpsFont = new Font(FontFamily.GenericSansSerif, 14.0f, FontStyle.Bold))
                    {
                        g.Clear(Color.LightGray);

                        foreach (var face in frame.Faces)
                        {
                            //g.DrawImage(frame.Image, face.Bounds, face.Bounds, GraphicsUnit.Pixel);
                            g.DrawRectangle(pen, face.Bounds);
                        }

                        g.DrawString($"{_videoSource.Framerate} fps", fpsFont, Brushes.Red, 0, 0);
                    }

                    latestTimestamp = frame.Timestamp;
                    image.Refresh();
                }));
            };

            // Show the form and block
            Application.EnableVisualStyles();
            form.ShowDialog();
        }
    }
}
