using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Services
{
    static class VideoSourceFactory
    {

        static private List<KeyValuePair<IVideoSource, int>> _videoSources = new List<KeyValuePair<IVideoSource, int>>();

        public static void RegisterVideoSource(IVideoSource videoSource, int minPriority)
        {
            int i = 0;
            foreach(KeyValuePair<IVideoSource, int> p in _videoSources)
            {
                if (p.Value < minPriority) break;
                i++;
            }
            _videoSources.Insert(i, new KeyValuePair<IVideoSource, int>(videoSource, minPriority));
        }

        public static IVideoSource GetVideoSource()
        {
            foreach (KeyValuePair<IVideoSource, int> p in _videoSources)
            {
                if (p.Key.IsAvailable) return p.Key;
            }
            return null;
        }
    }
}
