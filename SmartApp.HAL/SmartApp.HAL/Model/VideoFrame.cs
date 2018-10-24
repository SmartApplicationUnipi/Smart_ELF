using System;
using System.Collections.Generic;
using System.Drawing;

namespace SmartApp.HAL.Model
{
    public class VideoFrame
    {
        public VideoFrame(DateTime timestamp, IList<Face> faces, Bitmap image)
        {
            Timestamp = timestamp;
            Faces = faces ?? throw new ArgumentNullException("faces");
            Image = image ?? throw new ArgumentNullException("data");
        }

        public DateTime Timestamp { get; private set; }
        public IList<Face> Faces { get; private set; }
        public Bitmap Image { get; private set; }
    }
}