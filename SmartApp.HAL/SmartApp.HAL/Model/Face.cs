using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Model
{
    public class Face
    {
        public Face(Rectangle bounds)
        {
            Bounds = bounds;
        }

        public Rectangle Bounds { get; private set; }
    }
}
