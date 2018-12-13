using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Services
{
    public interface IVideoManager
    {
        void Start();

        bool IsEngaged { get; }

        float Framerate { get; set; }
        
    }
}
