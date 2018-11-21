using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SmartApp.HAL.Services
{
    public interface IUserInterface
    {
        /// <summary>
        /// Runs the event loop of the user application. This is a blocking call.
        /// </summary>
        void Run();
    }
}
