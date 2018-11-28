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
        private readonly IVideoManager _videoManager;
        private readonly ILogger<WinFormsUI> _logger;

        public WinFormsUI(IVideoSource videoSource, IVideoManager videoManager, ILogger<WinFormsUI> logger)
        {
            _videoSource = videoSource ?? throw new ArgumentNullException(nameof(videoSource));
            _videoManager = videoManager ?? throw new ArgumentNullException(nameof(videoManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public void Run()
        {
            const int W = 640;
            const int H = 360;

            // Create a simple form with just a button and an image
            var form = new Form()
            {
                Text = "SmartApp",
                ClientSize = new Size(W, H + 50),
                StartPosition = FormStartPosition.CenterScreen,
                MinimizeBox = false,
                MaximizeBox = false,
                FormBorderStyle = FormBorderStyle.FixedSingle
            };

            // Image to render the video
            var buffer = new Bitmap(W, H, PixelFormat.Format24bppRgb);
            var latestTimestamp = DateTime.Now;
            var image = new PictureBox()
            {
                Size = new Size(W, H),
                Location = new Point(0, 0),
                Image = buffer
            };
            form.Controls.Add(image);

            // Button
            var btn = new Button()
            {
                Size = new Size(W, 50),
                Location = new Point(0, H),
                Text = "Click to start recording",
                ForeColor = Color.Black,
                Font = new Font(FontFamily.GenericSansSerif, 14.0f, FontStyle.Bold)
            };
            form.Controls.Add(btn);

            var active = false;
            btn.Click += (_, __) =>
            {
                if (active)
                {
                    _videoSource.Stop();
                    btn.ForeColor = Color.Black;
                    btn.Text = "Click to start recording";
                }
                else
                {
                    _videoSource.Start();
                    btn.ForeColor = Color.Red;
                    btn.Text = "Click to stop recording";
                }

                active = !active;
            };

            // Keep track of when the user is engaged
            bool engaged = false;
            _videoManager.IsEngagedChanged += (_, e) =>
            {
                engaged = e;
                image.Invalidate();
            };
            
            // Draw the rectangles for the faces on the bitmap and show it on the screen
            _videoSource.FrameReady += (_, frame) => {
                image.Invoke((Action)(() => {

                    if (latestTimestamp >= frame.Timestamp)
                    {
                        return;
                    }

                    using (var g = Graphics.FromImage(buffer))
                    using (var pen = new Pen(Color.Red, 3f))
                    using (var font = new Font(FontFamily.GenericSansSerif, 14.0f, FontStyle.Bold))
                    {
                        g.Clear(Color.LightGray);

                        // Draw the full frame
                        g.DrawImage(frame.Image.Bitmap, new Rectangle(0, 0, W, H), new Rectangle(0, 0, frame.FrameWidth, frame.FrameHeight), GraphicsUnit.Pixel);

                        var wratio = (float) frame.FrameWidth / (float) W;
                        var hratio = (float) frame.FrameHeight / (float) H;

                        foreach (var face in frame.Faces)
                        {
                            // Scale the bounds of the face to fit on the canvas
                            var rect = new Rectangle(
                                (int) (face.Bounds.X / wratio),
                                (int) (face.Bounds.Y / hratio),
                                (int) (face.Bounds.Width / wratio),
                                (int) (face.Bounds.Height / hratio)
                            );

                            g.DrawRectangle(pen, rect);
                        }

                        // Print current fps value
                        g.DrawString($"{_videoSource.Framerate} fps", font, Brushes.Red, 0, 0);

                        // Print the engagement state
                        if (engaged)
                        {
                            g.DrawString("User engaged", font, Brushes.DarkGreen, 0, H - font.Height);
                        }
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
