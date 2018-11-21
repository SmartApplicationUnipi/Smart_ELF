using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Model
{
    public class Options
    {
        public IPAddress BindToAddress { get; set; }
        public int AudioPort { get; set; }
        public int VideoPort { get; set; }
    }
}
