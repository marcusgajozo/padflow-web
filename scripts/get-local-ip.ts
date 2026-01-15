import os from "os";

export function getLocalIP() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const ifaces = interfaces[name];

    if (ifaces) {
      for (const iface of ifaces) {
        if (iface.family === "IPv4" && !iface.address.startsWith("127.")) {
          return iface.address;
        }
      }
    }
  }

  return "localhost";
}
