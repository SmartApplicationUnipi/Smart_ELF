from Bindings.HALInterface import HALInterface
import logging


handler = logging.StreamHandler()
handler.setFormatter(logging.Formatter(fmt="%(asctime)s [%(levelname)s] %(name)s: %(message)s"))

logger = logging.getLogger("HALInteractionLib")
logger.setLevel(logging.DEBUG)
logger.addHandler(handler)

logger = logging.getLogger("HALInteractionLib.Thread")
logger.propagate = False
logger.setLevel(logging.INFO)
logger.addHandler(handler)
