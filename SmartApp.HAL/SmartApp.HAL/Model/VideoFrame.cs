using System;
using System.Collections.Generic;
using System.Drawing;
using Emgu.CV;
using Emgu.CV.Structure;

namespace SmartApp.HAL.Model
{
    public class VideoFrame
    {

        public VideoFrame(DateTime timestamp, IList<Face> faces, Image<Bgr, byte> image, int frameWidth, int frameHeight)
        {
            Timestamp = timestamp;
            Faces = faces ?? throw new ArgumentNullException(nameof(faces));
            Image = image ?? throw new ArgumentNullException(nameof(image));
            FrameWidth = frameWidth;
            FrameHeight = frameHeight;
        }

        public DateTime Timestamp { get; private set; }
        public IList<Face> Faces { get; private set; }
        public Image<Bgr, byte> Image { get; private set; }
        public int FrameWidth { get; private set; }
        public int FrameHeight { get; private set; }


        public struct Face
        {
            public Face(Rectangle bounds, long id, float z, bool isSpeaking)
            {
                Bounds = bounds;
                ID = id;
                Z = z;
                IsSpeaking = isSpeaking;
            }

            public Rectangle Bounds { get; private set; }
            public long ID { get; private set; }
            public float Z { get; private set; }
            public bool IsSpeaking { get; private set; }
        }
    }
}